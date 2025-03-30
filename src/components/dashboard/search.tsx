"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export function Search() {
  const [value, setValue] = React.useState("");

  return (
    <div className="w-full sm:max-w-xs">
      <div className="relative">
        <SearchIcon
          className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Rechercher..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full pl-8 md:w-[200px] lg:w-[250px] bg-background"
        />
      </div>
    </div>
  );
} 