import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
// import { useSubscription } from "@/context/subscription-context"
import { Link } from "react-router-dom"
import { Clock } from "lucide-react"

export function TrialBanner() {
  // const { daysLeftInTrial, isTrialExpired } = useSubscription();
  const daysLeftInTrial = 0;
  const isTrialExpired = false;

  if (!isTrialExpired && daysLeftInTrial > 7) return null;

  return (
    <Alert className="fixed bottom-4 right-4 w-96 z-50">
      <Clock className="h-4 w-4" />
      <AlertTitle>
        {isTrialExpired ? 'Trial Expired' : 'Trial Ending Soon'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {isTrialExpired 
          ? 'Your trial has expired. Please subscribe to continue using all features.'
          : `${daysLeftInTrial} days left in your trial. Subscribe now to keep using all features.`
        }
        <Button asChild className="mt-2 w-full">
          <Link to="/pricing">View Plans</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
