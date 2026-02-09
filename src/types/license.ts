export const STATUS_COLORS: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

export const ApplicationStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const FILE_UPLOAD_CONFIG = {
    maxSize: 1024 * 1024 * 5, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
};

export const DOCUMENT_TYPE_TRANSLATIONS: { [key: string]: string } = {
    nationalId: 'National ID',
    drivingLicense: 'Driving License',
    passport: 'Passport',
    utilityBill: 'Utility Bill',
};

export const APPLICATION_TYPES = {
    new: 'New Application',
    renewal: 'Renewal',
    replacement: 'Replacement',
};

export const LICENSE_CATEGORIES = {
    A: 'Motorcycle',
    B: 'Car',
    C: 'Truck',
    D: 'Bus',
};

export const REQUIRED_DOCUMENTS: { [key: string]: string[] } = {
  new: ['nationalId', 'drivingLicense', 'passport'],
  renewal: ['drivingLicense'],
  replacement: ['nationalId', 'passport'],
};

export const STATUS_TRANSLATIONS: { [key: string]: string } = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
};
