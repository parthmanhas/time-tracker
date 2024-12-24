import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { API } from "@/config/api"
import { SciFiClock } from "../sci-fi-clock"

export function Signup() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(API.getUrl('SIGNUP'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Signup failed')
      }

      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background text */}
        <div className="absolute top-[30%] left-[40%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">BEGIN</p>
        </div>
        <div className="absolute top-[-20%] left-[10%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">CREATE</p>
        </div>
        <div className="absolute top-[-60%] left-[-40%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[10vw] font-bold text-primary/[0.02] leading-none tracking-tighter">JOURNEY</p>
        </div>
        <div className="absolute top-[50%] left-[-40%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[10vw] font-bold text-primary/[0.02] leading-none tracking-tighter">START</p>
        </div>
        <div className="absolute top-[90%] left-[60%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[10vw] font-bold text-primary/[0.02] leading-none tracking-tighter">FUTURE</p>
        </div>

        {/* Animated elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
        <div className="absolute top-[20%] right-[10%] opacity-10">
          <SciFiClock />
        </div>
        <div className="absolute bottom-[20%] left-[5%] opacity-10">
          <SciFiClock />
        </div>

        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-100">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,var(--primary)_49%,var(--primary)_51%,transparent_52%)] bg-[length:100px_100px]" />
        </div>
      </div>

      {/* Signup card with glass effect */}
      <Card className="w-[380px] border-primary/20 bg-background/80 backdrop-blur-sm relative z-10">
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/0 to-primary/5" />
        </div>
        <CardHeader className="space-y-1 relative">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Begin your productivity journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="relative">
            <div className="grid w-full items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? "Creating account..." : "Create account"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 group-hover:translate-x-full duration-500" />
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 