import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload } from 'lucide-react';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '+255',
    nationalId: '',
    licenseNumber: '',
    licenseCategory: '',
  });
  const [progress, setProgress] = useState(20);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Setup Complete",
      description: "Your profile has been created successfully!",
    });
    navigate('/dashboard');
  };

  const updateProgress = () => {
    const fields = Object.values(formData).filter(v => v !== '' && v !== '+255').length;
    setProgress((fields / 5) * 100);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(updateProgress, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profile Completion</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('fullName')}</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t('phoneNumber')}</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">{t('nationalId')}</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    placeholder="19XXXXXXXXXXXXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">{t('licenseNumber')}</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="DL-XXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseCategory">{t('licenseCategory')}</Label>
                  <Select value={formData.licenseCategory} onValueChange={(value) => handleInputChange('licenseCategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Category A - Motorcycle</SelectItem>
                      <SelectItem value="B">Category B - Light Vehicle</SelectItem>
                      <SelectItem value="C">Category C - Medium Vehicle</SelectItem>
                      <SelectItem value="D">Category D - Heavy Vehicle</SelectItem>
                      <SelectItem value="E">Category E - Articulated Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Upload ID Photo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload License Photo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                    {t('back')}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {t('save')} & {t('continue')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
