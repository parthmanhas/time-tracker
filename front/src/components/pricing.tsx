import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { PaymentService } from "@/services/payment"
import { useSubscription } from "@/context/subscription-context"
import { PricingPlan } from "@/types/payment"

const plans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 10,
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_monthly_id',
    razorpayPlanId: 'plan_monthly_id',
    features: [
      'Unlimited Timers',
      'Advanced Analytics',
      'Priority Support',
      'Custom Tags',
      'Export Data'
    ]
  },
  // ...add more plans
];

export function PricingPage() {
  const { subscription, isTrialExpired, daysLeftInTrial } = useSubscription();

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        {!subscription?.status && (
          <p className="text-xl text-muted-foreground">
            {daysLeftInTrial > 0 
              ? `${daysLeftInTrial} days left in your trial` 
              : 'Start your 30-day free trial today'}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <CardTitle>
                <div className="flex justify-between items-baseline">
                  <span>{plan.name}</span>
                  <span className="text-3xl font-bold">
                    ${plan.price}/{plan.interval}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => PaymentService.createCheckoutSession(plan.stripePriceId, 'stripe')}
                >
                  Subscribe with Stripe
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => PaymentService.createCheckoutSession(plan.razorpayPlanId, 'razorpay')}
                >
                  Pay with Razorpay
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
