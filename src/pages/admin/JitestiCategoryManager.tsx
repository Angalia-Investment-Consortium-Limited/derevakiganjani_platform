import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { TrashIcon, FilePlus } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';

// This type uses camelCase, matching our component's state and props.
type JitestiCategory = {
  id?: string;
  title: string; // Corresponds to name_en in Firestore
  description: string; // Corresponds to description_en in Firestore
  price: number;
  durationInMinutes: number; // Corresponds to duration_minutes in Firestore
  passMark: number; // Corresponds to pass_mark in Firestore
  isActive: boolean; // Corresponds to status in Firestore
};

// Fetches data and maps Firestore's schema to the component's camelCase schema.
const fetchCategories = async (): Promise<JitestiCategory[]> => {
  const categoriesCollection = collection(db, 'jitesti-categories');
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.name_en || '', // Corrected field
      description: data.description_en || '', // Corrected field
      price: data.price || 0,
      durationInMinutes: data.duration_minutes || 0,
      passMark: data.pass_mark || 0,
      isActive: data.status === 'active', // Corrected logic
    };
  });
};

const JitestiCategoryManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<JitestiCategory> | null>(null);

  const { data: categories = [], isLoading } = useQuery<JitestiCategory[]>({ 
    queryKey: ['jitesti-categories'], 
    queryFn: fetchCategories 
  });

  const mutation = useMutation({
    mutationFn: async (categoryData: Partial<JitestiCategory>) => {
      const { id, ...data } = categoryData;
      
      // Map from component's camelCase back to Firestore's schema
      const firestoreData = {
        name_en: data.title,
        description_en: data.description,
        price: Number(data.price) || 0,
        duration_minutes: Number(data.durationInMinutes) || 0,
        pass_mark: Number(data.passMark) || 0,
        status: data.isActive ? 'active' : 'inactive',
      };

      if (id) {
        const docRef = doc(db, 'jitesti-categories', id);
        // We only update, we don't want to overwrite other fields like name_sw
        await updateDoc(docRef, firestoreData);
      } else {
        // For new documents, you might want to set default values for other languages
        await addDoc(collection(db, 'jitesti-categories'), {
            ...firestoreData,
            name_sw: data.title, // Defaulting sw name to en name
            description_sw: data.description, // Defaulting sw description to en description
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jitesti-categories'] });
      toast({ title: 'Success!', description: 'Category saved successfully.' });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `An error occurred: ${error.message}`, variant: 'destructive' });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
        const docRef = doc(db, 'jitesti-categories', categoryId);
        await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jitesti-categories'] });
      toast({ title: 'Deleted', description: 'Category removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Could not delete: ${error.message}`, variant: 'destructive' });
    }
  });

  const handleAddNew = () => {
    setCurrentCategory({ title: '', description: '', price: 0, durationInMinutes: 30, passMark: 80, isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: JitestiCategory) => {
    setCurrentCategory(category);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (currentCategory) {
      mutation.mutate(currentCategory);
    }
  };

  return (
      <AdminLayout>
        <div className="space-y-6">
            <AdminBreadcrumbs />
            <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Jitesti Category Manager</CardTitle>
                    <CardDescription>Create, edit, and manage test categories for the Jitesti module.</CardDescription>
                </div>
                <Button onClick={handleAddNew}><FilePlus className="mr-2 h-4 w-4" />Add New Category</Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No categories found.</p>
                    </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price (TZS)</TableHead>
                        <TableHead>Duration (Mins)</TableHead>
                        <TableHead>Pass Mark (%)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.title}</TableCell>
                          <TableCell>{category.price.toLocaleString()}</TableCell>
                          <TableCell>{category.durationInMinutes}</TableCell>
                          <TableCell>{category.passMark}%</TableCell>
                          <TableCell>{category.isActive ? "Active" : "Inactive"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="mr-2">
                              Edit
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(category.id!)}>
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{currentCategory?.id ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    <DialogDescription>Set the English details for the test category below. Click save when done.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title (EN)</Label>
                      <Input id="title" value={currentCategory?.title || ''} onChange={(e) => setCurrentCategory({...currentCategory, title: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description (EN)</Label>
                      <Input id="description" value={currentCategory?.description || ''} onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price (TZS)</Label>
                      <Input id="price" type="number" value={currentCategory?.price ?? 0} onChange={(e) => setCurrentCategory({...currentCategory, price: e.target.value ? Number(e.target.value) : 0})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">Duration (Mins)</Label>
                      <Input id="duration" type="number" value={currentCategory?.durationInMinutes ?? 0} onChange={(e) => setCurrentCategory({...currentCategory, durationInMinutes: e.target.value ? Number(e.target.value) : 0})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="passMark" className="text-right">Pass Mark (%)</Label>
                      <Input id="passMark" type="number" value={currentCategory?.passMark ?? 0} onChange={(e) => setCurrentCategory({...currentCategory, passMark: e.target.value ? Number(e.target.value) : 0})} className="col-span-3" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="isActive" checked={currentCategory?.isActive || false} onCheckedChange={(checked) => setCurrentCategory({...currentCategory, isActive: checked})} />
                        <Label htmlFor="isActive">Set as Active</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default JitestiCategoryManager;
