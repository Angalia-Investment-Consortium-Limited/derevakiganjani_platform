import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye } from 'lucide-react';

const JobPostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    employer: '',
    jobTitle: '',
    jobType: '',
    positions: 1,
    vehicleType: '',
    licenseCategory: [] as string[],
    minExperience: 0,
    skills: '',
    region: '',
    district: '',
    salaryMin: '',
    salaryMax: '',
    benefits: '',
    description: '',
    deadline: '',
    startDate: '',
    status: 'draft'
  });

  const handleSubmit = (status: 'draft' | 'published') => {
    // Validation
    if (!formData.employer || !formData.jobTitle || !formData.vehicleType || 
        formData.licenseCategory.length === 0 || !formData.region || !formData.jobType || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const action = status === 'published' ? 'published' : 'saved as draft';
    toast({
      title: "Success",
      description: `Job post ${action} successfully`,
    });
    navigate('/admin/job-posts');
  };

  return (
    <AdminLayout>
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/job-posts')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Job Posts
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Job Post' : 'Create New Job Post'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Update job post details' : 'Fill in the details to create a new job posting'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Employer & Role */}
        <Card>
          <CardHeader>
            <CardTitle>Employer & Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="employer">Employer *</Label>
              <Input
                id="employer"
                value={formData.employer}
                onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                placeholder="Select or search employer"
              />
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g., Truck Driver, Bus Operator"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobType">Job Type *</Label>
                <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="positions">Number of Positions *</Label>
                <Input
                  id="positions"
                  type="number"
                  min="1"
                  value={formData.positions}
                  onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                <SelectTrigger id="vehicleType">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="licenseCategory">License Category Required *</Label>
              <Select 
                value={formData.licenseCategory[0] || ''} 
                onValueChange={(value) => setFormData({ ...formData, licenseCategory: [value] })}
              >
                <SelectTrigger id="licenseCategory">
                  <SelectValue placeholder="Select license category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Class A (Motorcycle)</SelectItem>
                  <SelectItem value="B">Class B (Light Vehicle)</SelectItem>
                  <SelectItem value="C">Class C (Medium Vehicle)</SelectItem>
                  <SelectItem value="D">Class D (Heavy Vehicle)</SelectItem>
                  <SelectItem value="E">Class E (Articulated Vehicle)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="minExperience">Minimum Experience (years)</Label>
              <Input
                id="minExperience"
                type="number"
                min="0"
                value={formData.minExperience}
                onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills / Requirements</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="List required skills and qualifications"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Compensation */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region *</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
                    <SelectItem value="arusha">Arusha</SelectItem>
                    <SelectItem value="mwanza">Mwanza</SelectItem>
                    <SelectItem value="dodoma">Dodoma</SelectItem>
                    <SelectItem value="mbeya">Mbeya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin">Minimum Salary (TZS)</Label>
                <Input
                  id="salaryMin"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="e.g., 500000"
                />
              </div>

              <div>
                <Label htmlFor="salaryMax">Maximum Salary (TZS)</Label>
                <Input
                  id="salaryMax"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="e.g., 800000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Health insurance, accommodation, transport allowance, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Description & Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Description & Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed job description, responsibilities, and requirements"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/job-posts')}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit('draft')}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit('published')}>
            <Eye className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default JobPostForm;
