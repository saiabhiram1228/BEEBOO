import { cn } from '@/lib/utils';

export default function Logo({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 100"
      className={cn("w-auto h-12", className)}
      {...props}
    >
      <defs>
        <style>
          {`
            .bee-boo-font {
              font-family: serif;
              font-weight: bold;
              font-size: 50px;
              fill: currentColor;
            }
          `}
        </style>
      </defs>
      
      <text x="0" y="45" className="bee-boo-font">Bee</text>
      <text x="0" y="90" className="bee-boo-font">BOO</text>
      
    </svg>
  );
}
