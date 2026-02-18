const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const permissions = [
  // User Management
  { id: 'users:create', name: 'Create Users', description: 'Can create new users' },
  { id: 'users:read', name: 'Read Users', description: 'Can view user list and details' },
  { id: 'users:update', name: 'Update Users', description: 'Can update user information' },
  { id: 'users:delete', name: 'Delete Users', description: 'Can delete users' },
  { id: 'users:manage-roles', name: 'Manage Roles', description: 'Can assign/unassign roles to users' },

  // Role & Permission Management
  { id: 'roles:read', name: 'Read Roles', description: 'Can view roles and their permissions' },
  { id: 'roles:update', name: 'Update Roles', description: 'Can modify the permissions for a role' },

  // Course Management (Tutor)
  { id: 'courses:create', name: 'Create Courses', description: 'Can create new courses' },
  { id: 'courses:update', name: 'Update Courses', description: 'Can update own courses' },
  { id: 'courses:delete', name: 'Delete Courses', description: 'Can delete own courses' },
  { id: 'courses:read', name: 'Read Courses', description: 'Can view all courses' },
  { id: 'courses:enroll', name: 'Enroll in Courses', description: 'Can enroll in a course' },

  // Test & Quiz Management (Tutor/Test Officer)
  { id: 'tests:create', name: 'Create Tests', description: 'Can create tests and quizzes' },
  { id: 'tests:update', name: 'Update Tests', description: 'Can update tests and quizzes' },
  { id: 'tests:delete', name: 'Delete Tests', description: 'Can delete tests and quizzes' },
  { id: 'tests:read', name: 'Read Tests', description: 'Can view all tests' },
  { id: 'tests:take', name: 'Take Tests', description: 'Can take an available test/quiz' },
  { id: 'tests:review', name: 'Review Submissions', description: 'Can review user test submissions' },

  // Job Management (Employer)
  { id: 'jobs:create', name: 'Create Jobs', description: 'Can post new job openings' },
  { id: 'jobs:update', name: 'Update Jobs', description: 'Can update own job postings' },
  { id: 'jobs:delete', name: 'Delete Jobs', description: 'Can delete own job postings' },
  { id: 'jobs:read', name: 'Read Jobs', description: 'Can view all job openings' },
  { id: 'jobs:apply', name: 'Apply for Jobs', description: 'Can apply for a job' },

  // License Management (License Officer)
  { id: 'licenses:create', name: 'Create Applications', description: 'Can start a new license application' },
  { id: 'licenses:read', name: 'Read Applications', description: 'Can view all license applications' },
  { id: 'licenses:update', name: 'Update Applications', description: 'Can update the status of applications (approve/reject)' },

  // Payment & Finance Management
  { id: 'payments:create', name: 'Make Payments', description: 'Can make a payment for a service' },
  { id: 'payments:read', name: 'Read Payments', description: 'Can view all financial transactions' },
  { id: 'payments:update', name: 'Update Payments', description: 'Can process refunds or update payment status' },

  // System Configuration
  { id: 'system:read-config', name: 'Read System Config', description: 'Can view system settings' },
  { id: 'system:update-config', name: 'Update System Config', description: 'Can change system-wide settings' },
];

const roles = [
  {
    id: 'SuperAdmin',
    name: 'Super Admin',
    description: 'Has all permissions and can manage the entire system.',
    permissions: permissions.map(p => p.id), // All permissions
  },
  {
    id: 'Driver',
    name: 'Driver',
    description: 'Users who are looking for jobs and taking courses.',
    permissions: [
      'courses:enroll',
      'tests:take',
      'jobs:read',
      'jobs:apply',
      'licenses:create',
      'payments:create',
      'users:read', // Can view their own profile
      'users:update', // Can update their own profile
    ],
  },
  {
    id: 'Employer',
    name: 'Employer',
    description: 'Users who are posting jobs and hiring drivers.',
    permissions: [
      'jobs:create',
      'jobs:update',
      'jobs:delete',
      'jobs:read',
      'users:read', // Can view applicants
      'payments:create',
    ],
  },
  {
    id: 'Tutor',
    name: 'Tutor',
    description: 'Manages courses and learning materials.',
    permissions: [
      'courses:create',
      'courses:update',
      'courses:delete',
      'courses:read',
      'tests:create',
      'tests:update',
      'tests:delete',
      'tests:read',
      'tests:review',
    ],
  },
  {
    id: 'LicenseOfficer',
    name: 'License Officer',
    description: 'Manages license applications and issuance.',
    permissions: [
      'licenses:read',
      'licenses:update',
      'users:read', // Can view user profiles for verification
    ],
  },
  {
    id: 'TestOfficer',
    name: 'Test Officer',
    description: 'Manages tests, quizzes, and results.',
    permissions: [
      'tests:read',
      'tests:review',
      'users:read',
    ],
  },
  {
    id: 'Finance',
    name: 'Finance',
    description: 'Manages all financial transactions, reports, and refunds.',
    permissions: [
      'payments:read',
      'payments:update',
    ],
  },
];

const seedRolesAndPermissions = async () => {
  const batch = db.batch();

  // Seed Permissions
  const permissionsCollection = db.collection('permissions');
  permissions.forEach(permission => {
    const docRef = permissionsCollection.doc(permission.id);
    batch.set(docRef, permission);
  });

  // Seed Roles
  const rolesCollection = db.collection('roles');
  roles.forEach(role => {
    const docRef = rolesCollection.doc(role.id);
    batch.set(docRef, role);
  });

  try {
    await batch.commit();
    console.log('Roles and Permissions seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Roles and Permissions:', error);
  }
};

seedRolesAndPermissions();
