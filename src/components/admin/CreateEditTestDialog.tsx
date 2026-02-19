import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

// --- Type Definitions ---
type Test = {
  id: string;
  test_title_en: string;
  courseId: string;
  questionIds: string[];
  pass_mark_percentage: number;
};

// Corrected type based on firestore_schema.md and screenshots
type JitestiCategory = {
    id: string; // Document ID (e.g., "VIP")
    name_en: string; // Display name (e.g., "VIP Driver Test")
};

type Question = {
    id: string;
    question_text_sw: string;
};

type TestPayload = {
    test_title_en: string;
    courseId: string; // This should be the category document ID, e.g., "VIP"
    pass_mark_percentage: number;
    questionIds: string[];
}

// --- Data Fetching & Mutations ---
const fetchCategories = async (): Promise<JitestiCategory[]> => {
    const categoriesCollection = collection(db, 'jitesti-categories');
    const snapshot = await getDocs(categoriesCollection);
    // Map Firestore documents to the corrected JitestiCategory type
    return snapshot.docs.map(doc => ({
        id: doc.id, // The document ID itself (e.g., "VIP", "BASIC")
        name_en: doc.data().name_en, // The field for the category's English name
    }));
};

const fetchAllQuestions = async (): Promise<Question[]> => {
    const questionsCollection = collection(db, 'Test Question');
    const snapshot = await getDocs(questionsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

const saveTest = async ({testId, payload}: {testId?: string, payload: TestPayload}) => {
    if (testId) {
        const testDocRef = doc(db, 'tests', testId);
        await updateDoc(testDocRef, payload);
    } else {
        const testsCollection = collection(db, 'tests');
        await addDoc(testsCollection, payload);
    }
}

interface CreateEditTestDialogProps {
  testToEdit?: Test | null;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
}

export const CreateEditTestDialog: React.FC<CreateEditTestDialogProps> = ({ testToEdit, isOpen, onOpenChange }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const isEditMode = !!testToEdit;

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [passMark, setPassMark] = useState('');
    const [includedQuestions, setIncludedQuestions] = useState<Question[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: categories, isLoading: isLoadingCategories } = useQuery<JitestiCategory[]>({ 
        queryKey: ['jitesti-categories'], 
        queryFn: fetchCategories,
        enabled: isOpen,
    });

    const { data: allQuestions, isLoading: isLoadingQuestions } = useQuery<Question[]>({ 
        queryKey: ['allQuestions'], 
        queryFn: fetchAllQuestions, 
        enabled: isOpen,
    });
    
    // This one effect handles populating the entire form when in edit mode.
    useEffect(() => {
        if (isEditMode && testToEdit && allQuestions && categories) {
            setTitle(testToEdit.test_title_en ?? '');
            setPassMark(String(testToEdit.pass_mark_percentage ?? ''));

            const initialQuestions = allQuestions.filter(q => testToEdit.questionIds.includes(q.id));
            setIncludedQuestions(initialQuestions);

            // As confirmed by the screenshots, testToEdit.courseId is the Document ID of the category.
            // We find the matching category in the fetched list and set the state.
            const matchingCategory = categories.find(c => c.id === testToEdit.courseId);
            
            if (matchingCategory) {
                // The Select component's value is the category's document ID.
                setCategoryId(matchingCategory.id);
            } else {
                // This warning helps debug if the test's courseId has no match in the categories collection.
                console.warn(`Could not find a matching category in the fetched list for courseId: "${testToEdit.courseId}"`);
            }
        }
    }, [isEditMode, testToEdit, allQuestions, categories]);

    const saveMutation = useMutation({
        mutationFn: saveTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            toast({ title: "Success", description: `Test has been ${isEditMode ? 'updated' : 'created'} successfully.` });
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: `Failed to save test: ${error.message}`, variant: "destructive" });
        }
    })

    const questionsInBank = (allQuestions ?? [])
        .filter(q => !includedQuestions.some(iq => iq.id === q.id))
        .filter(q => q.question_text_sw.toLowerCase().includes(searchTerm.toLowerCase()));

    const addQuestion = (question: Question) => setIncludedQuestions(prev => [...prev, question]);
    const removeQuestion = (question: Question) => setIncludedQuestions(prev => prev.filter(q => q.id !== question.id));

    const handleSave = () => {
        if (!title || !categoryId || !passMark || includedQuestions.length === 0) {
            toast({ title: "Validation Error", description: "Please fill all fields and include at least one question.", variant: "destructive" });
            return;
        }

        // The `categoryId` from state IS the correct document ID (e.g., "VIP") to be saved.
        const payload: TestPayload = {
            test_title_en: title,
            courseId: categoryId, 
            pass_mark_percentage: parseInt(passMark, 10),
            questionIds: includedQuestions.map(q => q.id)
        };

        saveMutation.mutate({ testId: testToEdit?.id, payload });
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Test" : "Create New Test"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Edit the details of this test." : "Create a new test by filling out the form below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Column 1: Test Details */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="test-title">Test Title (English)</Label>
                    <Input id="test-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., VIP Driving Protocol" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="light">
                                {isLoadingCategories ? (
                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                    (categories ?? []).map(category => (
                                        // Use category.id for the key/value and category.name_en for the display text.
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name_en}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                         <Label htmlFor="pass-mark">Pass Mark (%)</Label>
                         <Input id="pass-mark" type="number" value={passMark} onChange={e => setPassMark(e.target.value)} placeholder="e.g., 80" />
                    </div>
                </div>
                 {/* Included Questions List */}
                 <div className="border rounded-lg p-3 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Included Questions ({includedQuestions.length})</h3>
                    <div className="space-y-2 h-64 overflow-y-auto">
                        {includedQuestions.length > 0 ? includedQuestions.map(q => (
                            <div key={q.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <p className="text-sm flex-grow truncate pr-2">{q.question_text_sw}</p>
                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(q)}>
                                    <ArrowLeft className="h-4 w-4 text-red-500"/>
                                </Button>
                            </div>
                        )) : <p className="text-sm text-center text-muted-foreground pt-10">No questions added yet.</p>}
                    </div>
                </div>
            </div>

            {/* Column 2: Question Bank */}
            <div className="border rounded-lg p-3 flex flex-col">
                <h3 className="text-lg font-semibold mb-2">Question Bank ({questionsInBank.length})</h3>
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search questions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="space-y-2 h-[27rem] overflow-y-auto">
                     {isLoadingQuestions ? <p className="text-sm text-center text-muted-foreground pt-10">Loading questions...</p> : questionsInBank.map(q => (
                        <div key={q.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                             <p className="text-sm flex-grow truncate pr-2">{q.question_text_sw}</p>
                             <Button variant="ghost" size="icon" onClick={() => addQuestion(q)}>
                                 <ArrowRight className="h-4 w-4 text-green-500"/>
                            </Button>
                        </div>
                     ))}
                     {questionsInBank.length === 0 && !isLoadingQuestions && <p className="text-sm text-center text-muted-foreground pt-10">No matching questions found.</p>}
                </div>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {isEditMode ? 'Save Changes' : 'Create Test'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
