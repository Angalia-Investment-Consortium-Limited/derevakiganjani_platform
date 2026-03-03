import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// --- Type Definitions ---
// Made fields optional to handle potentially missing data from Firestore
export type Test = { 
    id: string; 
    test_title_en?: string; 
    courseId?: string; 
    questionIds?: string[]; 
    pass_mark_percentage?: number; 
};

interface ActionsCellProps {
    test: Test;
    onEdit: (test: Test) => void;
    onDelete: (testId: string) => void;
}

// --- Action Cell Component ---
// Moved to a separate component for clarity and to pass handlers
const ActionsCell: React.FC<ActionsCellProps> = ({ test, onEdit, onDelete }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(test)}>
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => onDelete(test.id)}
                    className="text-red-600"
                >
                    Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(test.id)}
                >
                    Copy Test ID
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


// --- Column Definitions ---

export const getColumns = (onEdit: (test: Test) => void, onDelete: (testId: string) => void): ColumnDef<Test>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "test_title_en",
        header: "Test Title",
        cell: ({ row }) => row.getValue("test_title_en") || "N/A", // Fallback
    },
    {
        accessorKey: "courseId",
        header: "Category ID",
        cell: ({ row }) => row.getValue("courseId") || "N/A", // Fallback
    },
    {
        accessorKey: "questionIds",
        header: "No. of Questions",
        cell: ({ row }) => {
            // Robustly get length, defaulting to 0 if data is missing
            const questionIds = row.getValue("questionIds") as string[] | undefined;
            return questionIds?.length || 0;
        }
    },
    {
        accessorKey: "pass_mark_percentage",
        header: "Pass Mark",
        cell: ({ row }) => {
            // Robustly parse and format, defaulting if data is missing/invalid
            const passMark = row.getValue("pass_mark_percentage");
            const parsedMark = typeof passMark === 'number' ? passMark : parseFloat(passMark as string);
            return !isNaN(parsedMark) ? `${parsedMark} %` : "0 %";
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const test = row.original;
            return <ActionsCell test={test} onEdit={onEdit} onDelete={onDelete} />;
        },
    },
];