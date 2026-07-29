"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

type SheetSide = "top" | "right" | "bottom" | "left"

// Threads the controlled `open` value from `Sheet` down to `SheetContent`
// without requiring callers to pass it twice — `SheetContent` needs it
// directly (not just via base-ui's internal store) to gate its own
// `AnimatePresence` for the Motion-driven slide transition.
const SheetOpenContext = React.createContext(false)

function Sheet({ open, ...props }: SheetPrimitive.Root.Props) {
  return (
    <SheetOpenContext.Provider value={open ?? false}>
      <SheetPrimitive.Root data-slot="sheet" open={open} {...props} />
    </SheetOpenContext.Provider>
  )
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

// Off-screen starting/ending point per side, in Motion's transform-value
// shorthand — paired with an opacity fade so base-ui's `getAnimations()`
// exit-detection (which the JS-animation path relies on) sees a running
// animation even on sides where the slide itself is a pure transform.
const SHEET_OFFSCREEN: Record<SheetSide, { x?: string; y?: string }> = {
  top: { y: "-100%" },
  right: { x: "100%" },
  bottom: { y: "100%" },
  left: { x: "-100%" },
}

const SHEET_SPRING = { type: "spring", stiffness: 300, damping: 32 } as const

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: SheetSide
  showCloseButton?: boolean
}) {
  const open = React.useContext(SheetOpenContext)
  const offscreen = SHEET_OFFSCREEN[side]

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal keepMounted>
          <SheetOverlay />
          <SheetPrimitive.Popup
            data-slot="sheet-content"
            data-side={side}
            className={cn(
              "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
              className
            )}
            render={
              <motion.div
                initial={{ ...offscreen, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={{ ...offscreen, opacity: 0 }}
                transition={SHEET_SPRING}
              />
            }
            {...props}
          >
            {children}
            {showCloseButton && (
              <SheetPrimitive.Close
                data-slot="sheet-close"
                render={
                  <Button
                    variant="ghost"
                    className="absolute top-3 right-3 max-md:size-11"
                    size="icon-sm"
                  />
                }
              >
                <XIcon
                />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            )}
          </SheetPrimitive.Popup>
        </SheetPortal>
      )}
    </AnimatePresence>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
