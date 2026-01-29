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
import { useLanguage } from "@/contexts/LanguageContext";

const TestConfiguration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translations } = useLanguage();

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
      title: translations.configurationSaved,
      description: translations.testSettingsUpdated,
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{translations.testConfiguration}</h1>
        <p className="text-muted-foreground">{translations.testConfigurationDescription}</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{translations.testParameters}</CardTitle>
                <CardDescription>{translations.setBasicTestConfiguration}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">{translations.vehicleCategory}</Label>
                  <Select value={config.category} onValueChange={(value) => setConfig({...config, category: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">{translations.categoryA}</SelectItem>
                      <SelectItem value="B">{translations.categoryB}</SelectItem>
                      <SelectItem value="C">{translations.categoryC}</SelectItem>
                      <SelectItem value="D">{translations.categoryD}</SelectItem>
                      <SelectItem value="E">{translations.categoryE}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCount">{translations.numberOfQuestions}: <span className="font-bold">{config.questionCount}</span></Label>
                  <Slider id="questionCount" value={[config.questionCount]} onValueChange={(value) => setConfig({...config, questionCount: value[0]})} min={10} max={50} step={5} className="w-full" />
                  <p className="text-xs text-muted-foreground">{translations.questionsRandomlySelected}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">{translations.timeLimit}: <span className="font-bold">{config.timeLimit} {translations.minutes}</span></Label>
                  <Slider id="timeLimit" value={[config.timeLimit]} onValueChange={(value) => setConfig({...config, timeLimit: value[0]})} min={15} max={60} step={5} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">{translations.passingScore}: <span className="font-bold">{config.passingScore}%</span></Label>
                  <Slider id="passingScore" value={[config.passingScore]} onValueChange={(value) => setConfig({...config, passingScore: value[0]})} min={50} max={90} step={5} className="w-full" />
                  <p className="text-xs text-muted-foreground">{translations.minScoreToPass}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">{translations.maxAttempts}</Label>
                  <Input id="maxAttempts" type="number" value={config.maxAttempts} onChange={(e) => setConfig({...config, maxAttempts: parseInt(e.target.value)})} min={1} max={10} />
                  <p className="text-xs text-muted-foreground">{translations.maxAttemptsDescription}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{translations.testBehavior}</CardTitle>
                <CardDescription>{translations.configureTestBehavior}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.shuffleQuestions}</Label>
                    <p className="text-xs text-muted-foreground">{translations.shuffleQuestionsDescription}</p>
                  </div>
                  <Switch checked={config.shuffleQuestions} onCheckedChange={(checked) => setConfig({...config, shuffleQuestions: checked})} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.shuffleAnswers}</Label>
                    <p className="text-xs text-muted-foreground">{translations.shuffleAnswersDescription}</p>
                  </div>
                  <Switch checked={config.shuffleAnswers} onCheckedChange={(checked) => setConfig({...config, shuffleAnswers: checked})} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.showExplanations}</Label>
                    <p className="text-xs text-muted-foreground">{translations.showExplanationsDescription}</p>
                  </div>
                  <Switch checked={config.showExplanations} onCheckedChange={(checked) => setConfig({...config, showExplanations: checked})} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{translations.allowReview}</Label>
                    <p className="text-xs text-muted-foreground">{translations.allowReviewDescription}</p>
                  </div>
                  <Switch checked={config.allowReview} onCheckedChange={(checked) => setConfig({...config, allowReview: checked})} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{translations.actions}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSave}><Save className="mr-2 h-4 w-4" />{translations.saveConfiguration}</Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/admin")}>{translations.backToAdmin}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>{translations.currentSettings}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{translations.category}</p>
                  <p className="font-medium">{translations.category} {config.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{translations.questionsPerTest}</p>
                  <p className="font-medium">{config.questionCount} {translations.questions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{translations.timeLimit}</p>
                  <p className="font-medium">{config.timeLimit} {translations.minutes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{translations.passingScore}</p>
                  <p className="font-medium">{config.passingScore}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{translations.maxAttempts}</p>
                  <p className="font-medium">{config.maxAttempts} {translations.times}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-2">{translations.optionsEnabled}</p>
                  <div className="space-y-1">
                    {config.shuffleQuestions && <p className="text-xs">✓ {translations.shuffleQuestions}</p>}
                    {config.shuffleAnswers && <p className="text-xs">✓ {translations.shuffleAnswers}</p>}
                    {config.showExplanations && <p className="text-xs">✓ {translations.showExplanations}</p>}
                    {config.allowReview && <p className="text-xs">✓ {translations.allowReview}</p>}
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
