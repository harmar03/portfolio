/**
 * main.js — Entry point del CV
 *
 * Demuestra:
 * · ES Modules: static imports y dynamic import()
 * · Import Map (@components/, @modules/)
 * · DOM: querySelector, createElement, replaceChildren, setAttribute
 * · Eventos: addEventListener con opciones (once, passive)
 * · Custom events recibidos desde Web Components (composed: true)
 * · IntersectionObserver para animar barras de skills e idiomas
 * · async / await con manejo de errores
 */

import '@components/nav-header.js'
import { loadPortfolioData } from '@modules/github.js'
import { getStoredTheme, applyTheme, watchSystemTheme } from '@modules/theme.js'


// ── 1. Tema ───────────────────────────────────────────────────
// Aplica el tema guardado; si no hay ninguno, usa dark como default
const saved = localStorage.getItem('mc-portfolio-theme')
applyTheme(saved ?? 'dark')

const stopWatchingTheme = watchSystemTheme(applyTheme)


// ── 2. Proyectos desde GitHub ─────────────────────────────────
async function renderProjects() {
  const grid = document.getElementById('projects-grid')
  if (!grid) return

  try {
    const { repos } = await loadPortfolioData()

    // Dynamic import — se carga solo cuando hay datos (rendimiento web)
    await import('@components/project-card.js')

    grid.setAttribute('aria-busy', 'false')
    if (repos.length) {
      grid.replaceChildren(...repos.map(createProjectCard))
    } else {
      grid.replaceChildren(createErrorMsg())
    }
  } catch (err) {
    console.error('[cv] Error cargando proyectos:', err)
    document.getElementById('projects-grid')?.replaceChildren(createErrorMsg())
  }
}

/** @param {Object} repo */
function createProjectCard(repo) {
  const card = document.createElement('project-card')
  card.setAttribute('href',  repo.html_url)
  card.setAttribute('stars', String(repo.stargazers_count))
  card.setAttribute('role',  'listitem')

  const title = document.createElement('h3')
  title.slot = 'title'
  title.textContent = repo.name.replaceAll('-', ' ')

  const desc = document.createElement('p')
  desc.slot = 'description'
  desc.textContent = repo.description ?? 'Sin descripción'

  const tags = document.createElement('div')
  tags.slot = 'tags'
  tags.className = 'tag-list'

  if (repo.language) {
    const tag = document.createElement('span')
    tag.className = 'tag'
    tag.textContent = repo.language
    tags.appendChild(tag)
  }

  card.append(title, desc, tags)
  return card
}

function createErrorMsg() {
  const p = document.createElement('p')
  p.style.cssText = 'grid-column:1/-1;padding:1.5rem;font-size:.85rem;color:var(--text-3);'
  p.textContent = 'No se pudieron cargar los proyectos — revisá github.com/harmar03'
  return p
}


// ── 3. IntersectionObserver: animar barras de skills e idiomas ─
function setupBars() {
  const fills = document.querySelectorAll('.skill-item__fill, .lang-item__fill')
  if (!fills.length) return

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-animated')
        observer.unobserve(entry.target)
      }
    }),
    { threshold: 0.3 }
  )

  fills.forEach(el => observer.observe(el))
}


// ── 4. Custom event de nav-header (tema cambiado) ─────────────
document.addEventListener('theme-change', (/** @type {CustomEvent} */ e) => {
  applyTheme(e.detail.theme)
})


// ── 5. Botón PDF ──────────────────────────────────────────────
document.getElementById('print-btn')
  ?.addEventListener('click', () => window.print())


// ── 6. Cleanup ────────────────────────────────────────────────
window.addEventListener('unload', stopWatchingTheme, { once: true })


// ── Init ──────────────────────────────────────────────────────
renderProjects()
setupBars()
