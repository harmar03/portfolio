/**
 * Módulo: gestión de tema claro/oscuro
 *
 * Demuestra:
 * · Named exports (sin default export)
 * · localStorage para persistencia entre sesiones
 * · window.matchMedia para detectar preferencia del SO
 * · addEventListener en un MediaQueryList
 * · Patrón de cleanup (retorna función para remover listener)
 */

const STORAGE_KEY = 'mc-portfolio-theme'

/**
 * Lee el tema guardado por el usuario.
 * Si no hay preferencia guardada, lee la del sistema operativo.
 * @returns {'dark' | 'light'}
 */
export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) ?? getSystemTheme()
}

/**
 * Detecta la preferencia de tema del sistema operativo.
 * @returns {'dark' | 'light'}
 */
export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Aplica el tema al documento y lo guarda en localStorage.
 * @param {'dark' | 'light'} theme
 */
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

/**
 * Observa cambios en la preferencia del SO.
 * Solo actúa si el usuario no ha elegido un tema manualmente.
 *
 * @param {(theme: 'dark' | 'light') => void} callback
 * @returns {() => void} Función para dejar de escuchar (cleanup)
 */
export function watchSystemTheme(callback) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (/** @type {MediaQueryListEvent} */ e) => {
    // Respetar la preferencia manual del usuario
    if (!localStorage.getItem(STORAGE_KEY)) {
      callback(e.matches ? 'dark' : 'light')
    }
  }

  mq.addEventListener('change', handler)

  // Retorna cleanup function — patrón común en JS moderno
  return () => mq.removeEventListener('change', handler)
}
