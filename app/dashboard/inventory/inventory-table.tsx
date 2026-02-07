"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
    color: string | null;
  };
}

interface InventoryTableProps {
  productsStock: ProductStockRow[];
  productType: string;
}

const CATEGORY_ORDER = ["Gallons", "Caps", "Preforms", "Other"];

function getProductCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("gallon")) return "Gallons";
  if (lower.startsWith("caps")) return "Caps";
  if (lower.startsWith("preform")) return "Preforms";
  return "Other";
}

function groupByCategory(
  products: ProductStockRow[]
): { category: string; items: ProductStockRow[] }[] {
  const map = new Map<string, ProductStockRow[]>();
  for (const row of products) {
    const category = getProductCategory(row.products.name);
    if (!map.has(category)) map.set(category, []);
    map.get(category)!.push(row);
  }
  return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
    category: cat,
    items: map.get(cat)!,
  }));
}

export function InventoryTable({
  productsStock,
  productType,
}: InventoryTableProps) {
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set()
  );

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

  function toggleGroup(category: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const isGrouped = productType === "FINISHED_GOOD";
  const groups = isGrouped ? groupByCategory(productsStock) : [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              {isGrouped ? (
                <TableHead>Color</TableHead>
              ) : (
                <TableHead>Type</TableHead>
              )}
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>UOM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsStock.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No stock records found.
                </TableCell>
              </TableRow>
            ) : isGrouped ? (
              groups.map(({ category, items }) => {
                const isExpanded = expandedGroups.has(category);
                return (
                  <GroupSection
                    key={category}
                    category={category}
                    items={items}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(category)}
                    onRowClick={handleRowClick}
                  />
                );
              })
            ) : (
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

function GroupSection({
  category,
  items,
  isExpanded,
  onToggle,
  onRowClick,
}: {
  category: string;
  items: ProductStockRow[];
  isExpanded: boolean;
  onToggle: () => void;
  onRowClick: (row: ProductStockRow) => void;
}) {
  const totalQty = items.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <>
      <TableRow
        className="cursor-pointer bg-muted/50 hover:bg-muted"
        onClick={onToggle}
      >
        <TableCell colSpan={5}>
          <div className="flex items-center gap-2 font-semibold">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {category}
            <span className="text-xs font-normal text-muted-foreground">
              ({items.length} items &middot; {totalQty} total)
            </span>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded &&
        items.map((row) => (
          <TableRow
            key={row.id}
            className="cursor-pointer"
            onClick={() => onRowClick(row)}
          >
            <TableCell className="pl-10 font-mono text-xs">
              {row.products?.sku}
            </TableCell>
            <TableCell>{row.products?.name}</TableCell>
            <TableCell>
              {row.products?.color && (
                <Badge variant="outline">{row.products.color}</Badge>
              )}
            </TableCell>
            <TableCell className="text-right font-medium">
              {Number(row.quantity)}
            </TableCell>
            <TableCell>{row.uom}</TableCell>
          </TableRow>
        ))}
    </>
  );
}
