import { Timer, LineChart, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const features = [
    {
        icon: <Timer className="h-10 w-10" />,
        title: 'Time Tracking',
        description: 'Track your time effortlessly with our intuitive timer interface.'
    },
    {
        icon: <LineChart className="h-10 w-10" />,
        title: 'Analytics',
        description: 'Get detailed insights into your productivity and time usage patterns.'
    },
    {
        icon: <Bell className="h-10 w-10" />,
        title: 'Reminders',
        description: 'Set up custom reminders to stay on track with your tasks.'
    }
];

export const WelcomePage = () => {
    const { isFirstTimeUser } = useSubscription();
    const navigate = useNavigate();
    if (isFirstTimeUser) {
        navigate('/timers');
    }
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to Time Tracker
                </h1>
                <p className="text-lg text-muted-foreground">
                    Get started with these powerful features
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-center">
                                {feature.icon}
                            </div>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                            <h3 className="font-semibold text-xl">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <Button onClick={() => navigate('/timers')} size="lg">
                    Get Started
                </Button>
            </div>
        </div>
    );
};
