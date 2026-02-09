
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'sw';

// Define the structure for a single language's translations
type TranslationSet = {
  [key: string]: string | TranslationSet;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  translations: TranslationSet;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    services: 'Services',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    
    // Hero
    heroTitle: 'Empowering Safer Drivers',
    heroSubtitle: 'Welcome to Dereva Kiganjani',
    heroDescription: 'Your one-stop platform for driver services, license management, testing, and learning',
    
    // Services
    leseni: 'Leseni',
    leseniDesc: 'License Services',
    jiTesti: 'JiTesti',
    jiTestiDesc: 'Driver Test',
    elimika: 'Elimika',
    elimikaDesc: 'Driver Learning',
    ajiraYaUdereva: 'Ajira ya Udereva',
    ajiraDesc: 'Driver Jobs',
    ajiriDereva: 'Ajiri Dereva',
    ajiriDesc: 'Hire a Driver',
    
    // Common
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    
    // Dashboard
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    myProfile: 'My Profile',
    myResults: 'My Results',
    notifications: 'Notifications',
    recentActivity: 'Recent Activity',
    
    // Test
    startTest: 'Start Test',
    selectCategory: 'Select Vehicle Category',
    paymentMethod: 'Payment Method',
    testInProgress: 'Test in Progress',
    submitAnswer: 'Submit Answer',
    correct: 'Correct',
    incorrect: 'Incorrect',
    passed: 'PASSED',
    failed: 'FAILED',
    retakeTest: 'Retake Test',
    downloadCertificate: 'Download Certificate',
    
    // Profile
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    nationalId: 'National ID',
    licenseNumber: 'License Number',
    licenseCategory: 'License Category',
    uploadPhoto: 'Upload Photo',
    
    // Admin
    totalUsers: 'Total Users',
    testAttempts: 'Test Attempts',
    passRate: 'Pass Rate',
    pendingLicenses: 'Pending Licenses',
    
    // License Application Management
    licenseApplicationsManagement: 'License Applications Management',
    retry: 'Retry',
    refresh: 'Refresh',
    total: 'Total',
    pending: 'Pending',
    inReview: 'In Review',
    approved: 'Approved',
    rejected: 'Rejected',
    applications: 'Applications',
    searchByName: 'Search by name...',
    status: 'Status',
    allStatuses: 'All Statuses',
    type: 'Type',
    allTypes: 'All Types',
    newLicense: 'New License',
    licenseRenewal: 'License Renewal',
    latraExam: 'LATRA Exam',
    reference: 'Reference',
    name: 'Name',
    phone: 'Phone',
    region: 'Region',
    submittedOn: 'Submitted On',
    actions: 'Actions',
    noApplicationsFound: 'No applications found.',
    view: 'View',
    showing: 'Showing {count} of {total}',
    previous: 'Previous',
    page: 'Page',
    of: 'of',
    showingPage: 'Showing page {currentPage} of {totalPages} ({totalJobs} total jobs)',
    
    // Roles & Permissions
    rolesAndPermissions: 'Roles & Permissions',
    role: 'Role',
    permissions: 'Permissions',
    addRole: 'Add Role',
    editRole: 'Edit Role',
    deleteRole: 'Delete Role',
    roleName: 'Role Name',
    enterRoleName: 'Enter role name',
    assignPermissions: 'Assign Permissions',
    selectAll: 'Select All',
    management: {
      users: 'Users Management',
      tests: 'Tests Management',
      content: 'Content Management',
      licenses: 'License Applications',
      roles: 'Roles & Permissions',
      settings: 'System Settings'
    },
    confirmDeleteRole: 'Are you sure you want to delete this role?',
    deleteRoleWarning: 'This action cannot be undone.',
    
    // About Page
    aboutTitle: 'About Dereva Kiganjani',
    aboutSubtitle: 'A digital platform by MDV Vehicle Fleet Limited for driver learning, testing, licensing, and recruitment.',
    whoWeAreTitle: 'Who We Are',
    whoWeAreText: 'Dereva Kiganjani is a comprehensive digital platform designed to transform driver services in Tanzania. We provide a seamless experience for driver learning, testing, licensing, and job placement, ensuring safety, professionalism, and efficiency at every step.',
    backedByMDVTitle: 'Backed by MDV Vehicle Fleet',
    backedByMDVText: 'Dereva Kiganjani is a proud program of MDV Vehicle Fleet Limited, a leading transportation and fleet management company in Tanzania.',
    visitMDVWebsite: 'Visit MDV Website',
    whatWeOfferTitle: 'What We Offer',
    elimikaAboutDesc: 'Comprehensive driver education with multimedia courses and progress tracking.',
    jiTestiAboutDesc: 'Professional driver testing with instant results and digital certificates.',
    leseniAboutDesc: 'Streamlined license application and renewal with document tracking.',
    recruitmentLabel: 'Recruitment',
    recruitmentAboutDesc: 'Connect drivers with employers through verified profiles and job matching.',
    impactStatsTitle: 'Our Impact',
    driversTrainedLabel: 'Drivers Trained',
    testsCompletedLabel: 'Tests Completed',
    licensesProcessedLabel: 'Licenses Processed',
    placementsMadeLabel: 'Job Placements',
    exploreServicesTitle: 'Ready to Get Started?',
    exploreServicesText: 'Explore our comprehensive services and join thousands of drivers who trust Dereva Kiganjani.',
    exploreServices: 'Explore Services',
    
    // Contact Page
    contactTitle: 'Contact Us',
    contactSubtitle: 'Get in touch with our team. We\'re here to help you with any questions or concerns.',
    
    // Registration & Auth
    error: 'Error',
    success: 'Success',
  },
  sw: {
    // Navigation
    home: 'Nyumbani',
    about: 'Kuhusu',
    services: 'Huduma',
    contact: 'Wasiliana',
    login: 'Ingia',
    logout: 'Toka',
    
    // Hero
    heroTitle: 'Kuimarisha Madereva Salama',
    heroSubtitle: 'Karibu Dereva Kiganjani',
    heroDescription: 'Jukwaa lako la huduma za madereva, usimamizi wa leseni, majaribio na kujifunza',
    
    // Services
    leseni: 'Leseni',
    leseniDesc: 'Huduma za Leseni',
    jiTesti: 'JiTesti',
    jiTestiDesc: 'Mtihani wa Udereva',
    elimika: 'Elimika',
    elimikaDesc: 'Kujifunza Udereva',
    ajiraYaUdereva: 'Ajira ya Udereva',
    ajiraDesc: 'Ajira za Madereva',
    ajiriDereva: 'Ajiri Dereva',
    ajiriDesc: 'Ajiri Dereva',
    
    // Common
    getStarted: 'Anza Sasa',
    learnMore: 'Jifunze Zaidi',
    submit: 'Wasilisha',
    cancel: 'Ghairi',
    save: 'Hifadhi',
    continue: 'Endelea',
    back: 'Rudi',
    next: 'Ifuatayo',
    
    // Dashboard
    welcome: 'Karibu',
    dashboard: 'Dashibodi',
    myProfile: 'Wasifu Wangu',
    myResults: 'Matokeo Yangu',
    notifications: 'Arifa',
    recentActivity: 'Shughuli za Hivi Karibuni',
    
    // Test
    startTest: 'Anza Mtihani',
    selectCategory: 'Chagua Aina ya Gari',
    paymentMethod: 'Njia ya Malipo',
    testInProgress: 'Mtihani Unaendelea',
    submitAnswer: 'Wasilisha Jibu',
    correct: 'Sahihi',
    incorrect: 'Si Sahihi',
    passed: 'UMEFAULU',
    failed: 'UMESHINDWA',
    retakeTest: 'Rudia Mtihani',
    downloadCertificate: 'Pakua Cheti',
    
    // Profile
    fullName: 'Jina Kamili',
    phoneNumber: 'Nambari ya Simu',
    nationalId: 'Kitambulisho cha Taifa',
    licenseNumber: 'Nambari ya Leseni',
    licenseCategory: 'Aina ya Leseni',
    uploadPhoto: 'Pakia Picha',
    
    // Admin
    totalUsers: 'Watumiaji Jumla',
    testAttempts: 'Majaribio ya Mtihani',
    passRate: 'Kiwango cha Kufaulu',
    pendingLicenses: 'Leseni Zinazosubiri',

    // License Application Management
    licenseApplicationsManagement: 'Usimamizi wa Maombi ya Leseni',
    retry: 'Jaribu Tena',
    refresh: 'Onyesha Upya',
    total: 'Jumla',
    pending: 'Inasubiri',
    inReview: 'Inakaguliwa',
    approved: 'Imeidhinishwa',
    rejected: 'Imekataliwa',
    applications: 'Maombi',
    searchByName: 'Tafuta kwa jina...',
    status: 'Hali',
    allStatuses: 'Hali Zote',
    type: 'Aina',
    allTypes: 'Aina Zote',
    newLicense: 'Leseni Mpya',
    licenseRenewal: 'Kufanya Upya Leseni',
    latraExam: 'Mtihani wa LATRA',
    reference: 'Kumbukumbu',
    name: 'Jina',
    phone: 'Simu',
    region: 'Mkoa',
    submittedOn: 'Iliwasilishwa',
    actions: 'Vitendo',
    noApplicationsFound: 'Hakuna maombi yaliyopatikana.',
    view: 'Angalia',
    showing: 'Inaonyesha {count} kati ya {total}',
    previous: 'Iliyopita',
    page: 'Ukurasa',
    of: 'wa',
    showingPage: 'Inaonyesha ukurasa {currentPage} wa {totalPages} (kazi {totalJobs} jumla)',

    // Roles & Permissions
    rolesAndPermissions: 'Majukumu na Ruhusa',
    role: 'Jukumu',
    permissions: 'Ruhusa',
    addRole: 'Ongeza Jukumu',
    editRole: 'Hariri Jukumu',
    deleteRole: 'Futa Jukumu',
    roleName: 'Jina la Jukumu',
    enterRoleName: 'Weka jina la jukumu',
    assignPermissions: 'Gawa Ruhusa',
    selectAll: 'Chagua Zote',
    management: {
      users: 'Usimamizi wa Watumiaji',
      tests: 'Usimamizi wa Majaribio',
      content: 'Usimamizi wa Maudhui',
      licenses: 'Maombi ya Leseni',
      roles: 'Majukumu na Ruhusa',
      settings: 'Mipangilio ya Mfumo'
    },
    confirmDeleteRole: 'Je, una uhakika unataka kufuta jukumu hili?',
    deleteRoleWarning: 'Kitendo hiki hakiwezi kutenduliwa.',
    
    // About Page
    aboutTitle: 'Kuhusu Dereva Kiganjani',
    aboutSubtitle: 'Jukwaa la kidijitali la MDV Vehicle Fleet Limited kwa kujifunza madereva, majaribio, leseni, na uajiri.',
    
    // Contact Page
    contactTitle: 'Wasiliana Nasi',
    contactSubtitle: 'Wasiliana na timu yetu. Tuko hapa kukusaidia na maswali au wasiwasi wowote.',
    
    // Registration & Auth
    error: 'Hitilafu',
    success: 'Mafanikio',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'sw') ? saved : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let current: string | TranslationSet | undefined = translations[language];

    for (const k of keys) {
      if (typeof current !== 'object' || current === null) {
        return key;
      }
      current = (current as TranslationSet)[k];
    }

    if (typeof current === 'string') {
      let finalString = current;
      if (options) {
        for (const optionKey in options) {
          finalString = finalString.replace(`{${optionKey}}`, String(options[optionKey]));
        }
      }
      return finalString;
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
