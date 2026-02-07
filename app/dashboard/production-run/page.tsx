import { createClient } from "@/lib/supabase/server";
import { ProductionRunClient } from "./production-run-client";
import type {
  FinishedGoodProduct,
  RawMaterialProduct,
  MasterBatchProduct,
  Machine,
} from "@/types/production-run";

export default async function ProductionRunPage() {
  const supabase = await createClient();

  const [finishedGoodsRes, rawMaterialsRes, masterBatchesRes, machinesRes] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, sku, name, parent_raw_material_id, parent_master_batch_id, target_production_per_shift"
        )
        .eq("type", "FINISHED_GOOD")
        .order("name"),
      supabase
        .from("products")
        .select("id, sku, name")
        .eq("type", "RAW_MATERIAL")
        .order("name"),
      supabase
        .from("products")
        .select("id, sku, name")
        .eq("type", "MASTER_BATCH")
        .order("name"),
      supabase
        .from("machines")
        .select("id, name, serial_number")
        .eq("status", "ACTIVE")
        .order("name"),
    ]);

  const finishedGoods = (finishedGoodsRes.data ?? []) as FinishedGoodProduct[];
  const rawMaterials = (rawMaterialsRes.data ?? []) as RawMaterialProduct[];
  const masterBatches = (masterBatchesRes.data ?? []) as MasterBatchProduct[];
  const machines = (machinesRes.data ?? []) as Machine[];

  return (
    <div className="space-y-4">
      <ProductionRunClient
        referenceData={{ finishedGoods, rawMaterials, masterBatches, machines }}
      />
    </div>
  );
}
