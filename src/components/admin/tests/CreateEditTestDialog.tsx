import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import QuestionSelector from './QuestionSelector';
import type { Question } from './QuestionSelector';

// --- TYPE DEFINITIONS ---
export type TestFormData = {
    test_title_en: string;
    pass_mark_percentage: number;
    courseId: string;
    questionIds: string[];
};

type Test = { id: string; } & Partial<TestFormData>;

type JitestiCategory = {
    id: string;
    name_en: string;
    image?: string; 
};

// --- DATA FETCHING ---
const fetchAllQuestions = async (): Promise<Question[]> => {
    const questionsCollection = collection(db, 'Test Question');
    const snapshot = await getDocs(questionsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

// --- PROPS INTERFACE ---
interface CreateEditTestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TestFormData) => void;
    initialData?: Test | null;
    categories: JitestiCategory[];
    isSaving: boolean;
}

// --- COMPONENT ---
const CreateEditTestDialog: React.FC<CreateEditTestDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    categories,
    isSaving,
}) => {
    const [title, setTitle] = useState('');
    const [passMark, setPassMark] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    
    const { data: allQuestions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({ 
        queryKey: ['questions'], 
        queryFn: fetchAllQuestions,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.test_title_en || '');
                setPassMark(initialData.pass_mark_percentage?.toString() || '');
                setSelectedCategory(initialData.courseId || undefined);
                setSelectedQuestionIds(initialData.questionIds || []);
            } else {
                setTitle('');
                setPassMark('');
                setSelectedCategory(undefined);
                setSelectedQuestionIds([]);
            }
        }
    }, [initialData, isOpen]);

    // FIX: This logic correctly filters questions on the client side based on the category ID.
    const questionsForSelector = useMemo(() => {
        // Filter questions where the question's category ID matches the selected category ID.
        const categoryQuestions = selectedCategory
            ? allQuestions.filter(q => q.category === selectedCategory)
            : [];

        // Also include questions that are already selected for this test.
        const currentlySelectedQuestions = allQuestions.filter(q => selectedQuestionIds.includes(q.id));

        // Combine the lists and remove duplicates to ensure selected questions are always visible.
        const combined = [...categoryQuestions, ...currentlySelectedQuestions];
        return Array.from(new Map(combined.map(q => [q.id, q])).values());

    }, [selectedCategory, allQuestions, selectedQuestionIds]);

    const categoryImage = useMemo(() => {
        if (!selectedCategory) return null;
        const category = categories.find(c => c.id === selectedCategory);
        return category?.image || null;
    }, [selectedCategory, categories]);

    const handleSave = () => {
        if (!title || !selectedCategory || !passMark) {
            console.error("Please fill all required fields");
            return;
        }
        const testData: TestFormData = {
            test_title_en: title,
            pass_mark_percentage: parseFloat(passMark) || 0,
            courseId: selectedCategory,
            questionIds: selectedQuestionIds,
        };
        onSubmit(testData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Test' : 'Create New Test'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the test details and assigned questions.' : 'Fill in the details for the new test and assign questions.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Test Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="passMark" className="text-right">Pass Mark (%)</Label>
                            <Input id="passMark" type="number" value={passMark} onChange={(e) => setPassMark(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a test category to see questions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {categoryImage && (
                            <div className="flex justify-center items-center p-4 border rounded-md bg-muted/30">
                                <img src={categoryImage} alt="Category visual aid" className="max-h-48 w-auto rounded-sm" />
                            </div>
                        )}
                    </div>

                    <div>
                        <QuestionSelector 
                            allQuestions={questionsForSelector}
                            selectedQuestionIds={selectedQuestionIds}
                            onSelectionChange={setSelectedQuestionIds}
                            isLoading={isLoadingQuestions}
                       />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Test
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEditTestDialog;
