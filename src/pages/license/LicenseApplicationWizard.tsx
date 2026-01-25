import { useState, useEffect, useMemo } from 'react';
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

const MOCK_REGIONS = ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya'];
const MOCK_DISTRICTS: { [key: string]: string[] } = {
    'Dar es Salaam': ['Ilala', 'Temeke', 'Kinondoni', 'Ubungo', 'Kigamboni'],
    'Mwanza': ['Nyamagana', 'Ilemela', 'Sengerema'],
  };

export default function LicenseApplicationWizard() {
  const { type } = useParams<{ type: 'new' | 'renewal' | 'latra' }>();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getApplicationType = (): ApplicationType => {
    switch (type) {
      case 'new': return 'New License';
      case 'renewal': return 'License Renewal';
      case 'latra': return 'LATRA Exam';
      default: return 'New License';
    }
  };

  const applicationType = getApplicationType();
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const [regions, setRegions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  useEffect(() => {
    setRegionsLoading(true);
    setTimeout(() => {
        setRegions(MOCK_REGIONS);
        setRegionsLoading(false);
    }, 500)
  }, [])

  useEffect(() => {
    if (formData.region) {
      setDistrictsLoading(true);
      setTimeout(() => {
        setDistricts(MOCK_DISTRICTS[formData.region] || []);
        setDistrictsLoading(false);
      }, 500)
    } else {
      setDistricts([]);
    }
  }, [formData.region]);

  const { submitApplication, isSubmitting, error: submitError } = useSubmitApplication();

  const steps = [
    {
      id: 1,
      title: language === 'sw' ? 'Taarifa Binafsi' : 'Personal Information',
      icon: User,
      description: language === 'sw' ? 'Jaza taarifa zako binafsi' : 'Fill in your personal information'
    },
    {
      id: 2,
      title: language === 'sw' ? 'Mahali na Leseni' : 'Location & License',
      icon: MapPin,
      description: language === 'sw' ? 'Chagua mkoa, wilaya na aina ya leseni' : 'Select region, district and license category'
    },
    {
      id: 3,
      title: language === 'sw' ? 'Pakia Nyaraka' : 'Upload Documents',
      icon: Upload,
      description: language === 'sw' ? 'Pakia nyaraka zinazohitajika' : 'Upload required documents'
    },
    {
      id: 4,
      title: language === 'sw' ? 'Kagua na Wasilisha' : 'Review & Submit',
      icon: FileText,
      description: language === 'sw' ? 'Kagua taarifa na wasilisha ombi' : 'Review information and submit application'
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name?.trim()) newErrors.full_name = t('Jina kamili linahitajika');
    if (!formData.phone_number?.trim()) newErrors.phone_number = t('Namba ya simu inahitajika');
    else if (!/^\+?[0-9]{10,13}$/.test(formData.phone_number.replace(/\s/g, ''))) newErrors.phone_number = t('Namba ya simu si sahihi');
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('Barua pepe si sahihi');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.region) newErrors.region = t('Mkoa unahitajika');
    if (!formData.district) newErrors.district = t('Wilaya inahitajika');
    if (!formData.license_category) newErrors.license_category = t('Aina ya leseni inahitajika');
    if (applicationType === 'LATRA Exam' && !formData.latra_type) newErrors.latra_type = t('Aina ya LATRA inahitajika');
    if (applicationType === 'License Renewal' && !formData.current_license_number?.trim()) newErrors.current_license_number = t('Namba ya leseni ya zamani inahitajika');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const requiredDocs = REQUIRED_DOCUMENTS[applicationType];
    if (applicationType === 'LATRA Exam' && formData.latra_type) {
      if (formData.latra_type === 'PSV' && !requiredDocs.includes('PSV Certificate')) requiredDocs.push('PSV Certificate');
      else if (formData.latra_type === 'HGV' && !requiredDocs.includes('HGV Certificate')) requiredDocs.push('HGV Certificate');
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
      case 0: isValid = validateStep1(); break;
      case 1: isValid = validateStep2(); break;
      case 2: isValid = validateStep3(); break;
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
            {/* ... (rest of the component remains the same) */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
