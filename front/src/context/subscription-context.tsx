import React, { createContext, useContext, useEffect, useState } from 'react';
import { Subscription } from '@/types/payment';
import { PaymentService } from '@/services/payment';
import { useAuth } from './auth-context';

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
  refreshSubscription: () => Promise<void>;
  isFirstTimeUser: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchSubscription = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await PaymentService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [isAuthenticated]);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited && isAuthenticated) {
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setIsFirstTimeUser(false);
    }
  }, [isAuthenticated]);

  const isTrialExpired = subscription?.trialEndsAt 
    ? new Date(subscription.trialEndsAt) < new Date() 
    : false;

  const daysLeftInTrial = subscription?.trialEndsAt 
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isLoading,
      isTrialExpired,
      daysLeftInTrial,
      refreshSubscription: fetchSubscription,
      isFirstTimeUser,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
