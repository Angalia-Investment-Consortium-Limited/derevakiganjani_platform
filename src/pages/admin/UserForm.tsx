import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useUserForm } from '@/hooks/useUserForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { tanzanianRegions } from '@/lib/regions';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { user, isLoading, isSubmitting, error: submissionError, saveUser, isEdit } = useUserForm(id || null);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        ...user,
        ...user.profile,
        status: user.enabled ? 'active' : 'suspended',
        user_type: user.user_type || 'Driver'
      });
    }
  }, [isEdit, user]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.mobile_no) {
      toast({ title: t('error'), description: t('Fill Required Fields'), variant: 'destructive' });
      return;
    }

    if (!isEdit && !formData.password) {
      toast({ title: t('error'), description: t('Password Required For New Users'), variant: 'destructive' });
      return;
    }
    
    try {
      await saveUser(formData);
      toast({ title: t('success'), description: isEdit ? t('User Updated Successfully') : t('userCreatedSuccessfully') });
      navigate('/admin/users');
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || t('Failed To Save User'), variant: 'destructive' });
    }
  };

  if (isEdit && isLoading) {
    return <AdminLayout><div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-10 w-48 mb-2" /><Skeleton className="h-4 w-96" /><Skeleton className="h-64 w-full" /></div></AdminLayout>;
  }

  if (submissionError) {
    return (
        <AdminLayout>
            <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back To Users')}
            </Button>
            <Card><CardContent className="pt-6 text-center py-8"><p className="text-destructive mb-4">{t('Failed To Load User')}: {submissionError}</p></CardContent></Card>
        </AdminLayout>
    );
  }

  const userType = formData.user_type || 'Driver';

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
         <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
             <ArrowLeft className="h-4 w-4 mr-2" />
             {t('Back To Users')}
         </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? t('Edit User') : t('Add New User')}</h1>
          <p className="text-muted-foreground mt-1">{isEdit ? t('Update User Description') : t('Create User Description')}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Basic Information')}</CardTitle>
              <CardDescription>{t('Basic Information Description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="fullName">{t('FullName')} <span className="text-destructive">*</span></Label><Input id="fullName" value={formData.full_name || ''} onChange={(e) => handleChange('full_name', e.target.value)} required disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="phone">{t('phoneNumber')} <span className="text-destructive">*</span></Label><Input id="phone" type="tel" value={formData.mobile_no || ''} onChange={(e) => handleChange('mobile_no', e.target.value)} required disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="email">{t('email')}</Label><Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="password">{isEdit ? t('New Password') : `${t('password')} *`}</Label><PasswordInput id="password" value={formData.password || ''} onChange={(e) => handleChange('password', e.target.value)} placeholder={isEdit ? t('Leave Blank To Keep Current') : ''} disabled={isSubmitting} required={!isEdit} /></div>
              {!isEdit && (<div className="space-y-2"><Label htmlFor="language">{t('Preferred Language')}</Label><Select value={formData.language || 'sw'} onValueChange={(value) => handleChange('language', value)} disabled={isSubmitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sw">Swahili</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>)}
              {isEdit && (<div className="space-y-2"><Label htmlFor="status">{t('status')}</Label><Select value={formData.status || 'active'} onValueChange={(value) => handleChange('status', value)} disabled={isSubmitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{t('active')}</SelectItem><SelectItem value="suspended">{t('suspended')}</SelectItem></SelectContent></Select></div>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('User Type And Role')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2"><Label htmlFor="userType">{t('User Type')}</Label><Select value={userType} onValueChange={(value) => handleChange('user_type', value)} disabled={isEdit || isSubmitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Driver">{t('driver')}</SelectItem><SelectItem value="Employer">{t('employer')}</SelectItem><SelectItem value="Admin">{t('admin')}</SelectItem></SelectContent></Select>{isEdit && <p className="text-sm text-muted-foreground">{t('userTypeCannotBeChanged')}</p>}</div>
                {userType === 'Admin' && (
                    <div className="space-y-4 pt-4"><Separator /><Label className="text-base">{t('Admin Sub Roles')}</Label>
                        <div className="space-y-3">
                           <div className="flex items-center space-x-2"><Checkbox id="tutor" checked={formData.is_tutor || false} onCheckedChange={(c) => handleChange('is_tutor', c)} disabled={isSubmitting} /><label htmlFor="tutor">{t('tutor')}</label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="license" checked={formData.is_license_officer || false} onCheckedChange={(c) => handleChange('is_license_officer', c)} disabled={isSubmitting} /><label htmlFor="license">{t('licenseOfficer')}</label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="test" checked={formData.is_test_officer || false} onCheckedChange={(c) => handleChange('is_test_officer', c)} disabled={isSubmitting} /><label htmlFor="test">{t('testOfficer')}</label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="finance" checked={formData.is_finance || false} onCheckedChange={(c) => handleChange('is_finance', c)} disabled={isSubmitting} /><label htmlFor="finance">{t('finance')}</label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="superAdmin" checked={formData.is_super_admin || false} onCheckedChange={(c) => handleChange('is_super_admin', c)} disabled={isSubmitting} /><label htmlFor="superAdmin">{t('superAdmin')}</label></div>
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>

          {userType === 'Driver' && (
              <Card><CardHeader><CardTitle>{t('Driver Profile')}</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="nationalId">{t('National ID')}</Label><Input id="nationalId" value={formData.national_id || ''} onChange={(e) => handleChange('national_id', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="licenseNumber">{t('License Number')}</Label><Input id="licenseNumber" value={formData.license_number || ''} onChange={(e) => handleChange('license_number', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="licenseCategory">{t('License Category')}</Label><Select value={formData.licenseCategory || ''} onValueChange={(v) => handleChange('licenseCategory', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['A', 'B', 'C', 'D', 'E'].map(c => <SelectItem key={c} value={c}>{t(`class${c}`)}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="experience">{t('Experience Years')}</Label><Input id="experience" type="number" value={formData.experience_years || ''} onChange={(e) => handleChange('experience_years', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="region">{t('region')}</Label><Select value={formData.region || ''} onValueChange={(v) => handleChange('region', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tanzanianRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="district">{t('district')}</Label><Input id="district" value={formData.district || ''} onChange={(e) => handleChange('district', e.target.value)} disabled={isSubmitting} /></div>
              </CardContent></Card>
          )}

          {userType === 'Employer' && (
              <Card><CardHeader><CardTitle>{t('employerProfile')}</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="companyName">{t('Company Name')}</Label><Input id="companyName" value={formData.company_name || ''} onChange={(e) => handleChange('company_name', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="companyType">{t('company  Type')}</Label><Select value={formData.company_type || ''} onValueChange={(v) => handleChange('company_type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="transportation">{t('transportation')}</SelectItem><SelectItem value="logistics">{t('logistics')}</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="companyRegistration">{t('Company Registration Number')}</Label><Input id="companyRegistration" value={formData.company_registration || ''} onChange={(e) => handleChange('company_registration', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="website">{t('website')}</Label><Input id="website" type="url" value={formData.website || ''} onChange={(e) => handleChange('website', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="md:col-span-2 space-y-2"><Label htmlFor="address">{t('address')}</Label><Input id="address" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="region">{t('region')}</Label><Select value={formData.region || ''} onValueChange={(v) => handleChange('region', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tanzanianRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="district">{t('district')}</Label><Input id="district" value={formData.district || ''} onChange={(e) => handleChange('district', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="verificationStatus">{t('Verification Status')}</Label><Select value={formData.verification_status || 'unverified'} onValueChange={(v) => handleChange('verification_status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unverified">{t('unverified')}</SelectItem><SelectItem value="pending">{t('pending')}</SelectItem><SelectItem value="verified">{t('verified')}</SelectItem></SelectContent></Select></div>
              </CardContent></Card>
          )}

          {userType === 'Admin' && (
              <Card><CardHeader><CardTitle>{t('Admin Profile')}</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="department">{t('Department')}</Label><Input id="department" value={formData.department || ''} onChange={(e) => handleChange('department', e.target.value)} disabled={isSubmitting} /></div>
                  <div className="space-y-2"><Label htmlFor="position">{t('Position')}</Label><Input id="position" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} disabled={isSubmitting} /></div>
              </CardContent></Card>
          )}

          <div className="flex justify-end gap-4 sticky bottom-0 bg-background p-4 border-t-2 rounded-b-lg">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')} disabled={isSubmitting}>{t('cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? t('Update User') : t('Create User')}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UserForm;
