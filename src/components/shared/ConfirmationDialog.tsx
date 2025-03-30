"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
  title: string;
  description: string;
  trigger: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export function ConfirmationDialog({
  title,
  description,
  trigger,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  open,
  onOpenChange,
  icon,
  destructive = false,
}: ConfirmationDialogProps) {
  const [isOpenInternal, setIsOpenInternal] = React.useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : isOpenInternal;
  const setIsOpen = isControlled ? onOpenChange : setIsOpenInternal;

  const handleConfirm = () => {
    onConfirm();
    setIsOpen?.(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon && <div className="mx-auto mb-4">{icon}</div>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className={cn(
              destructive && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Variante spécifique pour les opérations de suppression
export function DeleteConfirmationDialog({
  itemName,
  onConfirm,
  trigger,
  ...props
}: Omit<ConfirmationDialogProps, "title" | "description" | "onConfirm"> & {
  itemName: string;
  onConfirm: () => void;
}) {
  return (
    <ConfirmationDialog
      title={`Supprimer ${itemName}`}
      description={`Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible et toutes les données associées seront définitivement perdues.`}
      confirmText="Supprimer"
      destructive
      onConfirm={onConfirm}
      trigger={trigger}
      {...props}
    />
  );
} 