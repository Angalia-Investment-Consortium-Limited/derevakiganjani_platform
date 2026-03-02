import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/shared/DataTable";
import { Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { columns as createQuestionColumns } from "@/components/admin/questions/Columns";
import type { RowSelectionState } from '@tanstack/react-table';

// --- Type Definitions ---
type Test = { id: string; test_title_en: string; courseId: string; questionIds: string[]; pass_mark_percentage: number; };
type JitestiCategory = { id: string; name_en: string; name_sw: string; };
type Question = { id: string; question_text_sw: string; question_text_en: string; category: string; difficulty: string; };

// --- Data Fetching & Mutations ---
const fetchJitestiCategories = async (): Promise<JitestiCategory[]> => {
    const categoriesCollection = collection(db, 'jitesti-categories');
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JitestiCategory));
};

const fetchAllQuestions = async (): Promise<Question[]> => {
    const questionsCollection = collection(db, 'Test Question');
    const snapshot = await getDocs(questionsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

const fetchTestByCategoryId = async (categoryId: string): Promise<Test | null> => {
    const testsCollection = collection(db, 'tests');
    const q = query(testsCollection, where('courseId', '==', categoryId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const testDoc = snapshot.docs[0];
    return { id: testDoc.id, ...testDoc.data() } as Test;
};

const updateTestQuestions = async ({ testId, newQuestionIds }: { testId: string; newQuestionIds: string[] }) => {
    const testDocRef = doc(db, 'tests', testId);
    await updateDoc(testDocRef, { questionIds: newQuestionIds });
};

const JitestiTestManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [initialQuestionIds, setInitialQuestionIds] = useState<Set<string>>(new Set());

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<JitestiCategory[]>({ 
    queryKey: ['jitesti-categories'], 
    queryFn: fetchJitestiCategories 
  });

  const { data: allQuestions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({ 
    queryKey: ['questions'], 
    queryFn: fetchAllQuestions 
  });

  const { data: selectedTest, isLoading: isLoadingTest } = useQuery<Test | null>({ 
    queryKey: ['test', selectedCategory], 
    queryFn: () => selectedCategory ? fetchTestByCategoryId(selectedCategory) : null,
    enabled: !!selectedCategory,
  });

  useEffect(() => {
    if (selectedTest && allQuestions.length > 0) {
      const questionIdSet = new Set(selectedTest.questionIds || []);
      setInitialQuestionIds(questionIdSet);
      const newRowSelection: RowSelectionState = {};
      allQuestions.forEach((q, index) => {
        if (questionIdSet.has(q.id)) {
          newRowSelection[index] = true;
        }
      });
      setRowSelection(newRowSelection);
    } else {
      setRowSelection({});
      setInitialQuestionIds(new Set());
    }
  }, [selectedTest, allQuestions]);

  const updateMutation = useMutation({
    mutationFn: updateTestQuestions,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['test', selectedCategory] });
        toast({ title: "Success", description: "Test questions updated successfully." });
    },
    onError: (error) => {
        toast({ title: "Error", description: `Failed to update test: ${error.message}`, variant: "destructive"});
    }
  });

  const handleSave = () => {
    if (selectedTest) {
      const selectedQuestionIds = Object.keys(rowSelection).map(index => allQuestions[parseInt(index)].id);
      updateMutation.mutate({ testId: selectedTest.id, newQuestionIds: selectedQuestionIds });
    }
  };

  const selectedQuestionIds = useMemo(() => new Set(Object.keys(rowSelection).map(index => allQuestions[parseInt(index)]?.id).filter(Boolean)), [rowSelection, allQuestions]);
  
  const isDirty = initialQuestionIds.size !== selectedQuestionIds.size || [...initialQuestionIds].some(id => !selectedQuestionIds.has(id));

  const columns = useMemo(() => createQuestionColumns({
      selectedQuestions: selectedQuestionIds,
      setSelectedQuestions: () => {},
  }), [selectedQuestionIds]);

  return (
    <AdminLayout>
        <AdminBreadcrumbs />
         <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Jitesti Test Assembly</CardTitle>
                <CardDescription>Select a category to assemble the questions for that test.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <div className='w-1/3'>
                    <Select onValueChange={setSelectedCategory} value={selectedCategory || ''}>
                      <SelectTrigger><SelectValue placeholder="Select a Test Category..." /></SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                          categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSave} disabled={!isDirty || updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                    Save Changes
                  </Button>
                </div>

                <DataTable 
                    columns={columns} 
                    data={allQuestions} 
                    filterColumn='question_text_sw'
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                />
              </CardContent>
            </Card>
         </div>
    </AdminLayout>
  );
};

export default JitestiTestManager;
