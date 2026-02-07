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
    .select("id, quantity, uom, products!inner ( id, sku, name, type )")
    .order("name", { ascending: true, referencedTable: "products" });

  if (type) {
    query = query.eq("products.type", type);
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`, {
      referencedTable: "products",
    });
  }

  const { data } = await query;

  const productsStock = (data ?? []).map((row) => {
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
      },
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Inventory</h2>

      <StockTypeFilter />

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Current Stock</h3>
        <InventoryTable productsStock={productsStock} />
      </div>
    </div>
  );
}
