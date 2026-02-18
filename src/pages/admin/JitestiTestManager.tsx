import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Types
type JitestiCategory = { id: string; title: string; questionIds?: string[] };
type Question = { id: string; text: string; options: string[]; correctAnswerIndex: number; };

// Fetch functions
const fetchCategories = async (): Promise<JitestiCategory[]> => {
  const categoriesCollection = collection(db, 'jitesti-categories');
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JitestiCategory));
};

const fetchQuestions = async (): Promise<Question[]> => {
  const questionsCollection = collection(db, 'questions');
  const snapshot = await getDocs(questionsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

const JitestiTestManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<JitestiCategory[]>({ 
    queryKey: ['jitesti-categories'], 
    queryFn: fetchCategories 
  });
  
  const { data: questionBank = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({ 
    queryKey: ['questions'], // Changed from 'question-bank' to 'questions' to reflect collection name
    queryFn: fetchQuestions // Replaced mock with live Firestore fetch
  });

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  const testQuestions = useMemo(() => {
    if (!selectedCategory || !selectedCategory.questionIds) return [];
    return questionBank.filter(q => selectedCategory.questionIds!.includes(q.id));
  }, [selectedCategory, questionBank]);

  const addQuestionsMutation = useMutation({
    mutationFn: async (questionIds: string[]) => {
      if (!selectedCategoryId) throw new Error('No category selected');
      const docRef = doc(db, 'jitesti-categories', selectedCategoryId);
      await updateDoc(docRef, { questionIds: arrayUnion(...questionIds) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jitesti-categories'] });
      toast({ title: 'Success', description: 'Questions added to the test.' });
      setIsAddQuestionDialogOpen(false);
      setSelectedQuestions(new Set());
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const removeQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!selectedCategoryId) throw new Error('No category selected');
      const docRef = doc(db, 'jitesti-categories', selectedCategoryId);
      await updateDoc(docRef, { questionIds: arrayRemove(questionId) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jitesti-categories'] });
      toast({ title: 'Removed', description: 'Question removed from the test.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const handleAddQuestions = () => {
    addQuestionsMutation.mutate(Array.from(selectedQuestions));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>JiTesti Test Manager</CardTitle>
        <CardDescription>Assemble tests by attaching questions to a JiTesti Category.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId || ''}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a Test Category..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCategories ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                categories.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)
              )}
            </SelectContent>
          </Select>
          {selectedCategoryId && (
            <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Questions</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Questions to: {selectedCategory?.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {isLoadingQuestions ? <p>Loading questions...</p> : questionBank.filter(q => !selectedCategory?.questionIds?.includes(q.id)).map(q => (
                        <div key={q.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                           <Checkbox 
                                id={q.id}
                                onCheckedChange={(checked) => {
                                    const newSet = new Set(selectedQuestions);
                                    if(checked) newSet.add(q.id); else newSet.delete(q.id);
                                    setSelectedQuestions(newSet);
                                }}
                           />
                           <label htmlFor={q.id} className="text-sm font-medium leading-none">{q.text}</label>
                        </div>
                    ))}
                </div>
                <Button onClick={handleAddQuestions} disabled={addQuestionsMutation.isPending}>
                    {addQuestionsMutation.isPending ? 'Adding...' : `Add ${selectedQuestions.size} Questions`}
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {selectedCategoryId && (
            <div>
                <h3 className="text-lg font-semibold mb-2">Questions for: {selectedCategory?.title}</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Question Text</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testQuestions.map(q => (
                            <TableRow key={q.id}>
                                <TableCell>{q.text}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm" onClick={() => removeQuestionMutation.mutate(q.id)}>
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {testQuestions.length === 0 && <TableRow><TableCell colSpan={2}>No questions have been added to this test yet.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        )}

      </CardContent>
    </Card>
  );
};

export default JitestiTestManager;
