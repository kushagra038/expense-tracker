"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Eye, EyeOff } from "lucide-react"

export function AuthPage() {
  const { login, signup } = useAuth()
  const [activeTab, setActiveTab] = useState("login")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirm, setSignupConfirm] = useState("")
  const [signupError, setSignupError] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!validateEmail(loginEmail)) {
      setLoginError("Please enter a valid email address")
      return
    }
    if (loginPassword.length < 6) {
      setLoginError("Password must be at least 6 characters")
      return
    }
    const result = login(loginEmail, loginPassword)
    if (!result.success) {
      setLoginError(result.error || "Login failed")
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")
    if (!signupName.trim()) {
      setSignupError("Please enter your name")
      return
    }
    if (!validateEmail(signupEmail)) {
      setSignupError("Please enter a valid email address")
      return
    }
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters")
      return
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match")
      return
    }
    const result = signup(signupName.trim(), signupEmail, signupPassword)
    if (!result.success) {
      setSignupError(result.error || "Signup failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">ExpenseTracker</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your finances with ease
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <CardTitle className="text-lg">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                  {loginError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {loginError}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="mt-2 w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  <CardTitle className="text-lg">Create account</CardTitle>
                  <CardDescription>Enter your details to get started</CardDescription>
                  {signupError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {signupError}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="mt-2 w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
