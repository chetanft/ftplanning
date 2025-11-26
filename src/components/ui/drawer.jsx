import * as React from "react"
import * as DrawerPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

const Drawer = DrawerPrimitive.Root

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerClose = DrawerPrimitive.Close

const DrawerPortal = DrawerPrimitive.Portal

const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
        className={`fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ${className || ''}`}
        {...props}
        ref={ref}
    />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
            ref={ref}
            className={`fixed z-50 bg-white shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-xl ${className || ''}`}
            {...props}
        >
            {children}
        </DrawerPrimitive.Content>
    </DrawerPortal>
))
DrawerContent.displayName = DrawerPrimitive.Content.displayName

const DrawerHeader = ({
    className,
    ...props
}) => (
    <div
        className={`flex flex-col space-y-2 text-center sm:text-left p-6 border-b ${className || ''}`}
        {...props}
    />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
    className,
    ...props
}) => (
    <div
        className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t ${className || ''}`}
        {...props}
    />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
        ref={ref}
        className={`text-lg font-semibold text-gray-900 ${className || ''}`}
        {...props}
    />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
        ref={ref}
        className={`text-sm text-gray-500 ${className || ''}`}
        {...props}
    />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
}
