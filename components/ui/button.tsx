import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'clay'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-50 disabled:pointer-events-none font-heading",
          {
            "bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20": variant === 'default',
            "border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50": variant === 'outline',
            "text-slate-600 hover:bg-slate-100": variant === 'ghost',
            "bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-[0_4px_12px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_16px_rgba(20,184,166,0.4)]": variant === 'clay',
          },
          {
            "px-3 py-1.5 text-xs": size === 'sm',
            "px-5 py-2.5 text-sm": size === 'md',
            "px-6 py-3 text-base": size === 'lg',
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
