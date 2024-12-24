import { LoaderCircle } from "lucide-react";

type WithLoadingProps = {
  isLoading: boolean;
  children: React.ReactNode;
  size?: number;
  isScreen?: boolean;
}

export const WithLoading: React.FC<WithLoadingProps> = ({ isLoading, children, size = 40, isScreen = false }) => {
  if (isScreen) {
    return <>{isLoading ? <div className="flex justify-center items-center h-screen"><LoaderCircle size={size} className="animate-spin" /></div> : children}</>
  }
  return <>{isLoading ? <LoaderCircle size={size} className="animate-spin" /> : children}</>
}
