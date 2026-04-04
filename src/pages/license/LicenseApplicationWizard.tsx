
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { notificationService } from '@/services/notificationService';
import type { ApplicationType, LicenseCategory, LatraType } from '@/types/license';
import {
  LICENSE_CATEGORIES,
  APPLICATION_TYPES,
  REQUIRED_DOCUMENTS,
  FILE_UPLOAD_CONFIG,
  APPLICATION_FEES
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
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const applicationType = useMemo((): ApplicationType => {
    switch (type) {
      case 'new': return 'New License';
      case 'renewal': return 'License Renewal';
      case 'latra': return 'LATRA Exam';
      default: return 'New License';
    }
  }, [type]);

  const { submit: createApplication, isSubmitting } = useSubmitApplication();
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
    tin_number: '',
    street_address: '',
    license_category: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regions] = useState<string[]>(MOCK_REGIONS);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
      case 0:
        if (!formData.full_name?.trim()) newErrors.full_name = t('full_name_required');
        
        if (applicationType === 'LATRA Exam') {
          if (!formData.nida_number?.trim()) newErrors.nida_number = t('nida_number_required');
        } else {
          if (!formData.tin_number?.trim()) newErrors.tin_number = t('tin_number_required');
        }

        if (!formData.phone_number?.trim()) newErrors.phone_number = t('phone_number_required');
        else if (!/^255[0-9]{9}$/.test(formData.phone_number.replace(/\s/g, ''))) newErrors.phone_number = t('invalid_phone_number_format');
        if (formData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = t('invalid_email');
        break;
      case 1:
        if (!formData.region) newErrors.region = t('Region Required');
        if (!formData.district) newErrors.district = t('District Required');
        
        if (applicationType === 'LATRA Exam') {
          if (!formData.latra_type) newErrors.latra_type = t('LATRA Type Required');
          if (!formData.street_address?.trim()) newErrors.street_address = t('Street Address Required');
        }

        if (!formData.license_category || formData.license_category.length === 0) newErrors.license_category = t('License Category Required');
        if (applicationType === 'License Renewal' && !formData.current_license_number?.trim()) newErrors.current_license_number = t('Current License Required');
        break;
      case 2:
        const requiredDocs = REQUIRED_DOCUMENTS[applicationType];
        const uploadedDocTypes = uploadedFiles.map(f => f.documentType);
        const missingDocs = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));
        if (missingDocs.length > 0) {
          toast.error(`${t('Missing Documents')}: ${missingDocs.join(', ')}`);
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

  const handleSubmitAndPay = async () => {
    if (isSubmitting || isProcessingPayment) return;

    // 1. Create the application document in Firestore
    const creationResult = await createApplication(formData, uploadedFiles);

    if (!creationResult.success || !creationResult.applicationId) {
      toast.error(creationResult.message);
      return;
    }

    try {
      if (formData.email) {
          await notificationService.sendEmail(
              formData.email,
              "License Application Received",
              `Hello ${formData.full_name}, your ${applicationType} application has been successfully submitted and is pending payment/review.`,
              user?.uid
          );
      }
      if (user?.uid) {
          await notificationService.sendSystem(user.uid, "License Application Received", `Your ${applicationType} application was submitted successfully.`, { applicationId: creationResult.applicationId });
      }
    } catch(e) {
        console.error("Failed to send notification: ", e);
    }

    toast.info(t('Application Submitted Redirecting to Payment'));
    setIsProcessingPayment(true);

    // 2. Call the Cloud Function to initiate payment
    try {
      const functions = getFunctions();
      const initiateLicensePayment = httpsCallable(functions, 'initiateLicensePayment');

      const fee = APPLICATION_FEES[applicationType];

      const paymentResult = await initiateLicensePayment({
        applicationId: creationResult.applicationId,
        phone: formData.phone_number,
        application: {
          id: creationResult.applicationId,
          type: applicationType,
          fee: fee
        }
      });

      const resultData = paymentResult.data as { success: boolean; applicationId?: string; message?: string };

      if (resultData.success) {
        toast.success(t('Payment Initiated Successfully'));
        navigate(`/license/confirmation/${creationResult.applicationId}`);
      } else {
        throw new Error(resultData.message || t('Payment Initiation Failed'));
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || t('An Error Occurred During Payment'));
      // Optionally revert application status or let user retry payment
      setIsProcessingPayment(false);
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
              <Label htmlFor="full_name">{t('Full Name')}</Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => updateFormData({ full_name: e.target.value })} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
            </div>
            {applicationType === 'LATRA Exam' ? (
              <div className="space-y-2">
                <Label htmlFor="nida_number">{t('NIDA Number')}</Label>
                <Input id="nida_number" value={formData.nida_number} onChange={(e) => updateFormData({ nida_number: e.target.value })} />
                {errors.nida_number && <p className="text-sm text-destructive">{errors.nida_number}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="tin_number">{t('TIN Number')}</Label>
                <Input id="tin_number" value={formData.tin_number} onChange={(e) => updateFormData({ tin_number: e.target.value })} />
                {errors.tin_number && <p className="text-sm text-destructive">{errors.tin_number}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone_number">{t('Phone Number for Payment')}</Label>
              <Input
                id="phone_number"
                placeholder="255xxxxxxxxx"
                value={formData.phone_number}
                onChange={(e) => updateFormData({ phone_number: e.target.value })}
              />
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
                <Label>{t('Region')}</Label>
                <Select value={formData.region} onValueChange={(value) => updateFormData({ region: value, district: '' })}>
                  <SelectTrigger><SelectValue placeholder={t('Select Region')} /></SelectTrigger>
                  <SelectContent>
                    {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('District')}</Label>
                <Select value={formData.district} onValueChange={(value) => updateFormData({ district: value })} disabled={!formData.region}>
                  <SelectTrigger><SelectValue placeholder={t('Select District')} /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
              </div>
            </div>
            {applicationType === 'LATRA Exam' && (
              <div className="space-y-2">
                <Label htmlFor="street_address">{t('Street Address')}</Label>
                <Input id="street_address" value={formData.street_address || ''} onChange={(e) => updateFormData({ street_address: e.target.value })} placeholder={t('Enter your street name')} />
                {errors.street_address && <p className="text-sm text-destructive">{errors.street_address}</p>}
              </div>
            )}
            <div className="space-y-3">
              <Label>{t('License Category')} {t('(Select all that apply)')}</Label>
              <div className="flex flex-wrap gap-2">
                {LICENSE_CATEGORIES.map(c => {
                  const isSelected = formData.license_category?.includes(c);
                  return (
                    <Badge
                      key={c}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2 hover:bg-primary/90 text-sm"
                      onClick={() => {
                        const current = formData.license_category || [];
                        const next = isSelected 
                          ? current.filter(item => item !== c)
                          : [...current, c];
                        updateFormData({ license_category: next as LicenseCategory[] });
                      }}
                    >
                      {c}
                    </Badge>
                  );
                })}
              </div>
              {errors.license_category && <p className="text-sm text-destructive">{errors.license_category}</p>}
            </div>
            {applicationType === 'License Renewal' && (
              <div className="space-y-2">
                <Label htmlFor="current_license_number">{t('Current License Number')}</Label>
                <Input id="current_license_number" value={formData.current_license_number || ''} onChange={(e) => updateFormData({ current_license_number: e.target.value })} />
                {errors.current_license_number && <p className="text-sm text-destructive">{errors.current_license_number}</p>}
              </div>
            )}
            {applicationType === 'LATRA Exam' && (
              <div className="space-y-2">
                <Label>{t('LATRA Type')}</Label>
                <Select value={formData.latra_type} onValueChange={(value) => updateFormData({ latra_type: value as LatraType })}>
                  <SelectTrigger><SelectValue placeholder={t('Select LATRA Type')} /></SelectTrigger>
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
            <h3 className="text-lg font-semibold mb-2">{t('Review Your Application')}</h3>
            <div className="space-y-2 rounded-lg border p-4">
              <p><strong>{t('Full Name')}:</strong> {formData.full_name}</p>
              {applicationType === 'LATRA Exam' ? (
                <p><strong>{t('NIDA Number')}:</strong> {formData.nida_number}</p>
              ) : (
                <p><strong>{t('TIN Number')}:</strong> {formData.tin_number}</p>
              )}
              <p><strong>{t('Phone Number')}:</strong> {formData.phone_number}</p>
              <p><strong>{t('Email')}:</strong> {formData.email}</p>
              <p><strong>{t('Region')}:</strong> {formData.region}</p>
              <p><strong>{t('District')}:</strong> {formData.district}</p>
              {applicationType === 'LATRA Exam' && formData.street_address && (
                <p><strong>{t('Street Address')}:</strong> {formData.street_address}</p>
              )}
              <p><strong>{t('License Category')}:</strong> {formData.license_category?.join(', ')}</p>
              <p><strong>{t('Application Type')}:</strong> {applicationType}</p>
              <div className="pt-2">
                <h4 className="font-semibold">{t('Uploaded Documents')}:</h4>
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
          <h1 className="text-3xl font-bold text-center mb-2">{t('License Application Wizard')}</h1>
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
            <Button onClick={previousStep} disabled={currentStep === 0 || isSubmitting || isProcessingPayment}>
              <ChevronLeft className="mr-2 h-4 w-4" /> {t('Previous')}
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmitAndPay} disabled={isSubmitting || isProcessingPayment}>
                {isProcessingPayment ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('Processing Payment')}</>
                ) : (
                  <>{t('Submit and Proceed to Payment')} <ChevronRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isSubmitting || isProcessingPayment}>
                {t('Next')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
