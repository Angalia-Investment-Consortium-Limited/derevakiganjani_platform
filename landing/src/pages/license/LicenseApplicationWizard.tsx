/**
 * License Application Wizard
 * 
 * Multi-step wizard for license applications:
 * - Step 1: Application Type & Personal Info
 * - Step 2: Location & License Details
 * - Step 3: Document Upload
 * - Step 4: Review & Submit
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useApplicationForm, 
  useRegions, 
  useDistricts, 
  useSubmitApplication 
} from '@/hooks/useLicense';
import { MultiDocumentUpload } from '@/components/license/DocumentUpload';
import type { ApplicationType, LicenseCategory, LatraType } from '@/types/license';
import { 
  LICENSE_CATEGORIES, 
  APPLICATION_TYPES, 
  REQUIRED_DOCUMENTS 
} from '@/types/license';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  FileText, 
  User, 
  MapPin, 
  Upload, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function LicenseApplicationWizard() {
  const { type } = useParams<{ type: 'new' | 'renewal' | 'latra' }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determine application type from URL
  const getApplicationType = (): ApplicationType => {
    switch (type) {
      case 'new':
        return 'New License';
      case 'renewal':
        return 'License Renewal';
      case 'latra':
        return 'LATRA Exam';
      default:
        return 'New License';
    }
  };

  const applicationType = getApplicationType();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const {
    formData,
    currentStep,
    uploadedFiles,
    updateFormData,
    nextStep,
    previousStep,
    addFile
  } = useApplicationForm({
    application_type: applicationType,
    full_name: user?.full_name || '',
    phone_number: user?.mobile_no || '',
    email: user?.email || ''
  });

  // API hooks
  const { regions, isLoading: regionsLoading } = useRegions();
  const { districts, isLoading: districtsLoading } = useDistricts(formData.region || null);
  const { submitApplication, isSubmitting, error: submitError } = useSubmitApplication();

  // Wizard steps
  const steps = [
    {
      id: 1,
      title: t('Taarifa Binafsi'),
      titleEn: 'Personal Information',
      icon: User,
      description: t('Jaza taarifa zako binafsi')
    },
    {
      id: 2,
      title: t('Mahali na Leseni'),
      titleEn: 'Location & License',
      icon: MapPin,
      description: t('Chagua mkoa, wilaya na aina ya leseni')
    },
    {
      id: 3,
      title: t('Pakia Nyaraka'),
      titleEn: 'Upload Documents',
      icon: Upload,
      description: t('Pakia nyaraka zinazohitajika')
    },
    {
      id: 4,
      title: t('Kagua na Wasilisha'),
      titleEn: 'Review & Submit',
      icon: FileText,
      description: t('Kagua taarifa na wasilisha ombi')
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = t('Jina kamili linahitajika');
    }

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = t('Namba ya simu inahitajika');
    } else if (!/^\+?[0-9]{10,13}$/.test(formData.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = t('Namba ya simu si sahihi');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('Barua pepe si sahihi');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.region) {
      newErrors.region = t('Mkoa unahitajika');
    }

    if (!formData.district) {
      newErrors.district = t('Wilaya inahitajika');
    }

    if (!formData.license_category) {
      newErrors.license_category = t('Aina ya leseni inahitajika');
    }

    if (applicationType === 'LATRA Exam' && !formData.latra_type) {
      newErrors.latra_type = t('Aina ya LATRA inahitajika');
    }

    if (applicationType === 'License Renewal' && !formData.current_license_number?.trim()) {
      newErrors.current_license_number = t('Namba ya leseni ya zamani inahitajika');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const requiredDocs = REQUIRED_DOCUMENTS[applicationType];
    
    // Add PSV/HGV certificate requirement for LATRA exam
    if (applicationType === 'LATRA Exam' && formData.latra_type) {
      if (formData.latra_type === 'PSV' && !requiredDocs.includes('PSV Certificate')) {
        requiredDocs.push('PSV Certificate');
      } else if (formData.latra_type === 'HGV' && !requiredDocs.includes('HGV Certificate')) {
        requiredDocs.push('HGV Certificate');
      }
    }

    const uploadedDocTypes = uploadedFiles.map(f => f.document_type);
    const missingDocs = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));

    if (missingDocs.length > 0) {
      toast.error(t('Tafadhali pakia nyaraka zote zinazohitajika'));
      return false;
    }

    return true;
  };

  const handleNext = () => {
    let isValid = true;

    switch (currentStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      case 2:
        isValid = validateStep3();
        break;
    }

    if (isValid) {
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    previousStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      const result = await submitApplication(formData as any);
      
      if (result) {
        toast.success(t('Ombi limewasilishwa kwa mafanikio!'));
        navigate(`/license/confirmation/${result.application.name}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(t('Kuna tatizo la kuwasilisha ombi. Tafadhali jaribu tena.'));
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error(t('Tafadhali ingia kwanza'));
      navigate('/login');
    }
  }, [user, navigate, t]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/license')}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('Rudi')}
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              {APPLICATION_TYPES[applicationType].nameSwahili}
            </h1>
            <p className="text-muted-foreground">
              {APPLICATION_TYPES[applicationType].descriptionSwahili}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t('Hatua')} {currentStep + 1} {t('ya')} {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% {t('Imekamilika')}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-center ${
                    isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-success text-success-foreground'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Personal Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="full_name">
                      {t('Jina Kamili')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name || ''}
                      onChange={(e) => updateFormData({ full_name: e.target.value })}
                      placeholder={t('Ingiza jina lako kamili')}
                      className={errors.full_name ? 'border-destructive' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone_number">
                      {t('Namba ya Simu')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number || ''}
                      onChange={(e) => updateFormData({ phone_number: e.target.value })}
                      placeholder="+255712345678"
                      className={errors.phone_number ? 'border-destructive' : ''}
                    />
                    {errors.phone_number && (
                      <p className="text-sm text-destructive mt-1">{errors.phone_number}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">{t('Barua Pepe')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      placeholder="example@email.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location & License Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="region">
                      {t('Mkoa')} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.region || ''}
                      onValueChange={(value) => {
                        updateFormData({ region: value, district: '' });
                      }}
                      disabled={regionsLoading}
                    >
                      <SelectTrigger className={errors.region ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('Chagua mkoa')} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.region && (
                      <p className="text-sm text-destructive mt-1">{errors.region}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">
                      {t('Wilaya')} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.district || ''}
                      onValueChange={(value) => updateFormData({ district: value })}
                      disabled={!formData.region || districtsLoading}
                    >
                      <SelectTrigger className={errors.district ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('Chagua wilaya')} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-sm text-destructive mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <Label>
                      {t('Aina ya Leseni')} <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.license_category || ''}
                      onValueChange={(value) => updateFormData({ license_category: value as LicenseCategory })}
                      className="mt-2"
                    >
                      {LICENSE_CATEGORIES.map((category) => (
                        <div key={category.code} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent">
                          <RadioGroupItem value={category.code} id={`cat-${category.code}`} />
                          <Label htmlFor={`cat-${category.code}`} className="flex-1 cursor-pointer">
                            <div className="font-semibold">
                              {t('Daraja')} {category.code} - {category.nameSwahili}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {category.descriptionSwahili}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.license_category && (
                      <p className="text-sm text-destructive mt-1">{errors.license_category}</p>
                    )}
                  </div>

                  {applicationType === 'LATRA Exam' && (
                    <div>
                      <Label>
                        {t('Aina ya LATRA')} <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.latra_type || ''}
                        onValueChange={(value) => updateFormData({ latra_type: value as LatraType })}
                        className="mt-2"
                      >
                        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent">
                          <RadioGroupItem value="PSV" id="latra-psv" />
                          <Label htmlFor="latra-psv" className="flex-1 cursor-pointer">
                            <div className="font-semibold">PSV</div>
                            <div className="text-sm text-muted-foreground">
                              {t('Udereva Magari ya Abiria')}
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent">
                          <RadioGroupItem value="HGV" id="latra-hgv" />
                          <Label htmlFor="latra-hgv" className="flex-1 cursor-pointer">
                            <div className="font-semibold">HGV</div>
                            <div className="text-sm text-muted-foreground">
                              {t('Udereva Magari ya Mizigo')}
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.latra_type && (
                        <p className="text-sm text-destructive mt-1">{errors.latra_type}</p>
                      )}
                    </div>
                  )}

                  {applicationType === 'License Renewal' && (
                    <div>
                      <Label htmlFor="current_license_number">
                        {t('Namba ya Leseni ya Zamani')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="current_license_number"
                        value={formData.current_license_number || ''}
                        onChange={(e) => updateFormData({ current_license_number: e.target.value })}
                        placeholder={t('Ingiza namba ya leseni yako ya zamani')}
                        className={errors.current_license_number ? 'border-destructive' : ''}
                      />
                      {errors.current_license_number && (
                        <p className="text-sm text-destructive mt-1">{errors.current_license_number}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">{t('Maelekezo')}</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{t('Faili zote zinapaswa kuwa PDF, JPG au PNG')}</li>
                          <li>{t('Ukubwa wa kila faili usizidi 8 MB')}</li>
                          <li>{t('Hakikisha picha ni wazi na zinasomeka')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <MultiDocumentUpload
                    requiredDocuments={REQUIRED_DOCUMENTS[applicationType]}
                    onUploadComplete={(files) => {
                      // Handle uploaded files
                      files.forEach(file => addFile(file));
                    }}
                    existingFiles={uploadedFiles}
                  />
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">{t('Kagua Taarifa Zako')}</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('Aina ya Ombi')}</p>
                        <p className="font-medium">{APPLICATION_TYPES[applicationType].nameSwahili}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('Jina Kamili')}</p>
                        <p className="font-medium">{formData.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('Namba ya Simu')}</p>
                        <p className="font-medium">{formData.phone_number}</p>
                      </div>
                      {formData.email && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('Barua Pepe')}</p>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">{t('Mkoa')}</p>
                        <p className="font-medium">{formData.region}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('Wilaya')}</p>
                        <p className="font-medium">{formData.district}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('Aina ya Leseni')}</p>
                        <p className="font-medium">
                          {t('Daraja')} {formData.license_category}
                        </p>
                      </div>
                      {formData.latra_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('Aina ya LATRA')}</p>
                          <p className="font-medium">{formData.latra_type}</p>
                        </div>
                      )}
                      {formData.current_license_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('Namba ya Leseni ya Zamani')}</p>
                          <p className="font-medium">{formData.current_license_number}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('Nyaraka Zilizopakiwa')}</p>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success" />
                            <span>{file.document_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-destructive">
                          <p className="font-semibold mb-1">{t('Kuna Tatizo')}</p>
                          <p>{t('Kuna tatizo la kuwasilisha ombi. Tafadhali jaribu tena.')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('Nyuma')}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                {t('Endelea')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t('Inawasilisha...') : t('Wasilisha Ombi')}
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
