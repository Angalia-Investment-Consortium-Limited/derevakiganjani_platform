import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Calendar, FileText, MapPin, Truck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions, useDistricts } from '@/hooks/useLicense';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, uploadFile } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const OutsourceDriver = () => {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const QUALIFICATIONS = [
    "Primary Education (STD VII)",
    "Secondary Education (Form IV)",
    "Advance Secondary Education (Form VI)",
    "Certificate",
    "Diploma",
    "Advance Diploma",
    "Bachelor's Degree",
    "Valid driver's license with clean records",
    "Experience in driving heavy goods vehicles",
    "Experience in driving light vehicles",
    "Experience in driving buses"
  ];

  const TRAININGS = [
    "VIP grade II certificate from NIT",
    "VIP grade I certificate from NIT",
    "Senior Driver certificate from NIT",
    "PSV certificate from NIT",
    "PSV certificate from VETA",
    "PSV certificate from NIT or VETA",
    "An HGV certificate from NIT",
    "An HGV certificate from VETA",
    "An HGV certificate from NIT or VETA",
    "Defensive Driving Certificate",
    "GCLA Certificate",
    "Knowledge of Four-Wheel Drive (4WD) System",
    "Knowledge of First Aid and CPR procedures",
    "OSHA Fit for Job test report/certificate",
    "LATRA certification",
    "Travel Passport/National ID"
  ];

  const [formData, setFormData] = useState({
    driverLevel: '',
    vehicleType: '',
    numberOfDrivers: '1',
    contractDuration: '',
    startDate: '',
    region: '',
    district: '',
    requirements: '',
    contactNumber: '',
    requiredQualifications: [] as string[],
    requiredTrainings: [] as string[],
  });

  const [companyDocumentFile, setCompanyDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile && (profile as any).phone_number) {
      setFormData(prev => ({ ...prev, contactNumber: (profile as any).phone_number }));
    }
  }, [profile]);

  const { regions } = useRegions();
  const { districts: rawDistricts } = useDistricts(formData.region);
  const districts = rawDistricts.map((d: any) => d.name || d);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'requiredQualifications' | 'requiredTrainings', item: string, checked: boolean) => {
    setFormData((prev) => {
      const currentList = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentList, item] };
      } else {
        return { ...prev, [field]: currentList.filter((i) => i !== item) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driverLevel || !formData.vehicleType || !formData.contractDuration || !formData.startDate || !formData.region || !formData.numberOfDrivers || !formData.contactNumber || !companyDocumentFile) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields, including the company activities document attachment.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const employerId = (profile as any)?.userId || user?.uid || '';
      
      let companyDocumentUrl = '';
      if (companyDocumentFile) {
        const path = `outsource_documents/${employerId}/${Date.now()}_${companyDocumentFile.name}`;
        companyDocumentUrl = await uploadFile(companyDocumentFile, path);
      }
      
      const requestPayload = {
        employerId,
        companyName: (profile as any)?.company_name || 'Unknown Company',
        ...formData,
        companyDocumentUrl,
        status: 'Request Submitted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'outsource_contracts'), requestPayload);

      toast({
        title: 'Request Submitted Successfully!',
        description: 'Our team will review your outsourcing request and contact you with candidates shortly.',
      });

      setFormData({
        driverLevel: '',
        vehicleType: '',
        numberOfDrivers: '1',
        contractDuration: '',
        startDate: '',
        region: '',
        district: '',
        requirements: '',
        contactNumber: (profile as any)?.phone_number || '',
        requiredQualifications: [],
        requiredTrainings: []
      });
      setCompanyDocumentFile(null);
      navigate('/employer/outsource-requests'); // Redirect to tracking dashboard
    } catch (error) {
      console.error("Error submitting outsource request:", error);
      toast({
        title: 'Submission Failed',
        description: 'There was a problem submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/employer/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Outsource a Driver</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Outsource a Driver</h1>
          <p className="text-muted-foreground">
            Submit your requirements for a long-term managed driving contract. MDV will handle recruitment, pairing, and payroll.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Driver Requirements</CardTitle>
            <CardDescription>Specify exactly what type of driver and contract you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Core Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Role Specifics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="driverLevel">Driver Level <span className="text-red-500">*</span></Label>
                    <Select value={formData.driverLevel} onValueChange={(val) => handleInputChange('driverLevel', val)}>
                      <SelectTrigger>
                         <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chauffeur">Chauffeur (Executive)</SelectItem>
                        <SelectItem value="Senior Driver">Senior Driver (5+ years exp)</SelectItem>
                        <SelectItem value="Standard Driver">Standard Driver</SelectItem>
                        <SelectItem value="Junior Driver">Junior/Entry-level Driver</SelectItem>
                        <SelectItem value="Lead Driver">Lead Driver (Fleet Mgmt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Target Vehicle Type <span className="text-red-500">*</span></Label>
                    <Select value={formData.vehicleType} onValueChange={(val) => handleInputChange('vehicleType', val)}>
                      <SelectTrigger>
                         <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedan">Sedan / Saloon</SelectItem>
                        <SelectItem value="SUV">SUV / 4x4</SelectItem>
                        <SelectItem value="Minibus">Minibus / Van (e.g. Hiace)</SelectItem>
                        <SelectItem value="Bus">Large Bus</SelectItem>
                        <SelectItem value="Light Truck">Light Truck (e.g. Canter)</SelectItem>
                        <SelectItem value="Heavy Truck">Heavy Truck (Multi-axle)</SelectItem>
                        <SelectItem value="Specialized">Specialized (e.g. Forklift, Crane)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-blue-600 font-medium">Please submit different forms if you need drivers for more than one type of vehicle.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfDrivers">Number of Drivers Required <span className="text-red-500">*</span></Label>
                    <Input 
                      type="number" 
                      id="numberOfDrivers" 
                      min="1"
                      value={formData.numberOfDrivers}
                      onChange={(e) => handleInputChange('numberOfDrivers', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-base mb-3 block">Required Qualification and Experience</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {QUALIFICATIONS.map((qual) => (
                      <div key={qual} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`qual-${qual}`} 
                          checked={formData.requiredQualifications.includes(qual)}
                          onCheckedChange={(checked) => handleCheckboxChange('requiredQualifications', qual, checked as boolean)}
                        />
                        <label
                          htmlFor={`qual-${qual}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {qual}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-base mb-3 block">Required Training and Certifications</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TRAININGS.map((train) => (
                      <div key={train} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`train-${train}`} 
                          checked={formData.requiredTrainings.includes(train)}
                          onCheckedChange={(checked) => handleCheckboxChange('requiredTrainings', train, checked as boolean)}
                        />
                        <label
                          htmlFor={`train-${train}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {train}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Logistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Contract Logistics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contractDuration">Contract Duration <span className="text-red-500">*</span></Label>
                    <Select value={formData.contractDuration} onValueChange={(val) => handleInputChange('contractDuration', val)}>
                      <SelectTrigger>
                         <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 Month">1 Month (Short term)</SelectItem>
                        <SelectItem value="3 Months">3 Months</SelectItem>
                        <SelectItem value="6 Months">6 Months</SelectItem>
                        <SelectItem value="1 Year">1 Year</SelectItem>
                        <SelectItem value="2+ Years">2+ Years (Long term)</SelectItem>
                        <SelectItem value="Custom">Custom / To be discussed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Expected Start Date <span className="text-red-500">*</span></Label>
                    <Input 
                      type="date" 
                      id="startDate" 
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Phone Number <span className="text-red-500">*</span></Label>
                    <Input 
                      type="tel" 
                      id="contactNumber" 
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="e.g. 07XXXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground">The best number for our team to reach you.</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Deployment Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region <span className="text-red-500">*</span></Label>
                    <Select value={formData.region} onValueChange={(val) => {
                      handleInputChange('region', val);
                      handleInputChange('district', '');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.name} value={region.name}>{region.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District / City</Label>
                    <Select 
                      value={formData.district} 
                      onValueChange={(val) => handleInputChange('district', val)}
                      disabled={!formData.region}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Additional Information
                 </h3>
                 <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100 mb-4">
                    <Label htmlFor="companyDocument" className="text-base">Company Main Activities Document <span className="text-red-500">*</span></Label>
                    <p className="text-sm text-muted-foreground mb-3 mt-1">Please attach a document detailing the company's main activities or those for which you need drivers (PDF, DOC/DOCX).</p>
                    <Input 
                      id="companyDocument" 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCompanyDocumentFile(e.target.files[0]);
                        }
                      }}
                      className="bg-white"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="requirements">Specialized Requirements or Instructions (Optional)</Label>
                    <Textarea 
                      id="requirements" 
                      placeholder="e.g. Cross-border driving experience required, needs valid passport, expected to work weekends..."
                      className="min-h-[120px]"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                    />
                 </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => navigate('/employer/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Outsourcing Status Panel */}
        <Card className="mt-8 bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Outsourcing Process Timeline</CardTitle>
            <CardDescription>
              We ensure a smooth recruitment and onboarding process. You will receive alerts via SMS and Email for each step taken by MDV Fleet:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ul className="space-y-3 text-sm">
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Request successfully submitted</li>
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Request is under review</li>
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> More information required (if applicable)</li>
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Driver sourcing started (max of 2 days)</li>
               </ul>
               <ul className="space-y-3 text-sm">
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Recruitment and selection started (max of 5 days)</li>
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Driver assessment started (max of 5 days)</li>
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Defensive driving training started (max of 3 days)</li>
                 <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Deployment of driver</li>
               </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default OutsourceDriver;
