export interface FinishedGoodProduct {
  id: string;
  sku: string;
  name: string;
  parent_raw_material_id: string | null;
  parent_master_batch_id: string | null;
  target_production_per_shift: number | null;
}

export interface RawMaterialProduct {
  id: string;
  sku: string;
  name: string;
}

export interface MasterBatchProduct {
  id: string;
  sku: string;
  name: string;
}

export interface Machine {
  id: string;
  name: string;
  serial_number: string;
}

export interface ProductionRunReferenceData {
  finishedGoods: FinishedGoodProduct[];
  rawMaterials: RawMaterialProduct[];
  masterBatches: MasterBatchProduct[];
  machines: Machine[];
}

export interface ProductionRunRow {
  id: string;
  target_quantity: number;
  actual_pieces_produced: number;
  waste_quantity: number;
  raw_material_bags_used: number;
  master_batch_bags_used: number;
  shift: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  product_name: string;
  product_sku: string;
  machine_name: string;
  raw_material_name: string | null;
  master_batch_name: string | null;
  created_by_name: string | null;
}
