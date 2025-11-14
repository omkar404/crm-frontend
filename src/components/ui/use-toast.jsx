import { useCallback } from "react"
import { ToastAction, ToastProvider, ToastViewport } from "@/components/ui/toast"

let toastHandlers = [];

export function useToast() {
  const toast = useCallback(({ title, description, action, duration = 3000 }) => {
    toastHandlers.forEach((handler) =>
      handler({ title, description, action, duration })
    );
  }, []);

  return { toast };
}

export function Toaster() {
  return (
    <ToastProvider
      swipeDirection="right"
      duration={3000}
      onOpenChange={(handler) => {
        if (handler) toastHandlers.push(handler);
        else toastHandlers = toastHandlers.filter((h) => h !== handler);
      }}
    >
      <ToastViewport />
    </ToastProvider>
  );
}
