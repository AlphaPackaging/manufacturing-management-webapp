"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const productTypes = [
  { value: "FINISHED_GOOD", label: "Finished Good" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
  { value: "MASTER_BATCH", label: "Master Batch" },
];

export function StockTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "FINISHED_GOOD";
  const currentSearch = searchParams.get("q") ?? "";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(params: URLSearchParams) {
    router.push(`/dashboard/inventory?${params.toString()}`);
  }

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    navigate(params);
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      navigate(params);
    }, 300);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {productTypes.map((type) => (
          <Button
            key={type.value}
            variant={current === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilter(type.value)}
            className={cn("text-xs")}
          >
            {type.label}
          </Button>
        ))}
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
