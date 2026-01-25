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

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [language, setLanguage] = useState<'en' | 'sw'>('sw');

  // Load user data when editing
  useEffect(() => {
    if (isEdit && user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setStatus(user.enabled ? 'active' : 'suspended');
      setUserType(user.user_type || 'Driver');

      // Load profile data
      if (user.profile) {
        if (user.user_type === 'Driver') {
          setLicenseNumber(user.profile.license_number || '');
          setLicenseCategory(user.profile.license_category || '');
          setExperience(user.profile.experience_years?.toString() || '');
          setRegion(user.profile.region || '');
          setDistrict(user.profile.district || '');
          setNationalId(user.profile.national_id || '');
          setLanguage(user.profile.preferred_language || 'sw');
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
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate password for new users
    if (!isEdit && !password) {
      toast({
        title: 'Error',
        description: 'Password is required for new users',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEdit) {
        // Update existing user
        const updateData: any = {
          user_id: id,
          full_name: fullName,
          mobile_no: phone,
          email: email || undefined,
        };

        // Add password if provided
        if (password) {
          updateData.password = password;
        }

        // Add user-type specific fields
        if (userType === 'Driver') {
          updateData.license_number = licenseNumber || undefined;
          updateData.license_category = licenseCategory || undefined;
          updateData.experience_years = experience ? parseInt(experience) : undefined;
          updateData.region = region || undefined;
          updateData.district = district || undefined;
          updateData.national_id = nationalId || undefined;
        } else if (userType === 'Employer') {
          updateData.company_name = companyName || undefined;
          updateData.company_type = companyType || undefined;
          updateData.company_registration = companyRegistration || undefined;
          updateData.address = address || undefined;
          updateData.website = website || undefined;
          updateData.region = region || undefined;
          updateData.district = district || undefined;
          updateData.verification_status = verificationStatus;
        } else if (userType === 'Admin') {
          updateData.department = department || undefined;
          updateData.position = position || undefined;
          updateData.is_tutor = isTutor;
          updateData.is_license_officer = isLicenseOfficer;
          updateData.is_test_officer = isTestOfficer;
          updateData.is_finance = isFinance;
          updateData.is_super_admin = isSuperAdmin;
        }

        await updateUser(updateData);

        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Create new user
        const createData: any = {
          full_name: fullName,
          mobile_no: phone,
          user_type: userType,
          email: email || undefined,
          password: password,
          language: language,
        };

        // Add user-type specific fields
        if (userType === 'Driver') {
          createData.license_number = licenseNumber || undefined;
          createData.license_category = licenseCategory || undefined;
          createData.experience_years = experience ? parseInt(experience) : undefined;
          createData.region = region || undefined;
          createData.district = district || undefined;
          createData.national_id = nationalId || undefined;
        } else if (userType === 'Employer') {
          createData.company_name = companyName || undefined;
          createData.company_type = companyType || undefined;
          createData.company_registration = companyRegistration || undefined;
          createData.address = address || undefined;
          createData.website = website || undefined;
          createData.region = region || undefined;
          createData.district = district || undefined;
          createData.verification_status = verificationStatus;
        } else if (userType === 'Admin') {
          createData.department = department || undefined;
          createData.position = position || undefined;
          createData.is_tutor = isTutor;
          createData.is_license_officer = isLicenseOfficer;
          createData.is_test_officer = isTestOfficer;
          createData.is_finance = isFinance;
          createData.is_super_admin = isSuperAdmin;
        }

        await createUser(createData);

        toast({
          title: 'Success',
          description: 'User created successfully. Welcome email has been sent.',
        });
      }

      // Navigate back to users list
      navigate('/admin/users');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || `Failed to ${isEdit ? 'update' : 'create'} user`,
        variant: 'destructive',
      });
    }
  };

  // Show loading state while fetching user data
  if (isEdit && loadingUser) {
    return (
      <AdminLayout>
        <div className="max-w-4xl space-y-6">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (isEdit && loadError) {
    return (
      <AdminLayout>
        <div className="max-w-4xl space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">
                  Failed to load user: {typeof loadError === 'string' ? loadError : loadError?.message || 'Unknown error'}
                </p>
                <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const isSubmitting = creating || updating;

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit User' : 'Add New User'}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Update user information and roles' : 'Create a new user account'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User's personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 712 345 678"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
                    disabled={isSubmitting}
                    required={!isEdit}
                  />
                </div>

                {!isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={language} onValueChange={(value: 'en' | 'sw') => setLanguage(value)} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sw">Swahili</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Type & Role */}
          <Card>
            <CardHeader>
              <CardTitle>User Type & Role</CardTitle>
              <CardDescription>Define the user's role in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select 
                  value={userType} 
                  onValueChange={(value: 'Driver' | 'Employer' | 'Admin') => setUserType(value)}
                  disabled={isEdit || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Employer">Employer</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {isEdit && (
                  <p className="text-sm text-muted-foreground">
                    User type cannot be changed after creation
                  </p>
                )}
              </div>

              {userType === 'Admin' && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <Label className="text-base">Admin Sub-Roles</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select additional admin capabilities
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tutor"
                          checked={isTutor}
                          onCheckedChange={(checked) => setIsTutor(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="tutor" className="text-sm cursor-pointer">
                          Tutor / Instructor
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="license"
                          checked={isLicenseOfficer}
                          onCheckedChange={(checked) => setIsLicenseOfficer(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="license" className="text-sm cursor-pointer">
                          License Officer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="test"
                          checked={isTestOfficer}
                          onCheckedChange={(checked) => setIsTestOfficer(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="test" className="text-sm cursor-pointer">
                          Test / Exam Officer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="finance"
                          checked={isFinance}
                          onCheckedChange={(checked) => setIsFinance(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="finance" className="text-sm cursor-pointer">
                          Finance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="superAdmin"
                          checked={isSuperAdmin}
                          onCheckedChange={(checked) => setIsSuperAdmin(checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="superAdmin" className="text-sm cursor-pointer">
                          Super Admin (Full Access)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conditional Profile Details */}
          {userType === 'Driver' && (
            <Card>
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
                <CardDescription>Driver-specific information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input
                      id="nationalId"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="19XXXXXXXXXX"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="TZ123456"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseCategory">License Category</Label>
                    <Select value={licenseCategory} onValueChange={setLicenseCategory} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A - Motorcycles</SelectItem>
                        <SelectItem value="B">B - Light Vehicles</SelectItem>
                        <SelectItem value="C">C - Medium Vehicles</SelectItem>
                        <SelectItem value="D">D - Heavy Vehicles</SelectItem>
                        <SelectItem value="E">E - Articulated Vehicles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="5"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Dar es Salaam"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Kinondoni"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {userType === 'Employer' && (
            <Card>
              <CardHeader>
                <CardTitle>Employer Profile</CardTitle>
                <CardDescription>Company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="MDV Vehicle Fleet Limited"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select value={companyType} onValueChange={setCompanyType} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="delivery">Delivery Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyRegistration">Company Registration Number</Label>
                    <Input
                      id="companyRegistration"
                      value={companyRegistration}
                      onChange={(e) => setCompanyRegistration(e.target.value)}
                      placeholder="REG123456"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Company address"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Dar es Salaam"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Kinondoni"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationStatus">Verification Status</Label>
                    <Select value={verificationStatus} onValueChange={setVerificationStatus} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unverified">Unverified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {userType === 'Admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Administrative information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="IT Department"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="System Administrator"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-background p-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/users')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UserForm;
