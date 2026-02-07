import { createClient } from "@/lib/supabase/server";
import { StockTypeFilter } from "./stock-type-filter";
import { InventoryTable } from "./inventory-table";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products_stock")
    .select("id, quantity, uom, products!inner ( id, sku, name, type, color )")
    .order("name", { ascending: true, referencedTable: "products" });

  const activeType = type ?? "FINISHED_GOOD";
  query = query.eq("products.type", activeType);

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`, {
      referencedTable: "products",
    });
  }

  const { data } = await query;

  const productsStock = (data ?? [])
    .map((row) => {
      const product = Array.isArray(row.products)
        ? row.products[0]
        : row.products;
      return {
        id: row.id as string,
        quantity: Number(row.quantity),
        uom: row.uom as string,
        products: {
          id: product.id as string,
          sku: product.sku as string,
          name: product.name as string,
          type: product.type as string,
          color: (product.color as string) ?? null,
        },
      };
    })
    .sort((a, b) => a.products.name.localeCompare(b.products.name));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Inventory</h2>

      <StockTypeFilter />

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Current Stock</h3>
        <InventoryTable productsStock={productsStock} productType={activeType} />
      </div>
    </div>
  );
}
