import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ProductionRunBody {
  product_id: string;
  machine_id: string;
  target_quantity: number;
  actual_pieces_produced: number;
  waste_quantity?: number;
  raw_material_id: string | null;
  raw_material_bags_used: number;
  master_batch_id: string | null;
  master_batch_bags_used: number;
  shift: string;
  started_at?: string;
  completed_at?: string;
}

function json(
  body: { success: boolean; data?: unknown; error?: string },
  status = 200
): NextResponse {
  return NextResponse.json(body, { status });
}

const VALID_SHIFTS = ["DAY", "NIGHT"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  let body: ProductionRunBody;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON body" }, 400);
  }

  const {
    product_id,
    machine_id,
    target_quantity,
    actual_pieces_produced,
    waste_quantity,
    raw_material_id,
    raw_material_bags_used,
    master_batch_id,
    master_batch_bags_used,
    shift,
    started_at,
    completed_at,
  } = body;

  // Validate required fields
  if (!product_id || !machine_id || !shift) {
    return json(
      { success: false, error: "product_id, machine_id, and shift are required" },
      400
    );
  }

  if (!VALID_SHIFTS.includes(shift)) {
    return json(
      { success: false, error: "shift must be DAY or NIGHT" },
      400
    );
  }

  if (
    !Number.isFinite(actual_pieces_produced) ||
    actual_pieces_produced < 0
  ) {
    return json(
      {
        success: false,
        error: "actual_pieces_produced must be a non-negative number",
      },
      400
    );
  }

  if (
    !Number.isFinite(raw_material_bags_used) ||
    raw_material_bags_used < 0
  ) {
    return json(
      {
        success: false,
        error: "raw_material_bags_used must be a non-negative number",
      },
      400
    );
  }

  if (
    !Number.isFinite(master_batch_bags_used) ||
    master_batch_bags_used < 0
  ) {
    return json(
      {
        success: false,
        error: "master_batch_bags_used must be a non-negative number",
      },
      400
    );
  }

  // Validate product is FINISHED_GOOD
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, type")
    .eq("id", product_id)
    .single();

  if (productError || !product) {
    return json({ success: false, error: "Product not found" }, 400);
  }

  if (product.type !== "FINISHED_GOOD") {
    return json(
      { success: false, error: "Product must be a FINISHED_GOOD type" },
      400
    );
  }

  // Validate machine is ACTIVE
  const { data: machine, error: machineError } = await supabase
    .from("machines")
    .select("id, status")
    .eq("id", machine_id)
    .single();

  if (machineError || !machine) {
    return json({ success: false, error: "Machine not found" }, 400);
  }

  if (machine.status !== "ACTIVE") {
    return json(
      { success: false, error: "Machine must be in ACTIVE status" },
      400
    );
  }

  // Build insert payload
  const insertData: Record<string, unknown> = {
    product_id,
    machine_id,
    target_quantity: Number.isFinite(target_quantity) ? target_quantity : 0,
    actual_pieces_produced,
    waste_quantity:
      waste_quantity && Number.isFinite(waste_quantity) ? waste_quantity : 0,
    raw_material_id: raw_material_id || null,
    raw_material_bags_used,
    master_batch_id: master_batch_id || null,
    master_batch_bags_used,
    shift,
    created_by: user.id,
  };

  if (started_at) {
    insertData.started_at = started_at;
  }
  if (completed_at) {
    insertData.completed_at = completed_at;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("production_runs")
    .insert(insertData)
    .select("id")
    .single();

  if (insertError) {
    return json(
      { success: false, error: "Failed to create production run" },
      500
    );
  }

  return json({ success: true, data: { id: inserted.id } }, 201);
}
