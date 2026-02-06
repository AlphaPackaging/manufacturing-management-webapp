import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockTypeFilter } from "./stock-type-filter";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products_stock")
    .select("id, quantity, uom, products!inner ( sku, name, type )")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("products.type", type);
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`, {
      referencedTable: "products",
    });
  }

  const { data: productsStock } = await query;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Stock</h2>

      <StockTypeFilter />

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Current Stock</h3>
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
              {productsStock && productsStock.length > 0 ? (
                productsStock.map((row: any) => (
                  <TableRow key={row.id}>
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
      </div>
    </div>
  );
}
