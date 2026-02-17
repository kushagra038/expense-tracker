"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = localStorage.getItem("expense_tracker_current_user")
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser))
      } catch {
        localStorage.removeItem("expense_tracker_current_user")
      }
    }
    setIsLoading(false)
  }, [])

  const getUsers = useCallback((): User[] => {
    try {
      const users = localStorage.getItem("expense_tracker_users")
      return users ? JSON.parse(users) : []
    } catch {
      return []
    }
  }, [])

  const saveUsers = useCallback((users: User[]) => {
    localStorage.setItem("expense_tracker_users", JSON.stringify(users))
  }, [])

  const signup = useCallback((name: string, email: string, password: string) => {
    const users = getUsers()
    const exists = users.find((u) => u.email === email)
    if (exists) {
      return { success: false, error: "An account with this email already exists" }
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    }
    users.push(newUser)
    saveUsers(users)
    const safeUser = { ...newUser }
    setUser(safeUser)
    localStorage.setItem("expense_tracker_current_user", JSON.stringify(safeUser))
    return { success: true }
  }, [getUsers, saveUsers])

  const login = useCallback((email: string, password: string) => {
    const users = getUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      return { success: false, error: "Invalid email or password" }
    }
    setUser(found)
    localStorage.setItem("expense_tracker_current_user", JSON.stringify(found))
    return { success: true }
  }, [getUsers])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("expense_tracker_current_user")
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
