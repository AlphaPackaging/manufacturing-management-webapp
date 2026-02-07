"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProductStock {
  id: string;
  product_id: string;
  quantity: number;
  uom: string;
  sku: string;
  name: string;
  type: string;
}

interface StockAdjustmentDialogProps {
  product: ProductStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockAdjustmentDialog({
  product,
  open,
  onOpenChange,
}: StockAdjustmentDialogProps) {
  const router = useRouter();
  const [quantityChange, setQuantityChange] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setQuantityChange("");
    setNotes("");
    setError(null);
    setLoading(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    const change = Number(quantityChange);
    if (!Number.isFinite(change) || change === 0) {
      setError("Enter a non-zero number.");
      return;
    }
    if (!notes.trim()) {
      setError("Notes are required.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stock-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_stock_id: product.id,
          product_id: product.product_id,
          quantity_change: change,
          uom: product.uom,
          notes: notes.trim(),
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "Adjustment failed.");
        setLoading(false);
        return;
      }

      handleOpenChange(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Manually adjust the quantity for this product.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-md border p-3 text-sm">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium">{product.name}</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {product.sku}
              </span>
              <Badge variant="outline" className="text-xs">
                {product.type.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-medium">
              {product.quantity} {product.uom}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity-change">Quantity Change</Label>
            <Input
              id="quantity-change"
              type="number"
              step="any"
              placeholder="e.g. 10 or -5"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Use positive values to add stock, negative to remove.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Reason for adjustment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Submit Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
