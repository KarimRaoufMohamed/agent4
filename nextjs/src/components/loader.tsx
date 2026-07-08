import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

interface LoaderProps {
  wrapperClassName?: string;
  loaderClassName?: string;
}

const Loader: React.FC<LoaderProps> = ({
  wrapperClassName,
  loaderClassName,
}) => {
  return (
    <div className={cn("flex items-center justify-center", wrapperClassName)}>
      <LoaderIcon className={cn("animate-spin size-12", loaderClassName)} />
    </div>
  );
};

export default Loader;
