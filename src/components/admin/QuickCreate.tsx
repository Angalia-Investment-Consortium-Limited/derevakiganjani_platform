
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickCreate() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden md:inline">Quick Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate("/admin/jobs/new")}>
          New Job Post
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/admin/question/new")}>
          New Question
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/admin/course/new")}>
          New Course
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
