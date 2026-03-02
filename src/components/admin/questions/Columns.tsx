import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

// Assuming your question type has these properties
type Question = {
    id: string;
    question_text_sw: string;
    question_text_en: string;
    category: string;
    difficulty: string;
}

export const columns = ({
  selectedQuestions,
  setSelectedQuestions,
}: {
  selectedQuestions: Set<string>;
  setSelectedQuestions: React.Dispatch<React.SetStateAction<Set<string>>>;
}): ColumnDef<Question>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => {
          const newSelectedQuestions = new Set(selectedQuestions);
          table.getRowModel().rows.forEach((row) => {
            if (value) {
              newSelectedQuestions.add(row.original.id);
            } else {
              newSelectedQuestions.delete(row.original.id);
            }
          });
          setSelectedQuestions(newSelectedQuestions);
          table.toggleAllPageRowsSelected(!!value);
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          const newSelectedQuestions = new Set(selectedQuestions);
          if (value) {
            newSelectedQuestions.add(row.original.id);
          } else {
            newSelectedQuestions.delete(row.original.id);
          }
          setSelectedQuestions(newSelectedQuestions);
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "question_text_sw",
    header: "Question",
    cell: ({ row }) => {
        return (
            <div>
                <span className="font-medium">{row.original.question_text_sw}</span>
                <span className="block text-sm text-muted-foreground">{row.original.question_text_en}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
  },
];
