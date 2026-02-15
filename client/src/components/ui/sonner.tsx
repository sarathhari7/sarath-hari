import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
        warning: <TriangleAlert className="h-5 w-5" />,
        error: <OctagonX className="h-5 w-5" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border group-[.toaster]:border-transparent group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-sm group-[.toaster]:min-w-[320px]",
          description: "group-[.toast]:text-white/90 group-[.toast]:data-[type=warning]:text-gray-900/80",
          actionButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30 group-[.toast]:border group-[.toast]:border-white/20",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20",
          success: "!bg-green-600 !text-white !border-green-700",
          error: "!bg-red-600 !text-white !border-red-700",
          warning: "!bg-yellow-500 !text-gray-900 !border-yellow-600 [&_[data-description]]:!text-gray-800",
          info: "!bg-blue-600 !text-white !border-blue-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
