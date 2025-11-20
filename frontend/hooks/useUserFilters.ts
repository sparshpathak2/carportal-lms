"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type FilterType = "leads" | "users" | "dealers" | string

interface UseUserFiltersOptions {
  userId: string
  type: FilterType
}

export function useUserFilters({ userId, type }: UseUserFiltersOptions) {
  const storageKey = `userFilters:${userId}:${type}`
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // 🧩 Prevent unnecessary effects with a ref
  const isInitialMount = useRef(true)

  // ✅ Load filters from localStorage only once
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setFilters(JSON.parse(stored))
      }
    } catch (err) {
      console.warn("Error reading filters from localStorage", err)
    }
    setIsLoaded(true)
  }, [storageKey])

  // ✅ Save filters to localStorage when they change (after first load)
  useEffect(() => {
    if (!isLoaded || isInitialMount.current) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(filters))
    } catch (err) {
      console.warn("Error saving filters to localStorage", err)
    }
  }, [filters, isLoaded, storageKey])

  // ✅ Prevent save on first render
  useEffect(() => {
    if (isLoaded) {
      isInitialMount.current = false
    }
  }, [isLoaded])

  // ✅ Stable callbacks (no recreation each render)
  const applyFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    localStorage.removeItem(storageKey)
  }, [storageKey])

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }, [])

  return {
    filters,
    applyFilters,
    clearFilters,
    removeFilter,
    isLoaded,
  }
}
