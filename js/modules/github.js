/**
 * Módulo: GitHub API
 *
 * Demuestra:
 * · Named exports
 * · async / await con try / catch / finally
 * · fetch con AbortController y timeout manual
 * · Promise.allSettled para carga paralela con manejo de fallas
 * · new URL() para construir URLs seguras
 * · Headers en fetch
 */

const BASE   = 'https://api.github.com'
const USER   = 'harmar03'
const PINNED = [
  'proyecto-personal-if7102',
  'tarea2-c20990',
  'Investigacion-G5-Weather-SolidJS',
  'Gu-a-Turistica-Multimedia-de-CR',
]

/**
 * Wrapper de fetch con timeout via AbortController.
 * @param {string} path   - Ruta relativa a la API (ej. /users/foo/repos)
 * @param {number} [ms=8000] - Timeout en milisegundos
 */
async function apiFetch(path, ms = 8000) {
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), ms)

  try {
    const url = new URL(path, BASE)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
    }

    return await res.json()
  } finally {
    clearTimeout(timerId)
  }
}

/**
 * Obtiene los repositorios públicos del usuario ordenados por fecha.
 * @returns {Promise<Array>}
 */
export async function fetchRepos() {
  const repos = await apiFetch(`/users/${USER}/repos?sort=updated&per_page=30`)

  const pinned = repos.filter(r => PINNED.includes(r.name))
  const rest   = repos
    .filter(r => !PINNED.includes(r.name) && !r.fork && r.description?.trim())
    .slice(0, 6 - pinned.length)

  return [...pinned, ...rest].slice(0, 6)
}

/**
 * Obtiene el perfil público del usuario.
 * @returns {Promise<Object>}
 */
export async function fetchProfile() {
  return apiFetch(`/users/${USER}`, 5000)
}

/**
 * Carga repos y perfil en paralelo.
 * Promise.allSettled garantiza que un fallo parcial no rompe todo.
 *
 * @returns {Promise<{ repos: Array, profile: Object|null }>}
 */
export async function loadPortfolioData() {
  const [reposResult, profileResult] = await Promise.allSettled([
    fetchRepos(),
    fetchProfile(),
  ])

  return {
    repos:   reposResult.status   === 'fulfilled' ? reposResult.value   : [],
    profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
  }
}
