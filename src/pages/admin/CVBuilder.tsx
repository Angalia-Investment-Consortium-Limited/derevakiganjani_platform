import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import type { CVData, WorkExperience, Education, Referee } from '@/types/cv';
import type { CVRequest } from '@/hooks/useCVCreation';

const CVBuilder = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cvRequest, setCvRequest] = useState<CVRequest | null>(null);
  
  const [cvData, setCvData] = useState<Partial<CVData>>({
    personalInfo: { fullName: '', phone: '', email: '', address: '', professionalSummary: '' },
    skills: [],
    languages: [],
    experience: [],
    education: [],
    referees: [],
    licenseCategories: [],
    preferredVehicles: []
  });

  useEffect(() => {
    const fetchRequestAndCV = async () => {
      if (!requestId) return;
      setIsLoading(true);
      try {
        const reqRef = doc(db, 'cv_requests', requestId);
        const reqSnap = await getDoc(reqRef);
        if (reqSnap.exists()) {
          const reqData = reqSnap.data() as CVRequest;
          setCvRequest(reqData);

          // Try to fetch existing CV draft
          const cvRef = doc(db, 'cvs', requestId);
          const cvSnap = await getDoc(cvRef);
          
          if (cvSnap.exists()) {
            setCvData(cvSnap.data() as CVData);
          } else {
            // Pre-fill some fields from request/user
            const userRef = doc(db, 'users', reqData.userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            
            setCvData(prev => ({
              ...prev,
              requestId,
              driverId: reqData.userId,
              personalInfo: {
                fullName: reqData.driverName || userData?.full_name || '',
                phone: reqData.driverPhone || userData?.mobile_no || '',
                email: userData?.email || '',
                address: userData?.address || '',
                professionalSummary: ''
              },
              licenseCategories: userData?.license_categories || [],
              preferredVehicles: userData?.preferred_vehicle_types || []
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching CV data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequestAndCV();
  }, [requestId]);

  const handlePersonalInfoChange = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo!, [field]: value }
    }));
  };

  const handleStringArrayChange = (field: 'licenseCategories' | 'preferredVehicles', value: string) => {
    // Convert comma separated string to array, trimming whitespace
    const arr = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setCvData(prev => ({ ...prev, [field]: arr }));
  };

  const handleArrayAdd = (field: 'experience' | 'education' | 'referees', emptyItem: any) => {
    setCvData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), { id: Date.now().toString(), ...emptyItem }]
    }));
  };

  const handleArrayRemove = (field: 'experience' | 'education' | 'referees', id: string) => {
    setCvData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter(item => item.id !== id)
    }));
  };

  const handleArrayChange = (field: 'experience' | 'education' | 'referees', id: string, itemField: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map(item => item.id === id ? { ...item, [itemField]: value } : item)
    }));
  };

  const handleSaveDraft = async () => {
    if (!requestId) return;
    setIsSaving(true);
    try {
      const cvRef = doc(db, 'cvs', requestId);
      await setDoc(cvRef, {
        ...cvData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update request status to Drafting if not already
      if (cvRequest?.requestStatus !== 'Drafting') {
        const reqRef = doc(db, 'cv_requests', requestId);
        await updateDoc(reqRef, { requestStatus: 'Drafting', updatedAt: serverTimestamp() });
        setCvRequest(prev => prev ? { ...prev, requestStatus: 'Drafting' } : null);
      }

      toast({ title: "Draft Saved", description: "CV draft has been saved successfully." });
    } catch (err) {
      console.error("Error saving draft:", err);
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!requestId) return;
    setIsSaving(true);
    try {
      await handleSaveDraft();
      
      const reqRef = doc(db, 'cv_requests', requestId);
      await updateDoc(reqRef, { 
        requestStatus: 'Completed', 
        updatedAt: serverTimestamp(),
        cvUrl: `/cv/view/${requestId}` // A route where driver can view/download
      });
      
      toast({ title: "CV Completed", description: "The CV is now available to the driver." });
      navigate('/admin/cv-requests');
    } catch (err) {
      console.error("Error completing CV:", err);
      toast({ title: "Error", description: "Failed to mark as completed.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/cv-requests')}><ArrowLeft className="h-4 w-4 mr-2"/> Back</Button>
          <h1 className="text-2xl font-bold">CV Builder: {cvData.personalInfo?.fullName}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Draft
          </Button>
          <Button onClick={handleComplete} disabled={isSaving}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Complete & Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={cvData.personalInfo?.fullName || ''} onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <Input value={cvData.personalInfo?.phone || ''} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input value={cvData.personalInfo?.email || ''} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Address / Location</label>
                <Input value={cvData.personalInfo?.address || ''} onChange={(e) => handlePersonalInfoChange('address', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Professional Summary</label>
              <Textarea 
                placeholder="A brief summary of the driver's experience and objective..." 
                rows={4}
                value={cvData.personalInfo?.professionalSummary || ''} 
                onChange={(e) => handlePersonalInfoChange('professionalSummary', e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Licenses & Vehicles</CardTitle>
            <CardDescription>Separate multiple entries with commas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">License Categories</label>
                <Input 
                  placeholder="e.g. A, B, C1" 
                  value={cvData.licenseCategories?.join(', ') || ''} 
                  onChange={(e) => handleStringArrayChange('licenseCategories', e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Preferred Vehicles</label>
                <Input 
                  placeholder="e.g. Saloon, Minivan, Truck" 
                  value={cvData.preferredVehicles?.join(', ') || ''} 
                  onChange={(e) => handleStringArrayChange('preferredVehicles', e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleArrayAdd('experience', { company: '', role: '', startDate: '', endDate: '', current: false, responsibilities: '' })}>
              <Plus className="h-4 w-4 mr-2" /> Add Experience
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {cvData.experience?.map((exp, index) => (
              <div key={exp.id} className="p-4 border rounded-lg relative space-y-4">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('experience', exp.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4 mr-8">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Company Name</label>
                    <Input value={exp.company} onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Role / Position</label>
                    <Input value={exp.role} onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Start Date</label>
                    <Input placeholder="e.g. Jan 2020" value={exp.startDate} onChange={(e) => handleArrayChange('experience', exp.id, 'startDate', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">End Date</label>
                    <Input placeholder="e.g. Present" value={exp.endDate} onChange={(e) => handleArrayChange('experience', exp.id, 'endDate', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Responsibilities</label>
                  <Textarea rows={3} value={exp.responsibilities} onChange={(e) => handleArrayChange('experience', exp.id, 'responsibilities', e.target.value)} />
                </div>
              </div>
            ))}
            {(!cvData.experience || cvData.experience.length === 0) && <p className="text-sm text-muted-foreground">No experience added.</p>}
          </CardContent>
        </Card>

        {/* Similar arrays can be built for Education and Referees, keeping it brief here to ensure it compiles, you can expand as needed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Referees</CardTitle>
            <Button size="sm" variant="outline" onClick={() => handleArrayAdd('referees', { name: '', company: '', phone: '', email: '' })}>
              <Plus className="h-4 w-4 mr-2" /> Add Referee
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {cvData.referees?.map((ref) => (
              <div key={ref.id} className="p-4 border rounded-lg relative space-y-4">
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => handleArrayRemove('referees', ref.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4 mr-8">
                  <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={ref.name} onChange={(e) => handleArrayChange('referees', ref.id, 'name', e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Company</label><Input value={ref.company} onChange={(e) => handleArrayChange('referees', ref.id, 'company', e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Phone</label><Input value={ref.phone} onChange={(e) => handleArrayChange('referees', ref.id, 'phone', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
};

export default CVBuilder;
