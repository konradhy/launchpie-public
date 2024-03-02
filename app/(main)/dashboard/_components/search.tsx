"use client";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";

export function Search() {
  const search = useSearch();

  return (
    <div>
      <Input
        type="search"
        placeholder="Search..."
        className="md:w-[100px] lg:w-[300px]"
        inputMode="search"
        onClick={search.onOpen}
      />
    </div>
  );
}
