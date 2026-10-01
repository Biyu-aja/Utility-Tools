/**
 * Folder: src/hooks/
 * Description: Stores React Custom Hooks. Custom hooks are JavaScript functions whose
 *              names start with "use" and that can call other built-in React hooks.
 *              They are used to extract and share complex stateful logic
 *              (like API calls, click-outside detection, online status monitoring)
 *              so it can be reused by multiple components without duplicate code.
 * 
 * This file: useFetch.ts (Custom Hook helper to call APIs with loading and error state handling).
 */

import { useState, useEffect } from 'react'

export function useFetch<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoading(true)
      try {
        const result = await fetchFn()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [fetchFn])

  return { data, loading, error }
}
