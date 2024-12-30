import { loadStripe } from '@stripe/stripe-js';
import { API } from '@/config/api';
import { PaymentProvider, Subscription } from '@/types/payment';

const stripePromise = loadStripe(import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'test');

export const PaymentService = {
  async createCheckoutSession(priceId: string, provider: PaymentProvider) {
    try {
      const response = await fetch(API.getUrl('CHECKOUT_SESSION'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, provider }),
      });
      
      const data = await response.json();
      
      if (provider === 'stripe') {
        const stripeInstance = await stripePromise;
        if (stripeInstance) {
          await stripeInstance.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  },

  async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await fetch(API.getUrl('SUBSCRIPTION'), {
        credentials: 'include',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  },
};
