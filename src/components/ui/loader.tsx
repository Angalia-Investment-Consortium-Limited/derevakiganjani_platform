import { Loader2 } from 'lucide-react';

interface LoaderProps {
  children?: React.ReactNode;
  className?: string;
}

export const Loader = ({ children, className }: LoaderProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      {children && <p className="text-muted-foreground text-sm">{children}</p>}
    </div>
  );
};
