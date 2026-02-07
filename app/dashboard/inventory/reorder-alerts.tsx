"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReorderItem {
  productName: string;
  productSku: string;
  productType: string;
  quantity: number;
  reorderLevel: number;
  uom: string;
}

interface ReorderAlertsProps {
  items: ReorderItem[];
}

export function ReorderAlerts({ items }: ReorderAlertsProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 shadow-sm transition-colors hover:bg-destructive/10"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
        <span className="text-sm font-medium text-destructive">
          Re-Order Warning ({items.length})
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Re-Order Alerts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.productSku}
                className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{item.productSku}</span>
                    {" · "}
                    {item.productType === "RAW_MATERIAL"
                      ? "Raw Material"
                      : "Master Batch"}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-destructive">
                    {item.quantity} {item.uom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    min: {item.reorderLevel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
