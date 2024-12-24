import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { Timer, Target, Calendar, BookOpen, BarChart2, Tags } from "lucide-react"
import { SciFiClock } from "./sci-fi-clock"
import { cn } from "@/lib/utils"

export function LandingPage() {

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="container flex flex-col items-center justify-center h-screen mx-auto px-6 py-16 text-center relative overflow-hidden">
                <SciFiClock />
                <div className="absolute top-[50%] left-0 w-full h-full">
                    <SciFiClock />
                </div>
                <div className="absolute top-[90%] left-[80%] w-full h-full">
                    <SciFiClock />
                </div>
                <div
                    className={cn(
                        "absolute z-30 animate-scan top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent",
                    )}
                />
                <div className="relative z-10">
                    <h1 className="text-8xl md:text-9xl font-bold mb-6">
                        Track Your Time, <span className="text-primary">Achieve Your Goals</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        A comprehensive time tracking and goal management solution that helps you stay focused,
                        measure progress, and accomplish more.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/signup">
                            <Button size="lg">Get Started Free</Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline">Sign In</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-muted py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
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
            <div className="container mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-bold mb-6">
                    Ready to boost your productivity?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of users who are already tracking their time more effectively.
                </p>
                <Link to="/signup">
                    <Button size="lg" className="px-8">
                        Start Your Free Account
                    </Button>
                </Link>
            </div>

            {/* Footer */}
            <footer className="bg-muted py-8">
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