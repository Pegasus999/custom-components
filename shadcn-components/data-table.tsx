"use client";

import React from "react";
import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/spinner";
import { useLocale } from "next-intl";

export type FilterOption = {
  id: string;
  label: string;
  component: React.ReactElement<{
    value?: string | number | boolean;
    onChange?: (value: string | number | boolean) => void;
  }>;
  value?: string | number | boolean;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: FilterOption[];
  searchPlaceholder?: string;
  searchable?: boolean;
  pageSize?: number;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: Row<TData>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters = [],
  searchPlaceholder = "Search...",
  searchable = true,
  pageSize = 10,
  isLoading,
  className,
  emptyMessage = "No results.",
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const locale = useLocale();
  const isRTL = locale === "ar";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleFilterChange = (
    filterId: string,
    value: string | number | boolean
  ) => {
    // Extract the column ID from the filter ID (e.g., "status" from "status.filter")
    const columnId = filterId.split(".")[0];

    // Update active filters
    if (value === "all" || value === "") {
      setActiveFilters(activeFilters.filter((id) => id !== filterId));
    } else if (!activeFilters.includes(filterId)) {
      setActiveFilters([...activeFilters, filterId]);
    }

    // Update filter value
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      filter.value = value;
    }

    // Apply filter to table column - try both id and accessorKey
    let column = table.getColumn(columnId);
    if (!column) {
      // If not found by id, try to find by accessorKey
      const allColumns = table.getAllColumns();
      column = allColumns.find((col) => {
        const accessorKey = (col.columnDef as any).accessorKey;
        return col.id === columnId || accessorKey === columnId;
      });
    }

    if (column) {
      if (value === "all" || value === "") {
        column.setFilterValue(undefined);
      } else {
        column.setFilterValue(value);
      }
    } else {
      console.warn(
        `Column with id or accessorKey "${columnId}" not found for filter "${filterId}"`
      );
    }
  };

  const clearFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter((id) => id !== filterId));

    // Clear the filter value
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      filter.value = undefined;
    }

    // Clear the column filter
    const columnId = filterId.split(".")[0];
    let column = table.getColumn(columnId);
    if (!column) {
      // If not found by id, try to find by accessorKey
      const allColumns = table.getAllColumns();
      column = allColumns.find((col) => {
        const accessorKey = (col.columnDef as any).accessorKey;
        return col.id === columnId || accessorKey === columnId;
      });
    }
    column?.setFilterValue(undefined);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);

    // Clear all filter values
    filters.forEach((filter) => {
      filter.value = undefined;
    });

    table.resetColumnFilters();
    setGlobalFilter("");
  };

  return isLoading ? (
    <div className="flex items-center justify-center h-64">
      <Spinner />
    </div>
  ) : data ? (
    <div className={cn("space-y-4", className)} dir={isRTL ? "rtl" : "ltr"}>
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between",
          isRTL && "sm:flex-row-reverse"
        )}
      >
        {searchable && (
          <div className="relative w-full sm:max-w-sm">
            <Search
              className={cn(
                "absolute top-2.5 h-4 w-4 text-muted-foreground",
                isRTL ? "right-2.5" : "left-2.5"
              )}
            />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={isRTL ? "pr-8" : "pl-8"}
            />
            {globalFilter && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-0 h-full px-3",
                  isRTL ? "left-0" : "right-0"
                )}
                onClick={() => setGlobalFilter("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {activeFilters.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filterId) => {
                    const filter = filters.find((f) => f.id === filterId);
                    return filter ? (
                      <Badge
                        key={filterId}
                        variant="secondary"
                        className="gap-1"
                      >
                        {filter.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-auto p-0", isRTL ? "mr-1" : "ml-1")}
                          onClick={() => clearFilter(filterId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <SlidersHorizontal
                    className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")}
                  />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-[220px]"
              >
                <div className="p-2 grid gap-2">
                  {filters.map((filter) => (
                    <div key={filter.id} className="grid gap-1">
                      <div className="text-sm font-medium">{filter.label}</div>
                      {React.cloneElement(filter.component, {
                        value: filter.value,
                        onChange: (value: string | number | boolean) =>
                          handleFilterChange(filter.id, value),
                      })}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table className={isRTL ? "text-right" : "text-left"}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={isRTL ? "text-right" : "text-left"}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={isRTL ? "text-right" : "text-left"}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div
          className={cn(
            "flex items-center justify-between",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="text-sm text-muted-foreground">
            Showing <strong>{table.getRowModel().rows.length}</strong> of{" "}
            <strong>{data.length}</strong> items
          </div>
          <div
            className={cn(
              "flex items-center space-x-2",
              isRTL && "space-x-reverse"
            )}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div
      className={cn(
        "flex items-center justify-center h-64 text-muted-foreground",
        className
      )}
    >
      {emptyMessage}
    </div>
  );
}
