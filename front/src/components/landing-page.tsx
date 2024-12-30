import { Button } from "./ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Timer, Target, Calendar, BookOpen, BarChart2, Tags, Sparkles, ArrowRight } from "lucide-react"
import { SciFiClock } from "./sci-fi-clock"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useAuth } from "@/context/auth-context"

export function LandingPage() {

    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/timers');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>

            {/* Hero Section */}
            <div className="container flex flex-col items-center justify-center min-h-screen mx-auto px-6 py-16 text-center relative overflow-hidden">
                <div className="absolute top-[5%] left-[50%] w-full h-full">
                    <SciFiClock />
                </div>
                <div className="absolute hidden sm:block top-[50%] left-0 w-full h-full">
                    <SciFiClock />
                </div>
                <div className="absolute hidden sm:block top-[90%] left-[80%] w-full h-full">
                    <SciFiClock />
                </div>

                {/* Scanning Lines */}
                <div className={cn(
                    "absolute z-30 animate-scan top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                )} />
                <div className={cn(
                    "absolute z-30 animate-scan-reverse left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent delay-1000"
                )} />

                <div className="relative h-screen z-10 max-w-5xl space-y-8">
                    {/* Hero Badge */}
                    <div className="hidden sm:inline-block animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50 rounded-full" />
                            <span className="relative inline-block px-4 py-1 text-sm font-medium text-primary border border-primary/50 rounded-full">
                                Welcome to the Future of Time Management
                            </span>
                        </div>
                    </div>

                    {/* Hero Title */}
                    <h1 className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground animate-fade-in-up">
                        Track Your Time, Achieve Your Goals
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-200">
                        A comprehensive time tracking and goal management solution that helps you stay focused,
                        measure progress, and accomplish more.
                    </p>

                    <div className="flex gap-4 justify-center animate-fade-in-up delay-300">
                        <Link to="/signup">
                            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group relative">
                                <span className="absolute inset-0 bg-primary/20 blur-sm group-hover:blur-md transition-all" />
                                <span className="relative flex items-center gap-2">
                                    Get Started Free <Sparkles className="w-4 h-4 animate-pulse" />
                                </span>
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="backdrop-blur-sm bg-background/50">
                                Sign In <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="relative bg-muted/50 backdrop-blur-sm py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl leading-[50px] font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                        Everything you need to stay productive
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Timer className="h-8 w-8" />}
                            title="Smart Timer Tracking"
                            description="Track your time with customizable timers. Set durations, add tags, and monitor progress in real-time."
                        />
                        <FeatureCard
                            icon={<Target className="h-8 w-8" />}
                            title="Goal Management"
                            description="Set and track goals with flexible time-based or count-based targets. Monitor progress and celebrate achievements."
                        />
                        <FeatureCard
                            icon={<Calendar className="h-8 w-8" />}
                            title="Daily Planning"
                            description="Organize your tasks and timers effectively. Plan your day and stay on top of your schedule."
                        />
                        <FeatureCard
                            icon={<BookOpen className="h-8 w-8" />}
                            title="Journal Entries"
                            description="Keep track of your thoughts and progress with integrated journaling features."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="h-8 w-8" />}
                            title="Detailed Analytics"
                            description="Gain insights from comprehensive statistics and visualizations of your time usage."
                        />
                        <FeatureCard
                            icon={<Tags className="h-8 w-8" />}
                            title="Tag Organization"
                            description="Categorize and filter your timers and goals with a flexible tagging system."
                        />
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="container mx-auto px-6 py-16 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                <div className="relative">
                    <h2 className="text-4xl leading-[50px] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                        Ready to boost your productivity?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of users who are already tracking their time more effectively.
                    </p>
                    <Link to="/signup">
                        <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group relative px-8">
                            <span className="absolute inset-0 bg-primary/20 blur-sm group-hover:blur-md transition-all" />
                            <span className="relative flex items-center gap-2">
                                Start Your Free Account <ArrowRight className="w-4 h-4" />
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative bg-muted/50 backdrop-blur-sm py-8">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} TimeTracker. All rights reserved.
                        </p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-background p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-primary mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
        </div>
    )
}