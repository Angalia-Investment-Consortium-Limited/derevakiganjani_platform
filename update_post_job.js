const fs = require('fs');
const file = '/Users/apple/Documents/AICL/OPA/CLIENT/MDVFLEET/derevakiganjani_platform/src/pages/ajiri-dereva/PostJob.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  "import { Textarea } from '@/components/ui/textarea';",
  "import { Textarea } from '@/components/ui/textarea';\nimport ReactQuill from 'react-quill-new';\nimport 'react-quill-new/dist/quill.snow.css';"
);

// 2. Options arrays
const optionsCode = `
  const qualificationsOptions = [
    "Primary Education (STD VII)",
    "Secondary Education (Form IV)",
    "Advance Secondary Education (Form VI)",
    "Certificate",
    "Diploma",
    "Advance Diploma",
    "Bachelor's Degree",
    "Valid driver’s license with clean records",
    "Experience in driving heavy goods vehicles",
    "Experience in driving light vehicles",
    "Experience in driving buses"
  ];

  const trainingOptions = [
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

  const howToApplyOptions = [
    "Clicking this link to apply (directs driver to the employer’s platform)",
    "Attach CV to apply",
    "Use the driver job profile to apply"
  ];

  const licenseCategories = [
    { id: 'A', label: 'A - Motorcycles' },
    { id: 'A1', label: 'A1 - Motor tricycle' },
    { id: 'A2', label: 'A2 - Light motorcycle' },
    { id: 'A3', label: 'A3 - Motorcycle (disable)' },
    { id: 'B', label: 'B - Light vehicles' },
    { id: 'B1', label: 'B1 - Light vehicle (disable)' },
    { id: 'C', label: 'C - Trucks' },
    { id: 'C1', label: 'C1 - Medium trucks' },
    { id: 'C2', label: 'C2 - Medium buses' },
    { id: 'C3', label: 'C3 - Medium vehicle with trailer' },
    { id: 'D', label: 'D - Heavy buses' },
    { id: 'E', label: 'E - Heavy trucks with trailer' },
    { id: 'F', label: 'F - Tractors' },
    { id: 'G', label: 'G - Earth-moving equipment' },
  ];
`;

content = content.replace(
  "const licenseCategories = [\n    { id: 'A', label: 'A - Motorcycle' },\n    { id: 'B', label: 'B - Car' },\n    { id: 'C1', label: 'C1 - Medium Truck' },\n    { id: 'C2', label: 'C2 - Medium Bus' },\n    { id: 'C3', label: 'C3 - Medium Vehicle with Trailer' },\n    { id: 'D', label: 'D - Heavy Bus' },\n    { id: 'E', label: 'E - Heavy Truck with Trailer' },\n  ];",
  optionsCode
);

// 3. initialFormData
content = content.replace(
  "job_industry_specified: '',\n  };",
  "job_industry_specified: '',\n    required_qualification_and_experience: [],\n    required_training_and_certification: [],\n    how_to_apply: '',\n    skills_required_html: '',\n  };"
);

// 4. fetched data
content = content.replace(
  "job_industry_specified: (data.job_industry && !jobIndustries.includes(data.job_industry)) ? data.job_industry : '',\n            };",
  "job_industry_specified: (data.job_industry && !jobIndustries.includes(data.job_industry)) ? data.job_industry : '',\n              required_qualification_and_experience: data.required_qualification_and_experience || [],\n              required_training_and_certification: data.required_training_and_certification || [],\n              how_to_apply: data.how_to_apply || '',\n              skills_required_html: data.skills_required_html || '',\n            };"
);

// 5. Handlers
const handlersCode = `
  const handleMultiSelectChange = (field: 'required_qualification_and_experience' | 'required_training_and_certification', value: string) => {
    setFormData(prev => {
      const existing = prev[field] || [];
      if (existing.includes(value)) {
        return { ...prev, [field]: existing.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...existing, value] };
      }
    });
  };
`;

content = content.replace(
  "const requiredFields: (keyof PostJobFormData)[] = ['job_title', 'job_type', 'region', 'district', 'job_description', 'application_deadline', 'required_license_category', 'job_industry'];",
  handlersCode + "\n  const requiredFields: (keyof PostJobFormData)[] = ['job_title', 'job_type', 'region', 'district', 'job_description', 'application_deadline', 'required_license_category', 'job_industry'];"
);

// 6. UI Replacement
// We want to replace Skills Required and Benefits with new HTML editor and the new fields.
// The easiest way is to use regex or string split.
const uiStart = '<div className="space-y-4">\n              <Label>Skills Required</Label>';
const uiEnd = '<div className="flex gap-3 pt-4 border-t">';

const newUI = `
            <div className="space-y-2">
              <Label>Required Qualification and Experience</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {qualificationsOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={\`qual-\${option}\`}
                      checked={formData.required_qualification_and_experience?.includes(option)}
                      onCheckedChange={() => handleMultiSelectChange('required_qualification_and_experience', option)}
                      disabled={isSaving}
                    />
                    <Label htmlFor={\`qual-\${option}\`} className="font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Training and Certification</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {trainingOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={\`train-\${option}\`}
                      checked={formData.required_training_and_certification?.includes(option)}
                      onCheckedChange={() => handleMultiSelectChange('required_training_and_certification', option)}
                      disabled={isSaving}
                    />
                    <Label htmlFor={\`train-\${option}\`} className="font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills Required</Label>
              <ReactQuill 
                theme="snow" 
                value={formData.skills_required_html || ''} 
                onChange={(content) => setFormData(prev => ({...prev, skills_required_html: content}))} 
                readOnly={isSaving}
                className="bg-background rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="howToApply">How to Apply</Label>
              <Select onValueChange={(v) => handleSelectChange('how_to_apply', v)} value={formData.how_to_apply || ''} disabled={isSaving}>
                <SelectTrigger><SelectValue placeholder="Select how candidates should apply" /></SelectTrigger>
                <SelectContent>
                  {howToApplyOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            `;

const startIndex = content.indexOf(uiStart);
const endIndex = content.indexOf(uiEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newUI + content.substring(endIndex);
}

fs.writeFileSync(file, content);
