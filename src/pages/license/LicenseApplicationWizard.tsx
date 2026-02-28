
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useApplicationForm, 
  useSubmitApplication, 
  useFileValidation
} from '@/hooks/useApplications';
import { 
  MultiDocumentUpload, 
} from '@/components/license/DocumentUpload';
import type { ApplicationType, LicenseCategory, LatraType, DocumentType } from '@/types/license';
import { 
  LICENSE_CATEGORIES, 
  APPLICATION_TYPES, 
  REQUIRED_DOCUMENTS, 
  FILE_UPLOAD_CONFIG
} from '@/types/license';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  MapPin, 
  Upload, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const MOCK_REGIONS = ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya'];
const MOCK_DISTRICTS: { [key: string]: string[] } = {
    'Dar es Salaam': ['Ilala', 'Temeke', 'Kinondoni', 'Ubungo', 'Kigamboni'],
    'Mwanza': ['Nyamagana', 'Ilemela', 'Sengerema'],
    'Arusha': ['Arusha City', 'Arusha Rural', 'Meru'],
    'Dodoma': ['Dodoma Urban', 'Bahi', 'Chamwino'],
    'Mbeya': ['Mbeya Urban', 'Rungwe', 'Kyela'],
  };

export default function LicenseApplicationWizard() {
  const { type } = useParams<{ type: string }>();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const applicationType = useMemo((): ApplicationType => {
    switch (type) {
      case 'new': return 'New License';
      case 'renewal': return 'License Renewal';
      case 'latra': return 'LATRA Exam';
      default: return 'New License'; // Default or navigate to a not-found page
    }
  }, [type]);

  const { submit, isSubmitting } = useSubmitApplication();
  const validateFile = useFileValidation(FILE_UPLOAD_CONFIG);

  const {
    formData,
    currentStep,
    uploadedFiles,
    updateFormData,
    nextStep,
    previousStep,
    addFile,
    removeFile
  } = useApplicationForm({
    application_type: applicationType,
    full_name: user?.full_name || user?.email?.split('@')[0] || '',
    phone_number: user?.mobile_no || '',
    email: user?.email || '',
    nida_number: '',
    date_of_birth: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regions] = useState<string[]>(MOCK_REGIONS);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (formData.region) {
      setDistricts(MOCK_DISTRICTS[formData.region] || []);
    } else {
      setDistricts([]);
    }
  }, [formData.region]);

  const steps = useMemo(() => [
    { id: 1, title: t('personal_info'), icon: User, description: t('fill_personal_info') },
    { id: 2, title: t('location_license'), icon: MapPin, description: t('select_location_license') },
    { id: 3, title: t('upload_documents'), icon: Upload, description: t('upload_required_docs') },
    { id: 4, title: t('review_submit'), icon: FileText, description: t('review_and_submit') }
  ], [t]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const validateStep = useCallback(() => {
    const newErrors: Record<string, string> = {};
    switch (currentStep) {
      case 0: // Personal Information
        if (!formData.full_name?.trim()) newErrors.full_name = t('full_name_required');
        if (!formData.nida_number?.trim()) newErrors.nida_number = t('nida_number_required');
        if (!formData.date_of_birth?.trim()) newErrors.date_of_birth = t('date_of_birth_required');
        if (!formData.phone_number?.trim()) newErrors.phone_number = t('phone_number_required');
        else if (!/^\+?[0-9]{10,13}$/.test(formData.phone_number.replace(/\s/g, ''))) newErrors.phone_number = t('invalid_phone_number');
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('invalid_email');
        break;
      case 1: // Location & License
        if (!formData.region) newErrors.region = t('region_required');
        if (!formData.district) newErrors.district = t('district_required');
        if (!formData.license_category) newErrors.license_category = t('license_category_required');
        if (applicationType === 'LATRA Exam' && !formData.latra_type) newErrors.latra_type = t('latra_type_required');
        if (applicationType === 'License Renewal' && !formData.current_license_number?.trim()) newErrors.current_license_number = t('current_license_required');
        break;
      case 2: // Upload Documents
        const requiredDocs = REQUIRED_DOCUMENTS[applicationType];
        const uploadedDocTypes = uploadedFiles.map(f => f.documentType);
        const missingDocs = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));
        if (missingDocs.length > 0) {
          toast.error(`${t('missing_documents')}: ${missingDocs.join(', ')}`);
          return false;
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, uploadedFiles, applicationType, t]);

  const handleNext = () => {
    if (validateStep()) {
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const result = await submit(formData, uploadedFiles);

    if (result.success && result.applicationId) {
      toast.success(result.message);
      // Navigate to confirmation page, which will handle the payment step
      navigate(`/license/confirmation/${result.applicationId}`);
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error(t('please_log_in'));
      navigate('/login');
    }
  }, [user, navigate, t]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('full_name')}</Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => updateFormData({ full_name: e.target.value })} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nida_number">{t('nida_number')}</Label>
              <Input id="nida_number" value={formData.nida_number} onChange={(e) => updateFormData({ nida_number: e.target.value })} />
              {errors.nida_number && <p className="text-sm text-destructive">{errors.nida_number}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">{t('date_of_birth')}</Label>
              <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => updateFormData({ date_of_birth: e.target.value })} />
              {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone_number">{t('phone_number')}</Label>
              <Input id="phone_number" value={formData.phone_number} onChange={(e) => updateFormData({ phone_number: e.target.value })} />
              {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => updateFormData({ email: e.target.value })} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>
        );
      case 1:
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('region')}</Label>
                        <Select value={formData.region} onValueChange={(value) => updateFormData({ region: value, district: '' })}>
                            <SelectTrigger><SelectValue placeholder={t('select_region')} /></SelectTrigger>
                            <SelectContent>
                                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('district')}</Label>
                        <Select value={formData.district} onValueChange={(value) => updateFormData({ district: value })} disabled={!formData.region}>
                            <SelectTrigger><SelectValue placeholder={t('select_district')} /></SelectTrigger>
                            <SelectContent>
                                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>{t('license_category')}</Label>
                    <Select value={formData.license_category?.join(',')} onValueChange={(value) => updateFormData({ license_category: value.split(',') as LicenseCategory[] })}>
                        <SelectTrigger><SelectValue placeholder={t('select_license_category')} /></SelectTrigger>
                        <SelectContent>
                            {LICENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.license_category && <p className="text-sm text-destructive">{errors.license_category}</p>}
                </div>
                {applicationType === 'License Renewal' && (
                    <div className="space-y-2">
                        <Label htmlFor="current_license_number">{t('current_license_number')}</Label>
                        <Input id="current_license_number" value={formData.current_license_number || ''} onChange={(e) => updateFormData({ current_license_number: e.target.value })} />
                        {errors.current_license_number && <p className="text-sm text-destructive">{errors.current_license_number}</p>}
                    </div>
                )}
                 {applicationType === 'LATRA Exam' && (
                    <div className="space-y-2">
                         <Label>{t('latra_type')}</Label>
                        <Select value={formData.latra_type} onValueChange={(value) => updateFormData({ latra_type: value as LatraType })}>
                            <SelectTrigger><SelectValue placeholder={t('select_latra_type')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PSV">PSV</SelectItem>
                                <SelectItem value="HGV">HGV</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.latra_type && <p className="text-sm text-destructive">{errors.latra_type}</p>}
                    </div>
                )}
            </div>
        );
      case 2:
        const requiredDocs = REQUIRED_DOCUMENTS[applicationType] || [];
        return (
          <MultiDocumentUpload
            requiredDocuments={requiredDocs}
            uploadedFiles={uploadedFiles}
            onFileAdd={(file, docType) => {
              const error = validateFile(file, docType);
              if (error) {
                toast.error(error);
              } else {
                addFile(file, docType);
              }
            }}
            onFileRemove={removeFile}
          />
        );
      case 3:
        return (
           <div>
             <h3 className="text-lg font-semibold mb-2">{t('review_your_application')}</h3>
             <div className="space-y-2 rounded-lg border p-4">
               <p><strong>{t('full_name')}:</strong> {formData.full_name}</p>
               <p><strong>{t('nida_number')}:</strong> {formData.nida_number}</p>
               <p><strong>{t('date_of_birth')}:</strong> {formData.date_of_birth}</p>
               <p><strong>{t('phone_number')}:</strong> {formData.phone_number}</p>
               <p><strong>{t('email')}:</strong> {formData.email}</p>
               <p><strong>{t('region')}:</strong> {formData.region}</p>
               <p><strong>{t('district')}:</strong> {formData.district}</p>
               <p><strong>{t('license_category')}:</strong> {formData.license_category?.join(', ')}</p>
               <p><strong>{t('application_type')}:</strong> {applicationType}</p>
               <div className="pt-2">
                <h4 className="font-semibold">{t('uploaded_documents')}:</h4>
                <ul className="list-disc pl-5">
                    {uploadedFiles.map(f => <li key={f.documentType}>{f.documentType}</li>)}
                </ul>
               </div>
             </div>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">{t('license_application_wizard')}</h1>
          <p className="text-center text-muted-foreground mb-8">{applicationType}</p>
          
          <div className="mb-8">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div key={step.id} className={`flex items-center ${index === currentStep ? 'font-semibold' : ''}`}>
                  <step.icon className={`mr-2 h-4 w-4 ${index === currentStep ? 'text-primary' : ''}`} />
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-8">
            <Button onClick={previousStep} disabled={currentStep === 0 || isSubmitting}>
              <ChevronLeft className="mr-2 h-4 w-4" /> {t('previous')}
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('submitting')}</>
                ) : (
                  <>{t('submit_proceed_to_payment')} <ChevronRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isSubmitting}>
                {t('next')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
