import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all duration-300",
          {
            "bg-[#DA291C] text-white hover:bg-[#FBE122] hover:text-black": variant === "default",
            "bg-[#2E2E2E] text-white hover:bg-[#DA291C]": variant === "secondary",
            "border-2 border-[#DA291C] text-[#DA291C] hover:bg-[#DA291C] hover:text-white": variant === "outline",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
