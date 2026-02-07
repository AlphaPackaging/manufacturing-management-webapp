"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";

interface ProductStockRow {
  id: string;
  quantity: number;
  uom: string;
  products: {
    id: string;
    sku: string;
    name: string;
    type: string;
  };
}

interface InventoryTableProps {
  productsStock: ProductStockRow[];
}

export function InventoryTable({ productsStock }: InventoryTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    product_id: string;
    quantity: number;
    uom: string;
    sku: string;
    name: string;
    type: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleRowClick(row: ProductStockRow) {
    setSelectedProduct({
      id: row.id,
      product_id: row.products.id,
      quantity: Number(row.quantity),
      uom: row.uom,
      sku: row.products.sku,
      name: row.products.name,
      type: row.products.type,
    });
    setDialogOpen(true);
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>UOM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsStock.length > 0 ? (
              productsStock.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell className="font-mono text-xs">
                    {row.products?.sku}
                  </TableCell>
                  <TableCell>{row.products?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {row.products?.type?.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(row.quantity)}
                  </TableCell>
                  <TableCell>{row.uom}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No stock records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StockAdjustmentDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
