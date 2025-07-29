"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600/40 text-blue-100 border border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:bg-blue-600/50",
        destructive: "bg-red-500/20 text-red-400 border border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.2)] hover:bg-red-500/30",
        outline: "border border-input bg-black/20 text-gray-300 hover:bg-blue-900/20 hover:text-blue-100",
        secondary: "bg-purple-500/20 text-purple-400 border border-purple-400/30 hover:bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
