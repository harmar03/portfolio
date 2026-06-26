/**
 * Web Component: <project-card href="..." stars="0" icon="📁">
 *
 * Demuestra:
 * · Shadow DOM + slots (::slotted())
 * · observedAttributes + attributeChangedCallback
 * · IntersectionObserver para reveal al hacer scroll
 * · <template> como markup reutilizable
 * · :host, :host(:hover) como selectores del propio elemento
 * · Custom event al hacer clic en el link
 */

const template = document.createElement('template')
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      opacity: 0;
      translate: 0 22px;
      transition:
        opacity   0.5s cubic-bezier(0.4, 0, 0.2, 1),
        translate 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host(.is-visible) {
      opacity: 1;
      translate: 0 0;
    }

    .card {
      height: 100%;
      background: var(--surface, #1a1d2e);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: var(--r-md, 0.75rem);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: var(--shadow-sm, 0 1px 3px oklch(0% 0 0 / 40%));
      transition:
        transform    250ms ease,
        box-shadow   250ms ease,
        border-color 250ms ease;
    }

    :host(:hover) .card {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg, 0 8px 32px oklch(0% 0 0 / 65%));
      border-color: color-mix(in oklch, var(--color-brand, #7c3aed) 45%, transparent);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .card__icon {
      font-size: 1.5rem;
      line-height: 1;
      flex-shrink: 0;
    }

    /* Link "Ver ↗" — expuesto con part para estilización externa */
    .card__link {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      color: var(--color-brand-light, #a78bfa);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.75;
      transition: opacity 150ms ease;
    }
    .card__link:hover { opacity: 1; text-decoration: underline; }

    /* Estilos para contenido proyectado con slots */
    ::slotted(h3) {
      font-size: 0.975rem;
      font-weight: 600;
      color: var(--text, #f0f0f5);
      margin: 0;
      line-height: 1.3;
    }

    ::slotted(p) {
      font-size: 0.875rem;
      color: var(--text-muted, #9ca3af);
      line-height: 1.6;
      margin: 0;
      flex-grow: 1;
      /* Limitar a 3 líneas */
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-block-start: auto;
      padding-block-start: 0.75rem;
      border-block-start: 1px solid var(--border, rgba(255,255,255,0.06));
    }

    .stars {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--text-muted, #9ca3af);
      font-size: 0.78rem;
      font-family: var(--font-mono, monospace);
    }
  </style>

  <article class="card">
    <div class="card__header">
      <span class="card__icon" part="icon">📁</span>
      <a
        class="card__link"
        part="link"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
      >Ver ↗</a>
    </div>

    <slot name="title"></slot>
    <slot name="description"></slot>

    <div class="card__footer">
      <slot name="tags"></slot>
      <span class="stars" aria-label="estrellas en GitHub">
        ⭐ <span class="stars__count">0</span>
      </span>
    </div>
  </article>
`

export class ProjectCard extends HTMLElement {
  #shadow
  #observer

  static get observedAttributes() {
    return ['href', 'stars', 'icon']
  }

  constructor() {
    super()
    this.#shadow = this.attachShadow({ mode: 'open' })
    this.#shadow.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    // Reveal con IntersectionObserver al llegar al viewport
    this.#observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.classList.add('is-visible')
          this.#observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    this.#observer.observe(this)
  }

  disconnectedCallback() {
    this.#observer?.disconnect()
  }

  attributeChangedCallback(name, _old, value) {
    switch (name) {
      case 'href': {
        const link = this.#shadow.querySelector('.card__link')
        if (link) link.href = value ?? '#'
        break
      }
      case 'stars': {
        const count = this.#shadow.querySelector('.stars__count')
        if (count) count.textContent = value ?? '0'
        break
      }
      case 'icon': {
        const icon = this.#shadow.querySelector('.card__icon')
        if (icon) icon.textContent = value ?? '📁'
        break
      }
    }
  }
}

customElements.define('project-card', ProjectCard)
