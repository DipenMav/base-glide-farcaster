import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gameButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-105 active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:border-primary/50",
        success:
          "bg-success text-success-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 hover:shadow-glow",
        ghost:
          "text-foreground hover:bg-accent/10 hover:text-accent",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GameButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gameButtonVariants> {
  asChild?: boolean;
}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(gameButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GameButton.displayName = "GameButton";

export { GameButton, gameButtonVariants };
