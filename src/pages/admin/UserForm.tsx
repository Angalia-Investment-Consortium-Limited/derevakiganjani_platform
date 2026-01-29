import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useUser, useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const isEdit = !!id;

  // Fetch user data if editing
  const { user, isLoading: loadingUser, error: loadError } = useUser(id || null);
  const { createUser, loading: creating } = useCreateUser();
  const { updateUser, loading: updating } = useUpdateUser();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [userType, setUserType] = useState<'Driver' | 'Employer' | 'Admin'>('Driver');
  
  // Admin sub-roles
  const [isTutor, setIsTutor] = useState(false);
  const [isLicenseOfficer, setIsLicenseOfficer] = useState(false);
  const [isTestOfficer, setIsTestOfficer] = useState(false);
  const [isFinance, setIsFinance] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Driver-specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [nationalId, setNationalId] = useState('');

  // Employer-specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyRegistration, setCompanyRegistration] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified');

  // Admin-specific fields
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  // Language preference
  const [lang, setLang] = useState<'en' | 'sw'>('sw');

  // Load user data when editing
  useEffect(() => {
    if (isEdit && user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setStatus(user.enabled ? 'active' : 'suspended');
      setUserType(user.user_type || 'Driver');

      if (user.profile) {
        if (user.user_type === 'Driver') {
          setLicenseNumber(user.profile.license_number || '');
          setLicenseCategory(user.profile.license_category || '');
          setExperience(user.profile.experience_years?.toString() || '');
          setRegion(user.profile.region || '');
          setDistrict(user.profile.district || '');
          setNationalId(user.profile.national_id || '');
          setLang(user.profile.preferred_language || 'sw');
        } else if (user.user_type === 'Employer') {
          setCompanyName(user.profile.company_name || '');
          setCompanyType(user.profile.company_type || '');
          setCompanyRegistration(user.profile.company_registration || '');
          setAddress(user.profile.address || '');
          setWebsite(user.profile.website || '');
          setRegion(user.profile.region || '');
          setDistrict(user.profile.district || '');
          setVerificationStatus(user.profile.verification_status || 'unverified');
        } else if (user.user_type === 'Admin') {
          setDepartment(user.profile.department || '');
          setPosition(user.profile.position || '');
          setIsTutor(user.profile.is_tutor || false);
          setIsLicenseOfficer(user.profile.is_license_officer || false);
          setIsTestOfficer(user.profile.is_test_officer || false);
          setIsFinance(user.profile.is_finance || false);
          setIsSuperAdmin(user.profile.is_super_admin || false);
        }
      }
    }
  }, [isEdit, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone) {
      toast({
        title: translations.error,
        description: translations.fillRequiredFields,
        variant: 'destructive',
      });
      return;
    }

    if (!isEdit && !password) {
      toast({
        title: translations.error,
        description: translations.passwordRequiredForNewUsers,
        variant: 'destructive',
      });
      return;
    }

    try {
      const commonData = {
        full_name: fullName,
        mobile_no: phone,
        email: email || undefined,
      };

      let profileData = {};
      if (userType === 'Driver') {
        profileData = { license_number: licenseNumber, license_category: licenseCategory, experience_years: experience, region, district, national_id: nationalId };
      } else if (userType === 'Employer') {
        profileData = { company_name: companyName, company_type: companyType, company_registration: companyRegistration, address, website, region, district, verification_status: verificationStatus };
      } else if (userType === 'Admin') {
        profileData = { department, position, is_tutor: isTutor, is_license_officer: isLicenseOfficer, is_test_officer: isTestOfficer, is_finance: isFinance, is_super_admin: isSuperAdmin };
      }

      if (isEdit) {
        await updateUser({ user_id: id, ...commonData, password: password || undefined, ...profileData });
        toast({ title: translations.success, description: translations.userUpdatedSuccessfully });
      } else {
        await createUser({ ...commonData, user_type: userType, password, language: lang, ...profileData });
        toast({ title: translations.success, description: translations.userCreatedSuccessfully });
      }

      navigate('/admin/users');
    } catch (err: any) {
      toast({
        title: translations.error,
        description: err?.message || translations.failedToSaveUser,
        variant: 'destructive',
      });
    }
  };

  if (isEdit && loadingUser) {
    return <AdminLayout><div className="max-w-4xl space-y-6"><Skeleton className="h-10 w-48 mb-2" /><Skeleton className="h-4 w-96" /></div></AdminLayout>;
  }

  if (isEdit && loadError) {
    return <AdminLayout><Card><CardContent className="pt-6 text-center py-8"><p className="text-destructive mb-4">{translations.failedToLoadUser}: {loadError.message}</p><Button onClick={() => navigate('/admin/users')}>{translations.backToUsers}</Button></CardContent></Card></AdminLayout>;
  }

  const isSubmitting = creating || updating;

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? translations.editUser : translations.addNewUser}</h1>
          <p className="text-muted-foreground mt-1">{isEdit ? translations.updateUserDescription : translations.createUserDescription}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translations.basicInformation}</CardTitle>
              <CardDescription>{translations.basicInformationDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{translations.fullName} <span className="text-destructive">*</span></Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={translations.enterFullName} required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{translations.phoneNumber} <span className="text-destructive">*</span></Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255 712 345 678" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{translations.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{isEdit ? translations.newPassword : `${translations.password} *`}</Label>
                <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEdit ? translations.leaveBlankToKeepCurrent : translations.enterPassword} disabled={isSubmitting} required={!isEdit} />
              </div>
              {!isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="language">{translations.preferredLanguage}</Label>
                    <Select value={lang} onValueChange={(value: 'en' | 'sw') => setLang(value)} disabled={isSubmitting}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sw">Swahili</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="status">{translations.status}</Label>
                    <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{translations.active}</SelectItem>
                        <SelectItem value="suspended">{translations.suspended}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{translations.userTypeAndRole}</CardTitle>
              <CardDescription>{translations.userTypeAndRoleDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="userType">{translations.userType}</Label>
                    <Select value={userType} onValueChange={(value: 'Driver' | 'Employer' | 'Admin') => setUserType(value)} disabled={isEdit || isSubmitting}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Driver">{translations.driver}</SelectItem>
                        <SelectItem value="Employer">{translations.employer}</SelectItem>
                        <SelectItem value="Admin">{translations.admin}</SelectItem>
                      </SelectContent>
                    </Select>
                    {isEdit && <p className="text-sm text-muted-foreground">{translations.userTypeCannotBeChanged}</p>}
                </div>
                {userType === 'Admin' && (
                    <div className="space-y-4 pt-4">
                        <Separator />
                        <Label className="text-base">{translations.adminSubRoles}</Label>
                        <p className="text-sm text-muted-foreground">{translations.adminSubRolesDescription}</p>
                        <div className="space-y-3">
                           <div className="flex items-center space-x-2">
                                <Checkbox id="tutor" checked={isTutor} onCheckedChange={(checked) => setIsTutor(checked as boolean)} disabled={isSubmitting} />
                                <label htmlFor="tutor" className="text-sm cursor-pointer">{translations.tutor}</label>
                           </div>
                           <div className="flex items-center space-x-2">
                                <Checkbox id="license" checked={isLicenseOfficer} onCheckedChange={(checked) => setIsLicenseOfficer(checked as boolean)} disabled={isSubmitting} />
                                <label htmlFor="license" className="text-sm cursor-pointer">{translations.licenseOfficer}</label>
                           </div>
                           <div className="flex items-center space-x-2">
                                <Checkbox id="test" checked={isTestOfficer} onCheckedChange={(checked) => setIsTestOfficer(checked as boolean)} disabled={isSubmitting} />
                                <label htmlFor="test" className="text-sm cursor-pointer">{translations.testOfficer}</label>
                           </div>
                           <div className="flex items-center space-x-2">
                                <Checkbox id="finance" checked={isFinance} onCheckedChange={(checked) => setIsFinance(checked as boolean)} disabled={isSubmitting} />
                                <label htmlFor="finance" className="text-sm cursor-pointer">{translations.finance}</label>
                           </div>
                           <div className="flex items-center space-x-2">
                                <Checkbox id="superAdmin" checked={isSuperAdmin} onCheckedChange={(checked) => setIsSuperAdmin(checked as boolean)} disabled={isSubmitting} />
                                <label htmlFor="superAdmin" className="text-sm cursor-pointer">{translations.superAdmin}</label>
                           </div>
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>

          {userType === 'Driver' && (
              <Card>
                  <CardHeader><CardTitle>{translations.driverProfile}</CardTitle><CardDescription>{translations.driverProfileDescription}</CardDescription></CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="nationalId">{translations.nationalId}</Label><Input id="nationalId" value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="19XXXXXXXXXX" disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="licenseNumber">{translations.licenseNumber}</Label><Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="TZ123456" disabled={isSubmitting} /></div>
                      <div className="space-y-2">
                          <Label htmlFor="licenseCategory">{translations.licenseCategory}</Label>
                          <Select value={licenseCategory} onValueChange={setLicenseCategory} disabled={isSubmitting}>
                              <SelectTrigger><SelectValue placeholder={translations.selectCategory} /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="A">A - {translations.motorcycles}</SelectItem>
                                  <SelectItem value="B">B - {translations.lightVehicles}</SelectItem>
                                  <SelectItem value="C">C - {translations.mediumVehicles}</SelectItem>
                                  <SelectItem value="D">D - {translations.heavyVehicles}</SelectItem>
                                  <SelectItem value="E">E - {translations.articulatedVehicles}</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2"><Label htmlFor="experience">{translations.experienceYears}</Label><Input id="experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="5" disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="region">{translations.region}</Label><Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Dar es Salaam" disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="district">{translations.district}</Label><Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kinondoni" disabled={isSubmitting} /></div>
                  </CardContent>
              </Card>
          )}

          {userType === 'Employer' && (
              <Card>
                  <CardHeader><CardTitle>{translations.employerProfile}</CardTitle><CardDescription>{translations.employerProfileDescription}</CardDescription></CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="companyName">{translations.companyName}</Label><Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="MDV Vehicle Fleet Limited" disabled={isSubmitting} /></div>
                      <div className="space-y-2">
                          <Label htmlFor="companyType">{translations.companyType}</Label>
                          <Select value={companyType} onValueChange={setCompanyType} disabled={isSubmitting}>
                              <SelectTrigger><SelectValue placeholder={translations.selectType} /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="transportation">{translations.transportation}</SelectItem>
                                  <SelectItem value="logistics">{translations.logistics}</SelectItem>
                                  <SelectItem value="delivery">{translations.deliveryServices}</SelectItem>
                                  <SelectItem value="other">{translations.other}</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2"><Label htmlFor="companyRegistration">{translations.companyRegistrationNumber}</Label><Input id="companyRegistration" value={companyRegistration} onChange={(e) => setCompanyRegistration(e.target.value)} placeholder="REG123456" disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="website">{translations.website}</Label><Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" disabled={isSubmitting} /></div>
                      <div className="space-y-2 md:col-span-2"><Label htmlFor="address">{translations.address}</Label><Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={translations.companyAddress} disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="region">{translations.region}</Label><Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Dar es Salaam" disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="district">{translations.district}</Label><Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kinondoni" disabled={isSubmitting} /></div>
                      <div className="space-y-2">
                          <Label htmlFor="verificationStatus">{translations.verificationStatus}</Label>
                          <Select value={verificationStatus} onValueChange={setVerificationStatus} disabled={isSubmitting}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="unverified">{translations.unverified}</SelectItem>
                                  <SelectItem value="pending">{translations.pending}</SelectItem>
                                  <SelectItem value="verified">{translations.verified}</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardContent>
              </Card>
          )}

          {userType === 'Admin' && (
              <Card>
                  <CardHeader><CardTitle>{translations.adminProfile}</CardTitle><CardDescription>{translations.adminProfileDescription}</CardDescription></CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="department">{translations.department}</Label><Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="IT Department" disabled={isSubmitting} /></div>
                      <div className="space-y-2"><Label htmlFor="position">{translations.position}</Label><Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="System Administrator" disabled={isSubmitting} /></div>
                  </CardContent>
              </Card>
          )}

          <div className="flex justify-end gap-4 sticky bottom-0 bg-background p-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')} disabled={isSubmitting}>{translations.cancel}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? translations.updateUser : translations.createUser}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UserForm;
