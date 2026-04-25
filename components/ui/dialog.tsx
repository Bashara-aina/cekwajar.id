"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children?: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange?.(false)}
      onClick={(e) => {
        if (e.target === ref.current) {
          ref.current.close();
          onOpenChange?.(false);
        }
      }}
      className="fixed inset-0 z-50 m-0 max-w-none max-h-none w-full h-full bg-transparent p-0"
    >
      <div className="fixed inset-0 z-[-1] bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      {children}
    </dialog>
  );
}

function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div
      className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "z-50 bg-background rounded-2xl border shadow-lg w-full max-w-lg mx-4",
        "animate-in zoom-in-95 fade-in-0 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn("p-6 pb-0", className)}>
      {children}
    </div>
  );
}

function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  );
}

function DialogClose({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "absolute top-4 right-4 rounded-full p-1 hover:bg-muted transition-colors",
        className
      )}
      aria-label="Tutup"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
};
