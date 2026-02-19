import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateEditTestDialog } from '@/components/admin/CreateEditTestDialog';

// --- Type Definitions ---
type Test = {
  id: string;
  test_title_en: string;
  courseId: string;
  questionIds: string[];
  pass_mark_percentage: number;
};

// --- Data Fetching & Mutations ---
const fetchTests = async (): Promise<Test[]> => {
  const testsCollection = collection(db, 'tests');
  const snapshot = await getDocs(testsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
};

const deleteTest = async (testId: string) => {
    const testDocRef = doc(db, 'tests', testId);
    await deleteDoc(testDocRef);
}

const JitestiTestManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for dialogs
  const [isCrudDialogOpen, setIsCrudDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State for holding the test being acted upon
  const [testToEdit, setTestToEdit] = useState<Test | null>(null);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  const { data: tests = [], isLoading: isLoadingTests, error } = useQuery<Test[]>({ 
    queryKey: ['tests'], 
    queryFn: fetchTests 
  });

  const deleteMutation = useMutation({
      mutationFn: deleteTest,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tests'] });
          toast({ title: "Success", description: "The test has been deleted." });
          setTestToDelete(null);
      },
      onError: (error) => {
          toast({ title: "Error", description: `Failed to delete test: ${error.message}`, variant: "destructive"});
      },
      onSettled: () => {
          setIsDeleteDialogOpen(false);
      }
  })

  const handleCreateClick = () => {
      setTestToEdit(null);
      setIsCrudDialogOpen(true);
  }

  const handleEditClick = (test: Test) => {
      setTestToEdit(test);
      setIsCrudDialogOpen(true);
  }

  const handleDeleteClick = (test: Test) => {
      setTestToDelete(test);
      setIsDeleteDialogOpen(true);
  }

  return (
    <AdminLayout>
        <AdminBreadcrumbs />
         <div className="mt-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Jitesti Test Manager</CardTitle>
                    <CardDescription>Create, edit, and manage all tests for the Jitesti module.</CardDescription>
                </div>
                <div>
                    <Button onClick={handleCreateClick}>
                        Create New Test
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Test Title</TableHead>
                        <TableHead>Category ID</TableHead>
                        <TableHead>No. of Questions</TableHead>
                        <TableHead>Pass Mark</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingTests ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Loading tests...</TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-red-500">Error loading tests.</TableCell>
                            </TableRow>
                        ) : tests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No tests found. Click 'Create New Test' to begin.</TableCell>
                            </TableRow>
                        ) : (
                            tests.map(test => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.test_title_en}</TableCell>
                                    <TableCell>{test.courseId}</TableCell>
                                    <TableCell>{test.questionIds?.length || 0}</TableCell>
                                    <TableCell>{test.pass_mark_percentage}%</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => handleEditClick(test)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className='text-red-600'
                                                    onSelect={() => handleDeleteClick(test)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            </Card>
         </div>

        {/* CRUD Dialog */}
        <CreateEditTestDialog 
            key={testToEdit ? testToEdit.id : 'create'}
            isOpen={isCrudDialogOpen} 
            onOpenChange={setIsCrudDialogOpen} 
            testToEdit={testToEdit}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the test
                     <span className='font-bold'> "{testToDelete?.test_title_en}"</span>.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => testToDelete && deleteMutation.mutate(testToDelete.id)}
                    disabled={deleteMutation.isPending}
                    className='bg-red-600 hover:bg-red-700'
                >
                    {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Yes, delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </AdminLayout>
  );
};

export default JitestiTestManager;
