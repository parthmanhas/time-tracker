export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export type PaymentProvider = 'stripe' | 'razorpay';

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndsAt: string;
  provider: PaymentProvider;
  priceId?: string;
  subscriptionId?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripeProductId?: string;
  stripePriceId?: string;
  razorpayPlanId?: string;
}
