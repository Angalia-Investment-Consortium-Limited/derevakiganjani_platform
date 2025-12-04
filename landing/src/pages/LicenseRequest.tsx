import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const LicenseRequest = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  const handleSubmit = (e: React.FormEvent, type: 'new' | 'renewal') => {
    e.preventDefault();
    const refNo = `DRV-2025-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setReferenceNo(refNo);
    setSubmitted(true);
    toast.success(t(type === 'new' ? 'New license request submitted!' : 'License renewal request submitted!'));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">{t('Request Submitted Successfully!')}</CardTitle>
              <CardDescription className="text-lg">
                {t('Reference Number')}: <span className="font-bold text-primary">{referenceNo}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('Your license request has been received. You will be notified once it is processed.')}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/dashboard')}>{t('Back to Dashboard')}</Button>
                <Button variant="outline" onClick={() => setSubmitted(false)}>{t('Submit Another Request')}</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{t('License Services - Leseni')}</h1>
            <p className="text-muted-foreground">{t('Apply for a new license or renew your existing one')}</p>
          </div>

          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="new">{t('New License')}</TabsTrigger>
              <TabsTrigger value="renewal">{t('License Renewal')}</TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Apply for New License')}</CardTitle>
                  <CardDescription>{t('Submit your documents to apply for a new driver\'s license')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'new')} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-name">{t('Full Name')}</Label>
                        <Input id="new-name" placeholder={t('Enter your full name')} required />
                      </div>

                      <div>
                        <Label htmlFor="new-id">{t('National ID Number')}</Label>
                        <Input id="new-id" placeholder={t('Enter your National ID')} required />
                      </div>

                      <div>
                        <Label htmlFor="new-category">{t('License Category')}</Label>
                        <select 
                          id="new-category" 
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="">{t('Select category')}</option>
                          <option value="A">A - {t('Motorcycles')}</option>
                          <option value="B">B - {t('Light vehicles')}</option>
                          <option value="C">C - {t('Heavy vehicles')}</option>
                          <option value="D">D - {t('Passenger vehicles')}</option>
                          <option value="E">E - {t('Trailer vehicles')}</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="new-id-upload">{t('Upload National ID Photo')}</Label>
                        <div className="mt-2 border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input 
                            id="new-id-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf"
                            required 
                          />
                          <label htmlFor="new-id-upload" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">{t('Click to upload or drag and drop')}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{t('PNG, JPG or PDF (max. 5MB)')}</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="new-photo">{t('Upload Passport Photo')}</Label>
                        <div className="mt-2 border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input 
                            id="new-photo" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            required 
                          />
                          <label htmlFor="new-photo" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">{t('Click to upload or drag and drop')}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{t('PNG or JPG (max. 5MB)')}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('Submit Application')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="renewal">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Renew Your License')}</CardTitle>
                  <CardDescription>{t('Submit your documents to renew your existing driver\'s license')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, 'renewal')} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="renewal-license">{t('Current License Number')}</Label>
                        <Input id="renewal-license" placeholder={t('Enter your license number')} required />
                      </div>

                      <div>
                        <Label htmlFor="renewal-id">{t('National ID Number')}</Label>
                        <Input id="renewal-id" placeholder={t('Enter your National ID')} required />
                      </div>

                      <div>
                        <Label htmlFor="renewal-license-upload">{t('Upload Current License Photo')}</Label>
                        <div className="mt-2 border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input 
                            id="renewal-license-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf"
                            required 
                          />
                          <label htmlFor="renewal-license-upload" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">{t('Click to upload or drag and drop')}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{t('PNG, JPG or PDF (max. 5MB)')}</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="renewal-id-upload">{t('Upload National ID Photo')}</Label>
                        <div className="mt-2 border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input 
                            id="renewal-id-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf"
                            required 
                          />
                          <label htmlFor="renewal-id-upload" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">{t('Click to upload or drag and drop')}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{t('PNG, JPG or PDF (max. 5MB)')}</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="renewal-photo">{t('Upload Recent Passport Photo')}</Label>
                        <div className="mt-2 border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input 
                            id="renewal-photo" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            required 
                          />
                          <label htmlFor="renewal-photo" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">{t('Click to upload or drag and drop')}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{t('PNG or JPG (max. 5MB)')}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('Submit Renewal Request')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LicenseRequest;
