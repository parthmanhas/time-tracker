import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { API } from "@/config/api"
import { SciFiClock } from "../sci-fi-clock"
import { cn } from "@/lib/utils"

export function ForgotPassword() {
  const [email, setEmail] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(API.getUrl('FORGOT_PASSWORD'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to send reset email')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background text */}
        <div className="absolute top-[40%] left-[30%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">RESET</p>
        </div>
        <div className="absolute top-[-30%] left-[50%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[15vw] font-bold text-primary/[0.02] leading-none tracking-tighter">RENEW</p>
        </div>
        <div className="absolute top-[80%] left-[-20%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[10vw] font-bold text-primary/[0.02] leading-none tracking-tighter">RECOVER</p>
        </div>
        <div className="absolute top-[20%] left-[-40%] inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="text-[10vw] font-bold text-primary/[0.02] leading-none tracking-tighter">RESTORE</p>
        </div>

        {/* Animated elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
        <div className="absolute top-[30%] left-[15%] opacity-10 rotate-45">
          <SciFiClock />
        </div>
        <div className="absolute bottom-[10%] right-[5%] opacity-10 -rotate-45">
          <SciFiClock />
        </div>

        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-100">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,var(--primary)_49%,var(--primary)_51%,transparent_52%)] bg-[length:100px_100px]" />
        </div>
      </div>

      {/* Card with glass effect */}
      <Card className="w-[380px] border-primary/20 bg-background/80 backdrop-blur-sm relative z-10">
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/0 to-primary/5" />
        </div>
        <CardHeader className="space-y-1 relative">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive reset instructions
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="relative space-y-4">
            <div className="p-3 rounded-md bg-primary/10 text-primary">
              Password reset instructions have been sent to your email.
            </div>
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/80 transition-colors block text-center"
            >
              Return to login
            </Link>
          </CardContent>
        ) : (
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
                  {isLoading ? "Sending..." : "Send reset link"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 group-hover:translate-x-full duration-500" />
              </Button>
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 transition-colors text-sm text-center"
              >
                Back to login
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
} 