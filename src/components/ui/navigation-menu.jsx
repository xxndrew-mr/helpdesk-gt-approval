"use client"

import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn(
        "relative z-50 flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
)
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn(
        "group flex list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "inline-flex h-9 w-max items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors " +
    "text-white/80 hover:bg-white/15 hover:text-white " +
    "data-[state=open]:bg-white/20 data-[active]:bg-white/25 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800 focus-visible:ring-white/60"
)

const NavigationMenuTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        navigationMenuTriggerStyle(),
        "flex items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Trigger>
  )
)
NavigationMenuTrigger.displayName =
  NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "absolute right-0 top-full mt-2 w-max rounded-xl border border-slate-200 bg-white p-2 shadow-xl " +
          "data-[motion=from-start]:animate-in data-[motion=from-start]:slide-in-from-left-10 " +
          "data-[motion=from-end]:animate-in data-[motion=from-end]:slide-in-from-right-10 " +
          "data-[motion=to-start]:animate-out data-[motion=to-start]:slide-out-to-left-10 " +
          "data-[motion=to-end]:animate-out data-[motion=to-end]:slide-out-to-right-10",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuContent.displayName =
  NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

// <-- ini yang penting: viewport dimatikan, supaya tidak muncul kotak putih kosong
const NavigationMenuViewport = React.forwardRef((_props, _ref) => null)
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
