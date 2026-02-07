"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewProductionRunDialog } from "./new-production-run-dialog";
import type { ProductionRunReferenceData } from "@/types/production-run";

interface ProductionRunClientProps {
  referenceData: ProductionRunReferenceData;
}

export function ProductionRunClient({
  referenceData,
}: ProductionRunClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Production Run</h2>
          <p className="mt-1 text-muted-foreground">
            Manage and monitor production runs.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>

      <NewProductionRunDialog
        referenceData={referenceData}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
