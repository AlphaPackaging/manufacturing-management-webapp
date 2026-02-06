"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, Package, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/production-run", label: "Production Run", icon: Factory },
  { href: "/dashboard/stock", label: "Stock", icon: Package },
  { href: "/dashboard/machinery", label: "Machinery", icon: Cog },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
