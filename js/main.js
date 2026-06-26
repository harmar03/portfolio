/**
 * main.js — Entry point del portfolio
 *
 * Demuestra:
 * · ES Modules: static imports y dynamic import()
 * · Import Map (resuelto en index.html): @components/ @modules/
 * · DOM: querySelector, createElement, replaceChildren, setAttribute
 * · Eventos: addEventListener con opciones (once, passive)
 * · Custom events recibidos desde Web Components (composed: true)
 * · IntersectionObserver para reveal de secciones
 * · async / await con manejo de errores
 */

// ── Imports estáticos — se descargan junto al módulo ─────────
import '@components/nav-header.js'
import '@components/skill-badge.js'
import { loadPortfolioData } from '@modules/github.js'
import { getStoredTheme, applyTheme, watchSystemTheme } from '@modules/theme.js'


// ── 1. Tema inicial ───────────────────────────────────────────
applyTheme(getStoredTheme())

// Escuchar cambios en la preferencia del SO y aplicarlos en vivo
const stopWatchingTheme = watchSystemTheme(applyTheme)


// ── 2. Proyectos desde GitHub ─────────────────────────────────
async function renderProjects() {
  const grid = document.getElementById('projects-grid')
  if (!grid) return

  try {
    const { repos } = await loadPortfolioData()

    // Dynamic import — project-card solo se carga cuando hay datos
    // (lazy loading de módulo, técnica de js-avanzado / rendimiento)
    await import('@components/project-card.js')

    grid.setAttribute('aria-busy', 'false')

    if (repos.length === 0) {
      grid.replaceChildren(createErrorMessage())
      return
    }

    grid.replaceChildren(...repos.map(createProjectCard))

  } catch (err) {
    console.error('[portfolio] Error cargando proyectos:', err)
    const grid = document.getElementById('projects-grid')
    grid?.replaceChildren(createErrorMessage())
  }
}

/**
 * Construye un <project-card> con el repo de GitHub.
 * @param {Object} repo - Objeto de la GitHub REST API v3
 * @returns {HTMLElement}
 */
function createProjectCard(repo) {
  const card = document.createElement('project-card')
  card.setAttribute('href',  repo.html_url)
  card.setAttribute('stars', String(repo.stargazers_count))
  card.setAttribute('role',  'listitem')

  // Slot "title"
  const title = document.createElement('h3')
  title.slot = 'title'
  title.textContent = repo.name.replaceAll('-', ' ')

  // Slot "description"
  const desc = document.createElement('p')
  desc.slot = 'description'
  desc.textContent = repo.description ?? 'Sin descripción'

  // Slot "tags" — lenguaje del repo
  const tagsWrapper = document.createElement('div')
  tagsWrapper.slot = 'tags'
  tagsWrapper.className = 'tag-list'

  if (repo.language) {
    const tag = document.createElement('span')
    tag.className = 'tag'
    tag.textContent = repo.language
    tagsWrapper.appendChild(tag)
  }

  if (repo.topics?.length) {
    const topicTag = document.createElement('span')
    topicTag.className = 'tag'
    topicTag.textContent = repo.topics[0]
    tagsWrapper.appendChild(topicTag)
  }

  card.append(title, desc, tagsWrapper)
  return card
}

function createErrorMessage() {
  const p = document.createElement('p')
  p.className = 'text-muted text-center'
  p.style.gridColumn = '1 / -1'
  p.style.padding = '2rem'
  p.textContent = 'No se pudieron cargar los proyectos. Revisá directamente en GitHub ↗'
  return p
}


// ── 3. Reveal con IntersectionObserver ───────────────────────
function setupReveal() {
  // Solo revelar elementos debajo del fold inicial
  const targets = [
    ...document.querySelectorAll('.stat'),
    ...document.querySelectorAll('.about__text'),
    ...document.querySelectorAll('.section__header'),
  ]

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )

  targets.forEach(el => {
    el.classList.add('reveal')
    observer.observe(el)
  })
}


// ── 4. Custom event del nav-header (tema cambiado) ───────────
document.addEventListener('theme-change', (/** @type {CustomEvent} */ e) => {
  // El evento llega con composed:true desde el Shadow DOM del nav
  applyTheme(e.detail.theme)
})


// ── 5. Cleanup al cerrar la página ───────────────────────────
window.addEventListener('unload', () => {
  stopWatchingTheme()
}, { once: true })


// ── Init ──────────────────────────────────────────────────────
renderProjects()
setupReveal()
