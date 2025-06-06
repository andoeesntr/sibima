
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-green-800 text-white hover:bg-green-700 [&_svg]:text-yellow-500",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-green-800 bg-background hover:bg-green-700 hover:text-white text-green-800 [&_svg]:text-yellow-500 hover:[&_svg]:text-yellow-500",
        secondary:
          "bg-green-700 text-white hover:bg-green-600 [&_svg]:text-yellow-500",
        ghost: "hover:bg-green-700 hover:text-white [&_svg]:text-yellow-500",
        link: "text-green-800 underline-offset-4 hover:underline [&_svg]:text-yellow-500",
        reject: "border border-red-300 bg-background text-red-600 hover:bg-green-700 hover:text-red-400 hover:border-green-700 [&_svg]:text-red-500 hover:[&_svg]:text-red-400",
        revision: "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-green-700 hover:text-amber-300 hover:border-green-700 [&_svg]:text-amber-600 hover:[&_svg]:text-amber-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
