import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronsRight, ChevronsLeft } from 'lucide-react';

// --- TYPE DEFINITIONS ---
// FINAL FIX: Added the 'category' property to the Question type.
// This ensures the type matches the database schema and resolves the TypeScript error.
export type Question = {
    id: string;
    question_text_en?: string;
    question_text_sw?: string;
    category?: string; // This was the missing piece.
    courseId?: string;
};

interface QuestionSelectorProps {
    allQuestions: Question[];
    selectedQuestionIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    isLoading?: boolean;
}

// --- COMPONENT ---
const QuestionSelector: React.FC<QuestionSelectorProps> = ({ 
    allQuestions, 
    selectedQuestionIds, 
    onSelectionChange, 
    isLoading 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const { availableQuestions, selectedQuestions } = useMemo(() => {
        const selectedSet = new Set(selectedQuestionIds);
        // The available questions are those NOT in the selected set.
        const available = allQuestions.filter(q => !selectedSet.has(q.id));
        // The selected questions are those that ARE in the selected set.
        const selected = allQuestions.filter(q => selectedSet.has(q.id));
        return { availableQuestions: available, selectedQuestions: selected };
    }, [allQuestions, selectedQuestionIds]);

    // This filter works on the search term within the "Available Questions" list.
    const filteredAvailableQuestions = useMemo(() => {
        if (!searchTerm) return availableQuestions;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return availableQuestions.filter(q => 
            (q.question_text_en && q.question_text_en.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (q.question_text_sw && q.question_text_sw.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [searchTerm, availableQuestions]);


    const handleAdd = (questionId: string) => {
        onSelectionChange([...selectedQuestionIds, questionId]);
    };

    const handleRemove = (questionId: string) => {
        onSelectionChange(selectedQuestionIds.filter(id => id !== questionId));
    };

    const QuestionItem = ({ question, onAction, actionSymbol, buttonVariant }: any) => (
        <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
            <span className='text-sm text-foreground'>
                {question.question_text_en || question.question_text_sw || `(No Title) - ID: ${question.id}`}
            </span>
            <Button variant={buttonVariant || "outline"} size="sm" onClick={() => onAction(question.id)}>
                {actionSymbol}
            </Button>
        </div>
    );


    return (
        <div className="grid grid-cols-11 gap-4 items-center">
            {/* Available Questions */}
            <div className="col-span-5">
                <h4 className="text-sm font-semibold mb-2 text-foreground">Available Questions ({filteredAvailableQuestions.length})</h4>
                <Input 
                    placeholder="Search questions..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="mb-2"
                />
                <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                        {isLoading ? <p className="text-foreground">Loading...</p> : filteredAvailableQuestions.map(question => (
                            <QuestionItem 
                                key={question.id} 
                                question={question} 
                                onAction={handleAdd} 
                                actionSymbol="+" 
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex flex-col items-center justify-center gap-2">
                <Button variant="outline" size="icon" disabled>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" disabled>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            </div>

            {/* Selected Questions */}
            <div className="col-span-5">
                <h4 className="text-sm font-semibold mb-2 text-foreground">Assigned Questions ({selectedQuestions.length})</h4>
                 <ScrollArea className="h-80 w-full rounded-md border">
                    <div className="p-4">
                        {selectedQuestions.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-10">No questions assigned.</p>
                        ) : selectedQuestions.map(question => (
                            <QuestionItem 
                                key={question.id} 
                                question={question} 
                                onAction={handleRemove} 
                                actionSymbol="-"
                                buttonVariant="destructive"
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default QuestionSelector;
