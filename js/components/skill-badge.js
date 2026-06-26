/**
 * Web Component: <skill-badge label="HTML5" icon="html" level="90">
 *
 * Demuestra:
 * · observedAttributes + attributeChangedCallback
 * · Shadow DOM con estilos encapsulados
 * · IntersectionObserver para animar la barra al entrar al viewport
 * · ::part() para exponer la barra al CSS externo
 * · Private class fields + private methods (#)
 */

const ICONS = {
  html:    '🌐',
  css:     '🎨',
  js:      '⚡',
  esm:     '📦',
  wc:      '🧩',
  async:   '⏱️',
  node:    '🖥️',
  express: '🚀',
}

const template = document.createElement('template')
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
    }

    .badge {
      background: var(--surface, #1a1d2e);
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: var(--r-md, 0.75rem);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      transition:
        transform      250ms ease,
        box-shadow     250ms ease,
        border-color   250ms ease;
    }

    .badge:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md, 0 4px 16px oklch(0% 0 0 / 55%));
      border-color: color-mix(in oklch, var(--color-brand, #7c3aed) 55%, transparent);
    }

    .badge__icon {
      font-size: 1.75rem;
      line-height: 1;
    }

    .badge__label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text, #f0f0f5);
    }

    .progress-track {
      height: 4px;
      background: color-mix(in oklch, var(--text, #f0f0f5) 10%, transparent);
      border-radius: 9999px;
      overflow: hidden;
    }

    /* ::part() expuesto para sobrescribir desde fuera si se necesita */
    .progress-bar {
      height: 100%;
      width: 0;
      border-radius: 9999px;
      background: linear-gradient(
        90deg,
        var(--color-brand, #7c3aed),
        var(--color-accent, #34d399)
      );
      transition: width 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    }

    .badge__pct {
      font-size: 0.7rem;
      font-family: var(--font-mono, monospace);
      color: var(--text-muted, #9ca3af);
      text-align: right;
    }
  </style>

  <div class="badge" part="badge">
    <span class="badge__icon" part="icon">📄</span>
    <span class="badge__label" part="label">Skill</span>
    <div class="progress-track">
      <div class="progress-bar" part="bar"></div>
    </div>
    <span class="badge__pct" part="pct">0%</span>
  </div>
`

export class SkillBadge extends HTMLElement {
  #shadow
  #observer

  static get observedAttributes() {
    return ['label', 'icon', 'level']
  }

  constructor() {
    super()
    this.#shadow = this.attachShadow({ mode: 'open' })
    this.#shadow.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.#render()

    // Animar la barra cuando el elemento entra al viewport
    this.#observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const level = this.getAttribute('level') ?? '0'
          this.#shadow.querySelector('.progress-bar').style.width = `${level}%`
          this.#observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    this.#observer.observe(this)
  }

  disconnectedCallback() {
    this.#observer?.disconnect()
  }

  attributeChangedCallback() {
    this.#render()
  }

  #render() {
    const icon  = this.getAttribute('icon')  ?? 'html'
    const label = this.getAttribute('label') ?? ''
    const level = this.getAttribute('level') ?? '0'

    const iconEl  = this.#shadow.querySelector('.badge__icon')
    const labelEl = this.#shadow.querySelector('.badge__label')
    const pctEl   = this.#shadow.querySelector('.badge__pct')

    if (iconEl)  iconEl.textContent  = ICONS[icon] ?? '📄'
    if (labelEl) labelEl.textContent = label
    if (pctEl)   pctEl.textContent   = `${level}%`
  }
}

customElements.define('skill-badge', SkillBadge)
