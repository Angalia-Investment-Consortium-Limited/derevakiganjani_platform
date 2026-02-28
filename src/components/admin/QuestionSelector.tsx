
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Question = { id: string; text_en: string };

interface QuestionSelectorProps {
  selectedQuestionIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({ selectedQuestionIds, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: questions = [], isLoading } = useQuery<Question[]>({ 
    queryKey: ['questions'], 
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'questions'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    }
  });

  const filteredQuestions = questions.filter(q => 
    q.text_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (questionId: string) => {
    const newSelection = selectedQuestionIds.includes(questionId)
      ? selectedQuestionIds.filter(id => id !== questionId)
      : [...selectedQuestionIds, questionId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Search questions..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="h-64 w-full rounded-md border p-4">
        {isLoading ? <p>Loading questions...</p> : (
          <div className="space-y-2">
            {filteredQuestions.map(q => (
              <div key={q.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={q.id}
                  checked={selectedQuestionIds.includes(q.id)}
                  onCheckedChange={() => handleSelect(q.id)}
                />
                <Label htmlFor={q.id} className="font-normal">{q.text_en}</Label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};