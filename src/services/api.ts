/**
 * Folder: src/services/
 * Description: Stores functions for interacting with external APIs (backend)
 *              or other external services (e.g. Axios, Fetch API, Firebase, etc.).
 * 
 * This file: api.ts (Configures global HTTP/API calls to the backend server).
 */

// Get BASE_URL from Vite's environment variables (.env)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Helper for fetch API calls with basic error handling.
 * Can be imported by other service files (e.g. user.ts).
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  const url = `${cleanBaseUrl}/${cleanEndpoint}`
  const token = localStorage.getItem("token")
  const { headers, ...restOptions } = options || {}

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  })

  if (!response.ok) {
    let errMsg = `API ERROR: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      errMsg = errorData.message || errMsg
    }
    catch{
    }
    throw new Error(errMsg)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
