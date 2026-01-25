import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Save, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TestConfiguration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [config, setConfig] = useState({
    category: "B",
    questionCount: 30,
    timeLimit: 30,
    passingScore: 75,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showExplanations: true,
    allowReview: true,
    maxAttempts: 3
  });

  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Test settings have been updated successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Test Configuration</h1>
        <p className="text-muted-foreground">Configure JiTesti test settings and parameters</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Parameters</CardTitle>
                <CardDescription>Set the basic test configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Vehicle Category</Label>
                  <Select value={config.category} onValueChange={(value) => setConfig({...config, category: value})}>
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
                  <Label htmlFor="questionCount">
                    Number of Questions: <span className="font-bold">{config.questionCount}</span>
                  </Label>
                  <Slider
                    id="questionCount"
                    value={[config.questionCount]}
                    onValueChange={(value) => setConfig({...config, questionCount: value[0]})}
                    min={10}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Questions will be randomly selected from the question bank</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">
                    Time Limit: <span className="font-bold">{config.timeLimit} minutes</span>
                  </Label>
                  <Slider
                    id="timeLimit"
                    value={[config.timeLimit]}
                    onValueChange={(value) => setConfig({...config, timeLimit: value[0]})}
                    min={15}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">
                    Passing Score: <span className="font-bold">{config.passingScore}%</span>
                  </Label>
                  <Slider
                    id="passingScore"
                    value={[config.passingScore]}
                    onValueChange={(value) => setConfig({...config, passingScore: value[0]})}
                    min={50}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Minimum score required to pass the test</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={config.maxAttempts}
                    onChange={(e) => setConfig({...config, maxAttempts: parseInt(e.target.value)})}
                    min={1}
                    max={10}
                  />
                  <p className="text-xs text-muted-foreground">Number of times a user can attempt the test</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Behavior</CardTitle>
                <CardDescription>Configure how the test operates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shuffle Questions</Label>
                    <p className="text-xs text-muted-foreground">Randomize question order for each test</p>
                  </div>
                  <Switch
                    checked={config.shuffleQuestions}
                    onCheckedChange={(checked) => setConfig({...config, shuffleQuestions: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shuffle Answers</Label>
                    <p className="text-xs text-muted-foreground">Randomize answer choices for each question</p>
                  </div>
                  <Switch
                    checked={config.shuffleAnswers}
                    onCheckedChange={(checked) => setConfig({...config, shuffleAnswers: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Explanations</Label>
                    <p className="text-xs text-muted-foreground">Display answer explanations after submission</p>
                  </div>
                  <Switch
                    checked={config.showExplanations}
                    onCheckedChange={(checked) => setConfig({...config, showExplanations: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Review</Label>
                    <p className="text-xs text-muted-foreground">Let users review questions before final submission</p>
                  </div>
                  <Switch
                    checked={config.allowReview}
                    onCheckedChange={(checked) => setConfig({...config, allowReview: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/admin")}>
                  Back to Admin
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Current Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">Category {config.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Questions per Test</p>
                  <p className="font-medium">{config.questionCount} questions</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Limit</p>
                  <p className="font-medium">{config.timeLimit} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Passing Score</p>
                  <p className="font-medium">{config.passingScore}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max Attempts</p>
                  <p className="font-medium">{config.maxAttempts} times</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-2">Options Enabled</p>
                  <div className="space-y-1">
                    {config.shuffleQuestions && <p className="text-xs">✓ Shuffle Questions</p>}
                    {config.shuffleAnswers && <p className="text-xs">✓ Shuffle Answers</p>}
                    {config.showExplanations && <p className="text-xs">✓ Show Explanations</p>}
                    {config.allowReview && <p className="text-xs">✓ Allow Review</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TestConfiguration;
