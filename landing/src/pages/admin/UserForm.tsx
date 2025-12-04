import { useState } from 'react';
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

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [userType, setUserType] = useState('driver');
  
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

  // Employer-specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // TODO: POST /api/admin/users or PATCH /api/admin/users/:id
    toast({
      title: 'Success',
      description: `User ${isEdit ? 'updated' : 'created'} successfully`,
    });

    navigate('/admin/users');
  };

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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                  </Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {userType === 'admin' && (
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
          {userType === 'driver' && (
            <Card>
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
                <CardDescription>Driver-specific information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="TZ123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseCategory">License Category</Label>
                    <Select value={licenseCategory} onValueChange={setLicenseCategory}>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Dar es Salaam"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Kinondoni"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {userType === 'employer' && (
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select value={companyType} onValueChange={setCompanyType}>
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
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Dar es Salaam"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Kinondoni"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationStatus">Verification Status</Label>
                    <Select value={verificationStatus} onValueChange={setVerificationStatus}>
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

          {/* Actions */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-background p-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Update User' : 'Create User'}</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UserForm;
