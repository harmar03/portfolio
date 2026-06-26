/**
 * Web Component: <nav-header>
 *
 * Demuestra:
 * · Custom Elements (class extends HTMLElement)
 * · Shadow DOM con attachShadow({ mode: 'open' })
 * · <template> para markup encapsulado
 * · lifecycle: connectedCallback / disconnectedCallback
 * · ::part() — expone el botón de tema al CSS externo
 * · CSS custom properties atravesando el Shadow DOM
 * · Custom Events con dispatchEvent + composed: true
 * · Private class fields (#) — JS moderno
 */

const template = document.createElement('template')
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      position: fixed;
      inset-block-start: 0;
      inset-inline: 0;
      z-index: var(--z-nav, 100);
      transition: background-color 300ms ease, box-shadow 300ms ease;
    }

    :host([data-scrolled]) {
      background-color: color-mix(in oklch, var(--bg, #0d0f1a) 85%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: var(--shadow-sm, 0 1px 4px oklch(0% 0 0 / 40%));
    }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 2rem;
      max-width: 1100px;
      margin-inline: auto;
    }

    /* Logo monoespaciado */
    .logo {
      font-weight: 700;
      font-size: 1.1rem;
      font-family: var(--font-mono, monospace);
      color: var(--color-brand-light, #a78bfa);
      text-decoration: none;
      letter-spacing: -0.02em;
      transition: opacity 150ms ease;
    }
    .logo:hover { opacity: 0.8; }
    .logo .accent { color: var(--color-accent, #34d399); }

    /* Lista de links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      list-style: none;
    }

    .nav-links a {
      color: var(--text-muted, #9ca3af);
      text-decoration: none;
      padding: 0.4rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 150ms ease, background-color 150ms ease;
    }
    .nav-links a:hover {
      color: var(--text, #f0f0f5);
      background: color-mix(in oklch, var(--text, #f0f0f5) 8%, transparent);
    }

    /* Botón de tema — expuesto con ::part() */
    button[part="theme-toggle"] {
      background: color-mix(in oklch, var(--surface, #1a1d2e) 80%, transparent);
      border: 1px solid var(--border, rgba(255,255,255,0.1));
      border-radius: 9999px;
      color: var(--text-muted, #9ca3af);
      padding: 0.35rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: border-color 150ms ease, color 150ms ease;
    }
    button[part="theme-toggle"]:hover {
      border-color: var(--color-brand, #7c3aed);
      color: var(--text, #f0f0f5);
    }

    /* Botón hamburguesa para mobile */
    .menu-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      padding: 0.4rem;
      cursor: pointer;
    }
    .menu-btn span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text, #f0f0f5);
      border-radius: 2px;
      transition: transform 250ms ease, opacity 250ms ease;
    }
    .menu-btn[aria-expanded="true"] span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .menu-btn[aria-expanded="true"] span:nth-child(2) {
      opacity: 0;
    }
    .menu-btn[aria-expanded="true"] span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    @media (max-width: 640px) {
      .menu-btn { display: flex; }

      .nav-links {
        display: none;
        position: absolute;
        inset-block-start: 100%;
        inset-inline: 0;
        flex-direction: column;
        align-items: stretch;
        background: var(--bg, #0d0f1a);
        border-bottom: 1px solid var(--border);
        padding: 0.5rem 1rem 1rem;
        gap: 0.125rem;
      }
      .nav-links.is-open {
        display: flex;
      }
      .nav-links a {
        padding: 0.6rem 1rem;
        border-radius: var(--r-md, 0.75rem);
      }
      button[part="theme-toggle"] {
        align-self: flex-start;
        margin-block-start: 0.25rem;
      }
    }
  </style>

  <nav aria-label="Navegación principal">
    <a href="#inicio" class="logo">
      &lt;mc<span class="accent">/</span>&gt;
    </a>

    <button
      class="menu-btn"
      aria-label="Abrir menú de navegación"
      aria-expanded="false"
      aria-controls="nav-list"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <ul class="nav-links" id="nav-list" role="list">
      <li><a href="#sobre-mi">Sobre mí</a></li>
      <li><a href="#habilidades">Habilidades</a></li>
      <li><a href="#proyectos">Proyectos</a></li>
      <li><a href="#contacto">Contacto</a></li>
      <li>
        <button part="theme-toggle" aria-label="Cambiar tema de color">🌙</button>
      </li>
    </ul>
  </nav>
`

export class NavHeader extends HTMLElement {
  // Private class fields
  #shadow
  #themeBtn
  #menuBtn
  #navLinks
  #scrollHandler

  constructor() {
    super()
    this.#shadow = this.attachShadow({ mode: 'open' })
    this.#shadow.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.#themeBtn = this.#shadow.querySelector('[part="theme-toggle"]')
    this.#menuBtn  = this.#shadow.querySelector('.menu-btn')
    this.#navLinks = this.#shadow.querySelector('.nav-links')

    // Marcar :host cuando el usuario baja en la página
    this.#scrollHandler = () => {
      this.toggleAttribute('data-scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', this.#scrollHandler, { passive: true })

    // Toggle de tema
    this.#themeBtn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      this.#themeBtn.textContent = next === 'dark' ? '🌙' : '☀️'

      // Custom event que atraviesa el Shadow DOM (composed: true)
      this.dispatchEvent(new CustomEvent('theme-change', {
        detail: { theme: next },
        bubbles: true,
        composed: true,
      }))
    })

    // Menú hamburguesa
    this.#menuBtn.addEventListener('click', () => {
      const open = this.#navLinks.classList.toggle('is-open')
      this.#menuBtn.setAttribute('aria-expanded', String(open))
    })

    // Cerrar menú al hacer clic en un link
    this.#navLinks.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        this.#navLinks.classList.remove('is-open')
        this.#menuBtn.setAttribute('aria-expanded', 'false')
      }
    })

    // Sincronizar ícono con el tema actual
    const currentTheme = document.documentElement.dataset.theme ?? 'dark'
    this.#themeBtn.textContent = currentTheme === 'dark' ? '🌙' : '☀️'
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.#scrollHandler)
  }
}

customElements.define('nav-header', NavHeader)
