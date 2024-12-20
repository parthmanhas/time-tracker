import { LoaderCircle } from "lucide-react";

type WithLoadingProps = {
  isLoading: boolean;
  children: React.ReactNode;
}

export const WithLoading: React.FC<WithLoadingProps> = ({ isLoading, children }) => {
  return <>{isLoading ? <LoaderCircle className="animate-spin" /> : children}</>
}
