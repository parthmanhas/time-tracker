import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
type WithLoadingProps = {
  isLoading: boolean;
  children: React.ReactNode;
  size?: number;
  isScreen?: boolean;
  addingTimer?: boolean;
}

export const WithLoading: React.FC<WithLoadingProps> = ({ isLoading, children, size = 40, isScreen = false, addingTimer = false }) => {
  if (isScreen) {
    return <>{isLoading ? <div className="flex justify-center items-center h-screen"><LoaderCircle size={size} className="animate-spin" /></div> : children}</>
  }
  if (addingTimer) {
    return <>
      {isLoading ?
        <div className="flex flex-col gap-4 justify-center items-center w-full">
          <div className="flex w-full justify-between gap-2">
            <Skeleton className="w-full h-[40px]" />
            <Skeleton className="w-full h-[40px]" />
          </div>
        </div> :
        children}
    </>
  }

  return <>
    {isLoading ?
      <div className="flex flex-col gap-4 justify-center items-center w-full">
        <div className="flex w-full justify-between gap-2">
          <Skeleton className="w-full h-[40px]" />
          <Skeleton className="w-full h-[40px]" />
        </div>
        <Skeleton className="w-full h-[40px]" />
        <Skeleton className="w-full h-[36px]" />
      </div> :
      children}
  </>
}
