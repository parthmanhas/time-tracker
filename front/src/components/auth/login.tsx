import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { API } from "@/config/api"
import { useAuth } from '@/context/AuthContext'
import { SciFiClock } from "../sci-fi-clock"

export function Login() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(API.getUrl('LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Login failed')
      }

      const data = await response.json()
      login(data.user)
      navigate('/timers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background text */}
        <div className="absolute top-[-80%] left-[20%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">TIME</p>
        </div>
        <div className="absolute top-[-30%] left-[70%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">FLOW</p>
        </div>
        <div className="absolute top-[20%] left-[-20%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[10vw] font-bold text-primary/[0.02] leading-none tracking-tighter">PRODUCTIVITY</p>
        </div>
        <div className="absolute top-[70%] left-[20%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">ACHIEVE</p>
        </div>

        {/* Existing background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
        <div className="absolute top-[0] left-[20%] opacity-10">
          <SciFiClock />
        </div>
        <div className="absolute bottom-[40%] right-[0] opacity-10">
          <SciFiClock />
        </div>

        {/* Add diagonal lines */}
        <div className="absolute inset-0 opacity-100">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,var(--primary)_49%,var(--primary)_51%,transparent_52%)] bg-[length:100px_100px]" />
        </div>
      </div>

      {/* Login card with glass effect */}
      <Card className="w-[380px] border-primary/20 bg-background/80 backdrop-blur-sm relative z-10">
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/0 to-primary/5" />
        </div>
        <CardHeader className="space-y-1 relative">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to continue your journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="relative">
            <div className="grid w-full items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 relative">
            <Button 
              className="w-full relative overflow-hidden group" 
              type="submit" 
              disabled={isLoading}
            >
              <span className="relative z-10">
                {isLoading ? "Logging in..." : "Login"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 group-hover:translate-x-full duration-500" />
            </Button>
            <div className="flex justify-between w-full text-sm">
              <Link 
                to="/signup" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Create account
              </Link>
              <Link 
                to="/forgot-password" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 