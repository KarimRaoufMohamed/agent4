import { cn } from "@/lib/utils";

interface ITitleProps {
  children: React.ReactNode;
  className?: string;
}

const Title: React.FC<ITitleProps> = ({ children, className }) => {
  return (
    <p
      className={cn(
        "text-2xl font-bold bg-gradient-to-r from-white via-primary to-primary text-transparent bg-clip-text",
        className
      )}
    >
      {children}
    </p>
  );
};

export default Title;
