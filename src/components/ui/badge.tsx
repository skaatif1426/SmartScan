import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-widest shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:shadow-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-2 hover:border-primary/20 hover:bg-primary/5",
        success: "border-transparent bg-emerald-500 text-white",
        warning: "border-transparent bg-amber-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }