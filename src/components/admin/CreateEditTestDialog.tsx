
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

type Test = {
  id?: string;
  test_title_en: string;
  courseId: string;
  questionIds: string[];
  pass_mark_percentage: number;
};

type JitestiCategory = { id: string, name_en: string };
type Question = { id: string, text_en: string };

interface CreateEditTestDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  testToEdit: Partial<Test> | null;
}

export const CreateEditTestDialog: React.FC<CreateEditTestDialogProps> = ({ isOpen, onOpenChange, testToEdit }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [testData, setTestData] = useState<Partial<Test>>(testToEdit || {});

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<JitestiCategory[]>({ 
      queryKey: ['jitesti-categories'], 
      queryFn: async () => {
          const snapshot = await getDocs(collection(db, 'jitesti-categories'));
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JitestiCategory));
      }
  });

  // Fetch questions
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({ 
      queryKey: ['questions'], 
      queryFn: async () => {
          const snapshot = await getDocs(collection(db, 'questions'));
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      }
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<Test>) => {
      const { id, ...rest } = data;
      if (id) {
        await updateDoc(doc(db, 'tests', id), rest);
      } else {
        await addDoc(collection(db, 'tests'), rest);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast({ title: 'Success!', description: 'Test saved successfully.' });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `An error occurred: ${error.message}`, variant: 'destructive' });
    }
  });

  const handleSave = () => {
    mutation.mutate(testData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{testToEdit ? 'Edit Test' : 'Create New Test'}</DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title (EN)</Label>
            <Input id="title" value={testData.test_title_en || ''} onChange={(e) => setTestData({...testData, test_title_en: e.target.value})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select onValueChange={(value) => setTestData({...testData, courseId: value})} value={testData.courseId}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {isLoadingCategories ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                        categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)
                    }
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passMark" className="text-right">Pass Mark (%)</Label>
            <Input id="passMark" type="number" value={testData.pass_mark_percentage || 0} onChange={(e) => setTestData({...testData, pass_mark_percentage: Number(e.target.value)})} className="col-span-3" />
          </div>
          {/* Multi-select for questions can be complex. A simpler approach for now is a text area for IDs, or a more advanced component. */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};