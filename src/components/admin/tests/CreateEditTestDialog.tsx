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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Edit2, LayoutList, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import QuestionSelector from './QuestionSelector';
import type { Question } from './QuestionSelector';
import type { TestSection } from './Columns';

// --- TYPE DEFINITIONS ---
export type TestFormData = {
    test_title_en: string;
    instructions_en: string;
    instructions_sw: string;
    pass_mark_percentage: number;
    courseId: string;
    sections: TestSection[];
    questionIds?: string[]; // Kept for legacy fallback updates
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
    const [instructionsEn, setInstructionsEn] = useState('');
    const [instructionsSw, setInstructionsSw] = useState('');
    const [passMark, setPassMark] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    
    // Core structural data
    const [sections, setSections] = useState<TestSection[]>([]);
    
    // UI State
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    
    const { data: allQuestions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({ 
        queryKey: ['questions'], 
        queryFn: fetchAllQuestions,
    });

    useEffect(() => {
        if (isOpen) {
            setEditingSectionId(null);
            
            if (initialData) {
                setTitle(initialData.test_title_en || '');
                setInstructionsEn(initialData.instructions_en || '');
                setInstructionsSw(initialData.instructions_sw || '');
                setPassMark(initialData.pass_mark_percentage?.toString() || '');
                setSelectedCategory(initialData.courseId || undefined);
                
                // Parse sections or convert legacy
                if (initialData.sections && initialData.sections.length > 0) {
                    setSections(initialData.sections);
                } else if (initialData.questionIds && initialData.questionIds.length > 0) {
                    setSections([{
                        id: `sec_${Date.now()}`,
                        title: "General Knowledge (Legacy Migrated)",
                        questionIds: initialData.questionIds,
                        shuffle: true
                    }]);
                } else {
                    setSections([]);
                }
            } else {
                setTitle('');
                setInstructionsEn('');
                setInstructionsSw('');
                setPassMark('');
                setSelectedCategory(undefined);
                setSections([]);
            }
        }
    }, [initialData, isOpen]);

    const activeSection = useMemo(() => 
        sections.find(s => s.id === editingSectionId), 
    [sections, editingSectionId]);

    const questionsForSelector = useMemo(() => {
        const categoryQuestions = selectedCategory
            ? allQuestions.filter(q => q.category === selectedCategory)
            : [];
            
        const currentlySelected = activeSection 
            ? allQuestions.filter(q => activeSection.questionIds.includes(q.id))
            : [];

        const combined = [...categoryQuestions, ...currentlySelected];
        return Array.from(new Map(combined.map(q => [q.id, q])).values());
    }, [selectedCategory, allQuestions, activeSection]);

    const handleSave = () => {
        if (!title || !selectedCategory || !passMark) {
            alert("Please fill all required basic fields: Title, Category, Pass Mark.");
            return;
        }
        
        // Count total questions.
        const total = sections.reduce((acc, sec) => acc + sec.questionIds.length, 0);
        if (total === 0) {
            alert("Please add at least one section with questions.");
            return;
        }

        const testData: TestFormData = {
            test_title_en: title,
            instructions_en: instructionsEn,
            instructions_sw: instructionsSw,
            pass_mark_percentage: parseFloat(passMark) || 0,
            courseId: selectedCategory,
            sections: sections,
            questionIds: [] // Wipe out legacy array fully to prevent duplicates
        };
        onSubmit(testData);
    };

    const addSection = () => {
        const newSec: TestSection = {
            id: `sec_${Date.now()}`,
            title: `New Section ${sections.length + 1}`,
            questionIds: [],
            shuffle: true
        };
        setSections([...sections, newSec]);
        setEditingSectionId(newSec.id);
    };

    const updateSectionTitle = (id: string, newTitle: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, title: newTitle } : s));
    };

    const toggleSectionShuffle = (id: string, shuffle: boolean) => {
        setSections(sections.map(s => s.id === id ? { ...s, shuffle } : s));
    };

    const deleteSection = (id: string) => {
        if(confirm("Are you sure you want to completely remove this section and detach its assigned questions?")) {
            setSections(sections.filter(s => s.id !== id));
            if (editingSectionId === id) setEditingSectionId(null);
        }
    };

    const updateActiveSectionQuestions = (newIds: string[]) => {
        if (!editingSectionId) return;
        setSections(sections.map(s => s.id === editingSectionId ? { ...s, questionIds: newIds } : s));
    };

    const renderBuilderView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 px-2 max-h-[70vh] overflow-y-auto w-full">
            {/* Left Column: Test Configuration */}
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Test Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Test Title *</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" placeholder="e.g. Basic Drivers Knowledge Test" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category *</Label>
                            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name_en}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="passMark" className="text-right">Pass Mark (%) *</Label>
                            <Input id="passMark" type="number" value={passMark} onChange={(e) => setPassMark(e.target.value)} className="col-span-3" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Instructions (Maelekezo)</CardTitle>
                        <CardDescription>Shown to candidates before beginning.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>English Instructions</Label>
                            <Textarea 
                                placeholder="- Do not use your phone&#10;- You have 60 minutes" 
                                value={instructionsEn} 
                                onChange={(e) => setInstructionsEn(e.target.value)} 
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Swahili Instructions</Label>
                            <Textarea 
                                placeholder="- Usitumie simu yako&#10;- Una dakika 60" 
                                value={instructionsSw} 
                                onChange={(e) => setInstructionsSw(e.target.value)} 
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Sections Configuration */}
            <div className="space-y-4 pr-2">
                <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                    <div>
                        <h3 className="font-semibold">Test Structure</h3>
                        <p className="text-xs text-muted-foreground">{sections.length} Sections • {sections.reduce((a, s) => a + s.questionIds.length, 0)} Total Questions</p>
                    </div>
                    <Button onClick={addSection} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Section</Button>
                </div>

                {sections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <LayoutList className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No sections created.</p>
                        <p className="text-sm">Click 'Add Section' to begin structuring your test.</p>
                    </div>
                ) : (
                    sections.map((section, index) => (
                        <Card key={section.id} className="overflow-hidden border-border/50">
                            <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-b">
                                <div className="flex items-center gap-2 flex-grow">
                                    <span className="font-bold text-muted-foreground w-6">{index + 1}.</span>
                                    <Input 
                                        value={section.title} 
                                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                        className="h-8 max-w-[200px] border-transparent font-semibold shadow-none focus-visible:ring-1"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 mr-2">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Shuffle</Label>
                                        <Switch 
                                            checked={section.shuffle} 
                                            onCheckedChange={(v) => toggleSectionShuffle(section.id, v)} 
                                            className="scale-75"
                                        />
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingSectionId(section.id)}>
                                        <Edit2 className="w-3 h-3 mr-2" /> Manage ({section.questionIds.length})
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => deleteSection(section.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );

    const renderQuestionPickerView = () => {
        if (!activeSection) return null;
        return (
            <div className="py-4 space-y-4 px-2">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Manage Questions</h2>
                        <p className="text-muted-foreground">Assigning questions to: <span className="font-medium text-foreground">{activeSection.title}</span></p>
                    </div>
                    <Button variant="outline" onClick={() => setEditingSectionId(null)}>
                        <Check className="w-4 h-4 mr-2" /> Done Making Changes
                    </Button>
                </div>
                
                <QuestionSelector 
                    allQuestions={questionsForSelector}
                    selectedQuestionIds={activeSection.questionIds}
                    onSelectionChange={updateActiveSectionQuestions}
                    isLoading={isLoadingQuestions}
                />
            </div>
        )
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl p-0 overflow-hidden">
                <div className="bg-primary/5 px-6 py-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{initialData ? 'Build / Edit Test' : 'Create Structured Test'}</DialogTitle>
                        <DialogDescription>
                            Organize questions into specific subtopics (sections) and provide candidate instructions.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-4">
                    {editingSectionId ? renderQuestionPickerView() : renderBuilderView()}
                </div>

                {!editingSectionId && (
                    <div className="px-6 py-4 border-t bg-muted/20">
                        <DialogFooter>
                            <Button variant="ghost" onClick={onClose} disabled={isSaving}>Discard</Button>
                            <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Test Structure'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CreateEditTestDialog;
