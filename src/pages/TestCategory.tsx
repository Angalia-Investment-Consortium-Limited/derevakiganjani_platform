import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const TestCategory = () => {
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const categories = [
    { value: 'A', label: 'Category A - Motorcycle', fee: 'TZS 20,000' },
    { value: 'B', label: 'Category B - Light Vehicle', fee: 'TZS 30,000' },
    { value: 'C', label: 'Category C - Medium Vehicle', fee: 'TZS 40,000' },
    { value: 'D', label: 'Category D - Heavy Vehicle', fee: 'TZS 50,000' },
    { value: 'E', label: 'Category E - Articulated Vehicle', fee: 'TZS 60,000' },
  ];

  const selectedCategoryData = categories.find(c => c.value === category);

  const handleStartTest = () => {
    if (!category || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select a category and payment method",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Payment Confirmed",
      description: "Starting your test now...",
    });
    navigate('/test/questions');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/jitesti">JiTesti</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Test Category</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('selectCategory')}</CardTitle>
              <CardDescription>Choose your vehicle category and complete payment to start the test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Vehicle Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fee Display */}
              {selectedCategoryData && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Test Fee:</span>
                    <span className="text-2xl font-bold text-primary">{selectedCategoryData.fee}</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>{t('paymentMethod')}</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex-1 cursor-pointer">M-Pesa</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="airtel" id="airtel" />
                    <Label htmlFor="airtel" className="flex-1 cursor-pointer">Airtel Money</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">Bank Transfer</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Transaction Reference */}
              {paymentMethod && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="reference">Transaction Reference Number</Label>
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Enter payment reference"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Upload Payment Proof (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                  {t('cancel')}
                </Button>
                <Button onClick={handleStartTest} className="flex-1">
                  Confirm & Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TestCategory;
