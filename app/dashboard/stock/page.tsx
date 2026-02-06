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

export default async function StockPage() {
  const supabase = await createClient();

  const [{ data: productsStock }, { data: stockLedger }] = await Promise.all([
    supabase
      .from("products_stock")
      .select("id, quantity, uom, products ( sku, name, type )")
      .order("created_at", { ascending: false }),
    supabase
      .from("stock_ledger")
      .select(
        "id, quantity_change, uom, transaction_source_table, notes, created_at, products ( sku, name )"
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Stock</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — Products Stock */}
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

        {/* Right — Stock Ledger */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Stock Ledger</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLedger && stockLedger.length > 0 ? (
                  stockLedger.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{row.products?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {row.transaction_source_table}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          Number(row.quantity_change) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Number(row.quantity_change) > 0 ? "+" : ""}
                        {Number(row.quantity_change)} {row.uom}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                        {row.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No ledger entries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
