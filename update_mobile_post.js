const fs = require('fs');
const file = '/Users/apple/Documents/AICL/OPA/CLIENT/MDVFLEET/dereva-kiganjani-app/app/(employer)/jobs/post-new.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  "import DateTimePicker from '@react-native-community/datetimepicker';",
  "import DateTimePicker from '@react-native-community/datetimepicker';\nimport { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';"
);

// 2. Constants
const optionsStr = `const EMPLOYMENT_TYPES = ['Full-time', 'Contract', 'Temporary', 'Part-time'];

const QUALIFICATIONS_OPTIONS = [
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

const TRAINING_OPTIONS = [
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

const HOW_TO_APPLY_OPTIONS = [
  "Clicking this link to apply (directs driver to the employer’s platform)",
  "Attach CV to apply",
  "Use the driver job profile to apply"
];`;

content = content.replace("const EMPLOYMENT_TYPES = ['Full-time', 'Contract', 'Temporary', 'Part-time'];", optionsStr);

// 3. State
content = content.replace(
  "    applicationDeadline: '',\n  });",
  "    applicationDeadline: '',\n    how_to_apply: '',\n  });"
);

content = content.replace(
  "  const [skillsList, setSkillsList] = useState<string[]>([]);\n  const [benefitsList, setBenefitsList] = useState<string[]>([]);\n  const [newSkill, setNewSkill] = useState('');\n  const [newBenefit, setNewBenefit] = useState('');",
  "  const [skillsRequiredHtml, setSkillsRequiredHtml] = useState('');\n  const [qualificationsList, setQualificationsList] = useState<string[]>([]);\n  const [trainingsList, setTrainingsList] = useState<string[]>([]);\n  const richText = React.useRef(null);"
);

// 4. useEffect
content = content.replace(
  "            applicationDeadline: data.application_deadline || '',\n          });\n          setSkillsList(data.required_skills || []);\n          setBenefitsList(data.benefits || []);",
  `            applicationDeadline: data.application_deadline || '',\n            how_to_apply: data.how_to_apply || '',\n          });\n          setSkillsRequiredHtml(data.skills_required_html || '');\n          setQualificationsList(data.required_qualification_and_experience || []);\n          setTrainingsList(data.required_training_and_certification || []);`
);

// 5. Submit
content = content.replace(
  "        required_skills: skillsList,\n        benefits: benefitsList,",
  "        required_skills: [],\n        skills_required_html: skillsRequiredHtml,\n        required_qualification_and_experience: qualificationsList,\n        required_training_and_certification: trainingsList,\n        how_to_apply: formData.how_to_apply,\n        benefits: [],"
);

// 6. UI: activePicker handling
content = content.replace(
  "const [activePicker, setActivePicker] = useState<'region' | 'district' | 'type' | null>(null);",
  "const [activePicker, setActivePicker] = useState<'region' | 'district' | 'type' | 'how_to_apply' | null>(null);"
);

content = content.replace(
  "    } else if (activePicker === 'type') {\n      updateField('employmentType', value);\n    }\n    setActivePicker(null);",
  "    } else if (activePicker === 'type') {\n      updateField('employmentType', value);\n    } else if (activePicker === 'how_to_apply') {\n      updateField('how_to_apply', value);\n    }\n    setActivePicker(null);"
);

content = content.replace(
  "      case 'type': return EMPLOYMENT_TYPES;",
  "      case 'type': return EMPLOYMENT_TYPES;\n      case 'how_to_apply': return HOW_TO_APPLY_OPTIONS;"
);

// 7. UI: Requirements replace
const skillsStart = `            <View style={styles.inputGroup}>\n              <Text style={styles.label}>Skills Required</Text>`;
const benefitsEnd = `              </View>\n            </View>`;
// Wait, regex might be tricky. Let's find the exact string.

fs.writeFileSync(file, content);
