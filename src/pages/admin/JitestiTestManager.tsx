import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { getColumns } from "@/components/admin/tests/Columns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CreateEditTestDialog from '@/components/admin/tests/CreateEditTestDialog';
import type { Test } from '@/components/admin/tests/Columns';
import type { TestFormData } from '@/components/admin/tests/CreateEditTestDialog';

// --- Type Definitions ---
type JitestiCategory = { id: string; name_en: string; name_sw: string; };

// --- Data Fetching ---
const fetchTests = async (): Promise<Test[]> => {
    const testsCollection = collection(db, 'tests');
    const snapshot = await getDocs(testsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
};

const fetchJitestiCategories = async (): Promise<JitestiCategory[]> => {
    const categoriesCollection = collection(db, 'jitesti-categories');
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JitestiCategory));
};

// --- Main Component ---
const JitestiTestManager: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);

    const { data: tests = [], isLoading: isLoadingTests } = useQuery<Test[]>({ 
        queryKey: ['tests'], 
        queryFn: fetchTests 
    });
    const { data: categories = [] } = useQuery<JitestiCategory[]>({ 
      queryKey: ['jitesti-categories'], 
      queryFn: fetchJitestiCategories 
    });

    // --- Mutations ---
    const createTestMutation = useMutation({
      mutationFn: async (newData: TestFormData) => {
        await addDoc(collection(db, 'tests'), newData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tests'] });
        toast({ title: "Success", description: "Test created successfully." });
        setDialogOpen(false);
      },
      onError: (error) => {
        toast({ title: "Error", description: `Failed to create test: ${error.message}`, variant: "destructive"});
      },
    });

    const updateTestMutation = useMutation({
      mutationFn: async ({ id, ...updateData }: { id: string } & TestFormData) => {
          const testDocRef = doc(db, 'tests', id);
          await updateDoc(testDocRef, updateData as any);
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tests'] });
          toast({ title: "Success", description: "Test updated successfully." });
          setDialogOpen(false);
      },
      onError: (error) => {
          toast({ title: "Error", description: `Failed to update test: ${error.message}`, variant: "destructive"});
      },
    });

    const deleteTestMutation = useMutation({
        mutationFn: async (testId: string) => {
            const testDocRef = doc(db, 'tests', testId);
            await deleteDoc(testDocRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: "Success", description: "Test deleted successfully." });
        },
        onError: (error) => {
            toast({ title: "Error", description: `Failed to delete test: ${error.message}`, variant: "destructive"});
        },
    });

    // --- Event Handlers ---
    const handleCreateNew = () => {
        setSelectedTest(null);
        setDialogOpen(true);
    };

    const handleEdit = (test: Test) => {
        setSelectedTest(test);
        setDialogOpen(true);
    };

    const handleDelete = (testId: string) => {
        deleteTestMutation.mutate(testId);
    };

    const handleDialogClose = () => {
        setSelectedTest(null);
        setDialogOpen(false);
    };

    const handleFormSubmit = (data: TestFormData) => {
      if (selectedTest) {
          updateTestMutation.mutate({ id: selectedTest.id, ...data });
      } else {
          createTestMutation.mutate(data);
      }
    };

    const columns = useMemo(() => getColumns(handleEdit, handleDelete), []);

    return (
        <AdminLayout>
            <div className="mt-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Jitesti Test Manager</CardTitle>
                                <CardDescription>Create, edit, and manage all tests for the Jitesti module.</CardDescription>
                            </div>
                            <Button onClick={handleCreateNew}>Create New Test</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns}
                            data={tests} 
                            filterColumn='test_title_en'
                            isLoading={isLoadingTests}
                        />
                    </CardContent>
                </Card>
            </div>

            <CreateEditTestDialog 
              isOpen={isDialogOpen}
              onClose={handleDialogClose}
              onSubmit={handleFormSubmit}
              initialData={selectedTest}
              categories={categories}
              isSaving={createTestMutation.isPending || updateTestMutation.isPending}
            />
        </AdminLayout>
    );
};

export default JitestiTestManager;
