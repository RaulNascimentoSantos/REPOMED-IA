import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-destructive-foreground hover:shadow-[0_10px_30px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 glow-red",
        outline:
          "border-2 border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-accent-foreground hover:shadow-lg hover:scale-105 text-foreground glass",
        secondary:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-secondary-foreground hover:shadow-[0_10px_30px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 glow-green",
        ghost: "hover:bg-white/10 hover:text-accent-foreground hover:backdrop-blur-md hover:scale-105 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:text-blue-600 transition-colors duration-300",
        medical: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-[0_20px_40px_rgba(59,130,246,0.6)] hover:scale-110 active:scale-95 glow-blue animate-shimmer",
        success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-[0_10px_30px_rgba(16,185,129,0.5)] hover:scale-105 glow-green",
        warning: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-[0_10px_30px_rgba(245,158,11,0.5)] hover:scale-105",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg font-bold",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }