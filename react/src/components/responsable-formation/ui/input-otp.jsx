"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef(({ char, hasFocus, isComplete, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-10 w-10 rounded-md text-sm shadow-sm transition-all",
      "border border-input",
      "focus-within:ring-1 focus-within:ring-ring",
      "group-hover:border-accent-foreground/20 [&:has(:disabled)]:opacity-50",
      className
    )}
    {...props}
  >
    {char && (
      <div
        className="absolute inset-0 flex items-center justify-center"
        role="presentation"
      >
        {char}
      </div>
    )}
    {!char && !isComplete && hasFocus && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Dot className="h-4 w-4 animate-pulse text-foreground/40" />
      </div>
    )}
  </div>
))
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot className="h-4 w-4 text-foreground/40" />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
