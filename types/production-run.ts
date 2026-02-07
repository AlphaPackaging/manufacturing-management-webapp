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
