import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, X, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

const QuestionEditor = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const { toast } = useToast();
  const isNew = questionId === "new";

  const [formData, setFormData] = useState({
    text: "",
    textSw: "",
    category: "B",
    imageUrl: "",
    videoUrl: "",
    explanation: "",
    explanationSw: "",
    status: "draft"
  });

  const [answers, setAnswers] = useState<Answer[]>([
    { id: 1, text: "", isCorrect: true },
    { id: 2, text: "", isCorrect: false },
    { id: 3, text: "", isCorrect: false },
    { id: 4, text: "", isCorrect: false }
  ]);

  const handleAddAnswer = () => {
    if (answers.length < 5) {
      setAnswers([...answers, { id: answers.length + 1, text: "", isCorrect: false }]);
    }
  };

  const handleRemoveAnswer = (id: number) => {
    if (answers.length > 2) {
      setAnswers(answers.filter(a => a.id !== id));
    }
  };

  const handleSave = () => {
    toast({
      title: "Question Saved",
      description: "The question has been saved successfully.",
    });
    navigate("/admin/questions");
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{isNew ? "Create New Question" : "Edit Question"}</h1>
        <p className="text-muted-foreground">Build test questions for the JiTesti exam system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Vehicle Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Category A - Motorcycles</SelectItem>
                    <SelectItem value="B">Category B - Cars</SelectItem>
                    <SelectItem value="C">Category C - Light Trucks</SelectItem>
                    <SelectItem value="D">Category D - Heavy Trucks</SelectItem>
                    <SelectItem value="E">Category E - Passenger Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Question Text (English)</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  placeholder="Enter the question..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textSw">Question Text (Swahili)</Label>
                <Textarea
                  id="textSw"
                  value={formData.textSw}
                  onChange={(e) => setFormData({...formData, textSw: e.target.value})}
                  placeholder="Ingiza swali..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="Enter image URL or upload"
                  />
                  <Button variant="outline" size="icon">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <Button variant="outline" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Answer Choices</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddAnswer}
                  disabled={answers.length >= 5}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Answer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={answers.findIndex(a => a.isCorrect).toString()}
                onValueChange={(value) => {
                  setAnswers(answers.map((a, i) => ({
                    ...a,
                    isCorrect: i === parseInt(value)
                  })));
                }}
              >
                {answers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-2">
                    <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                    <Input
                      value={answer.text}
                      onChange={(e) => {
                        const updated = [...answers];
                        updated[index].text = e.target.value;
                        setAnswers(updated);
                      }}
                      placeholder={`Answer ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAnswer(answer.id)}
                      disabled={answers.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Select the correct answer by clicking the radio button</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Explanation (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (English)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  placeholder="Explain why this is the correct answer..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationSw">Explanation (Swahili)</Label>
                <Textarea
                  id="explanationSw"
                  value={formData.explanationSw}
                  onChange={(e) => setFormData({...formData, explanationSw: e.target.value})}
                  placeholder="Eleza kwa nini hii ndiyo jibu sahihi..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Publish Question</Label>
                <Switch
                  id="status"
                  checked={formData.status === "published"}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, status: checked ? "published" : "draft"})
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.status === "published" 
                  ? "This question is visible in tests" 
                  : "This question is saved as draft"}
              </p>

              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {formData.status === "published" ? "Save & Publish" : "Save Draft"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/questions")}>
                Cancel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answers:</span>
                <span className="font-medium">{answers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Has Image:</span>
                <span className="font-medium">{formData.imageUrl ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Has Video:</span>
                <span className="font-medium">{formData.videoUrl ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{formData.status}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuestionEditor;
