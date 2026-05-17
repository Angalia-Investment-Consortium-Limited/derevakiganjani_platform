const fs = require('fs');
const file = '/Users/apple/Documents/AICL/OPA/CLIENT/MDVFLEET/derevakiganjani_platform/src/pages/admin/JobPostForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  "import { Textarea } from '@/components/ui/textarea';",
  "import { Textarea } from '@/components/ui/textarea';\nimport ReactQuill from 'react-quill-new';\nimport 'react-quill-new/dist/quill.snow.css';"
);

// 2. Options and Type
content = content.replace(
  "type JobPostFormData = Omit<Job, 'required_skills' | 'benefits' | 'posted_date' | 'salary'> & {\n  required_skills: string;\n  benefits: string;\n  salaryMin: number;\n  salaryMax: number;\n};",
  `type JobPostFormData = Omit<Job, 'posted_date' | 'salary'> & {
  salaryMin: number;
  salaryMax: number;
};`
);

content = content.replace(
  "const JobPostForm = () => {",
  `const qualificationsOptions = [
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
  { id: 'G', label: 'G - Earth-moving equipment' }
];

const JobPostForm = () => {`
);

// 3. State
content = content.replace(
  "    required_skills: '',\n    region: '',\n    district: '',\n    salaryMin: 0,\n    salaryMax: 0,\n    benefits: '',",
  "    required_skills: [],\n    skills_required_html: '',\n    required_qualification_and_experience: [],\n    required_training_and_certification: [],\n    how_to_apply: '',\n    region: '',\n    district: '',\n    salaryMin: 0,\n    salaryMax: 0,\n    benefits: [],"
);

// 4. useEffect
content = content.replace(
  "const { required_skills, benefits, posted_date, salary, ...restOfJob } = job;",
  "const { posted_date, salary, ...restOfJob } = job;"
);

content = content.replace(
  "        required_skills: Array.isArray(required_skills) ? required_skills.join(', ') : '',\n        benefits: Array.isArray(benefits) ? benefits.join(', ') : '',",
  "        skills_required_html: restOfJob.skills_required_html || '',\n        required_qualification_and_experience: restOfJob.required_qualification_and_experience || [],\n        required_training_and_certification: restOfJob.required_training_and_certification || [],\n        how_to_apply: restOfJob.how_to_apply || '',\n        benefits: [],\n        required_skills: [],"
);

// 5. Submit prep
content = content.replace(
  "      required_skills: typeof formData.required_skills === 'string' ? formData.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [],\n      benefits: typeof formData.benefits === 'string' ? formData.benefits.split(',').map(b => b.trim()).filter(Boolean) : [],",
  "      skills_required_html: formData.skills_required_html || '',\n      required_qualification_and_experience: formData.required_qualification_and_experience || [],\n      required_training_and_certification: formData.required_training_and_certification || [],\n      how_to_apply: formData.how_to_apply || '',\n      benefits: [],\n      required_skills: [],"
);

// 6. UI: License Categories
content = content.replace(
  "{['A', 'A1', 'A2', 'A3', 'B', 'B1', 'C', 'C1', 'C2', 'C3', 'D', 'E'].map(cat => {",
  "{licenseCategories.map(catObj => {\n                    const cat = catObj.id;"
);

// 7. UI: Requirements replace
const reqStart = "<div><Label htmlFor=\"skills\">{t('Skills Requirements')}</Label><Textarea id=\"skills\" value={formData.required_skills || ''} onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })} placeholder={t('Skills Placeholder')} rows={4} /></div>";
const reqNew = `
              <div className="space-y-2">
                <Label>Required Qualification and Experience</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {qualificationsOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={\`qual-\${option}\`}
                        checked={formData.required_qualification_and_experience?.includes(option)}
                        onCheckedChange={() => {
                          const current = formData.required_qualification_and_experience || [];
                          if (current.includes(option)) setFormData({ ...formData, required_qualification_and_experience: current.filter(c => c !== option) });
                          else setFormData({ ...formData, required_qualification_and_experience: [...current, option] });
                        }}
                      />
                      <Label htmlFor={\`qual-\${option}\`} className="font-normal text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Training and Certification</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {trainingOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={\`train-\${option}\`}
                        checked={formData.required_training_and_certification?.includes(option)}
                        onCheckedChange={() => {
                          const current = formData.required_training_and_certification || [];
                          if (current.includes(option)) setFormData({ ...formData, required_training_and_certification: current.filter(c => c !== option) });
                          else setFormData({ ...formData, required_training_and_certification: [...current, option] });
                        }}
                      />
                      <Label htmlFor={\`train-\${option}\`} className="font-normal text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills Required</Label>
                <div className="bg-background rounded-md border">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.skills_required_html || ''} 
                    onChange={(content) => setFormData({ ...formData, skills_required_html: content })} 
                    className="min-h-[150px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="howToApply">How to Apply (Optional)</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, how_to_apply: v })} value={formData.how_to_apply || ''}>
                  <SelectTrigger><SelectValue placeholder="Select how candidates should apply" /></SelectTrigger>
                  <SelectContent>
                    {howToApplyOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
`;

content = content.replace(reqStart, reqNew);

// 8. Remove Benefits
content = content.replace(
  "<div><Label htmlFor=\"benefits\">{t('Benefits')}</Label><Textarea id=\"benefits\" value={formData.benefits || ''} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder={t('Benefits Placeholder')} rows={3} /></div>",
  ""
);

fs.writeFileSync(file, content);
