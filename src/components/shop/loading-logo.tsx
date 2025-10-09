import { cn } from '@/lib/utils';
import Logo from './logo';

export default function LoadingLogo({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Logo className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
