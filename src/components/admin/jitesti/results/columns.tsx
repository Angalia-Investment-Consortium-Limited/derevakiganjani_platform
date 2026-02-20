
import type { ColumnDef } from "@tanstack/react-table";
import type { JitestiResultRow } from "@/pages/admin/JitestiResults";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { DataTableRowActions } from "./DataTableRowActions";

export const columns: ColumnDef<JitestiResultRow>[] = [
  {
    accessorKey: "userName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => (
        <div className="flex flex-col">
            <span className="font-medium">{row.original.userName}</span>
            <span className="text-sm text-muted-foreground">{row.original.userEmail}</span>
        </div>
    )
  },
  {
    accessorKey: "categoryTitle",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Test Category" />
    ),
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.score}%</span>
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge 
            variant={status === 'Passed' ? 'default' : status === 'Failed' ? 'destructive' : 'outline'}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "completedAt",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
        <span>{row.original.completedAt ? new Date(row.original.completedAt).toLocaleDateString() : 'N/A'}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
