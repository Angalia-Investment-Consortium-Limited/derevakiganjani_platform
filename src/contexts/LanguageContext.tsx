
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
    search: 'Search',
    example: 'e.g.',
    
    // Dashboard
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    myProfile: 'My Profile',
    myResults: 'My Results',
    notifications: 'Notifications',
    recentActivity: 'Recent Activity',
    driverServicesOverview: "Here's your driver services overview",
    takeDrivingTest: 'Take a driving test',
    continueLearning: 'Continue learning',
    renewLicense: 'Renew license',
    findDriverJobs: 'Find driver jobs',
    support: 'Support',
    contactUs: 'Contact us',
    
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
    
    // Tracking & Applications
    'Track Application': 'Track Application',
    'Enter Reference To Check': 'Enter Reference To Check',
    'Reference Number': 'Reference Number',
    'Application Status': 'Application Status',
    'Type': 'Type',
    'Category': 'Category',
    'Submitted': 'Submitted',
    'Application Timeline': 'Application Timeline',
    'Reviewing Note': 'Your application is currently under review by our team. You will be notified once a decision is made.',
    'Renew License': 'Renew License',
    'New License': 'New License',
    submitted: 'Submitted',
    paymentVerified: 'Payment Verified',
    underReview: 'Under Review',
    
    // DB Enums / Statuses
    status_pending: 'Pending',
    status_reviewing: 'Reviewing',
    status_approved: 'Approved',
    status_rejected: 'Rejected',
    
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

    // Recruitment Analytics
    totalJobsPosted: 'Total Jobs Posted',
    totalApplications: 'Total Applications',
    interviewsScheduled: 'Interviews Scheduled',
    successfulHires: 'Successful Hires',
    recruitmentReports: 'Recruitment Analytics',
    recruitmentReportsDescription: 'Overview of platform recruitment and job matching metrics.',
    exportPDF: 'Export PDF',
    exportCSV: 'Export CSV',
    timePeriod: 'Time Period',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    last3Months: 'Last 3 Months',
    last6Months: 'Last 6 Months',
    lastYear: 'Last Year',
    topEmployers: 'Top Employers',
    topEmployersDescription: 'Employers with the highest application volume.',
    employer: 'Employer',
    jobs: 'Jobs',
    apps: 'Apps',
    hires: 'Hires',
    licenseCategoryBreakdown: 'License Category Demand',
    licenseCategoryBreakdownDescription: 'Job volume separated by required vehicle class.',
    category: 'Category',
    avgSalary: 'Avg. Salary',
    recruitmentFunnel: 'Recruitment Funnel',
    recruitmentFunnelDescription: 'Platform-wide application conversion rates.',
    jobPosts: 'Job Posts',
    applicationsReceived: 'Applications Received',
    applicationsPerJobAvg: 'Average applications per job',
    shortlistedCandidates: 'Shortlisted Candidates',
    shortlistedPercentage: 'Percentage of applicants shortlisted',
    interviewsConducted: 'Interviews Conducted',
    interviewedPercentage: 'Percentage of shortlisted interviewed',
    hireConversionRate: 'Percentage of interviewed hired',
    
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
    contactSubtitle: "Get in touch with our team. We're here to help you with any questions or concerns.",
    
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
    search: 'Tafuta',
    example: 'mf.',
    
    // Dashboard
    welcome: 'Karibu',
    dashboard: 'Dashibodi',
    myProfile: 'Wasifu Wangu',
    myResults: 'Matokeo Yangu',
    notifications: 'Arifa',
    recentActivity: 'Shughuli za Hivi Karibuni',
    driverServicesOverview: 'Huu ni muhtasari wako wa huduma za udereva',
    takeDrivingTest: 'Fanya mtihani wa udereva',
    continueLearning: 'Endelea kujifunza',
    renewLicense: 'Kuhuisha leseni',
    findDriverJobs: 'Tafuta kazi za udereva',
    support: 'Msaada',
    contactUs: 'Wasiliana nasi',
    
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
    
    // Tracking & Applications
    'Track Application': 'Fuatilia Maombi',
    'Enter Reference To Check': 'Weka Kumbukumbu ili Kuangalia',
    'Reference Number': 'Nambari ya Kumbukumbu',
    'Application Status': 'Hali ya Maombi',
    'Type': 'Aina',
    'Category': 'Daraja',
    'Submitted': 'Iliwasilishwa',
    'Application Timeline': 'Mlolongo wa Maombi',
    'Reviewing Note': 'Maombi yako yanapitiwa na timu yetu kwa sasa. Utajulishwa mara tu uamuzi utakapofanywa.',
    'Renew License': 'Kuhuisha Leseni',
    'New License': 'Leseni Mpya',
    submitted: 'Iliwasilishwa',
    paymentVerified: 'Malipo Yamethibitishwa',
    underReview: 'Inapitiwa',
    
    // DB Enums / Statuses
    status_pending: 'Inasubiri',
    status_reviewing: 'Inapitiwa',
    status_approved: 'Imeidhinishwa',
    status_rejected: 'Imekataliwa',
    
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

    // Recruitment Analytics
    totalJobsPosted: 'Ajira Zilizo Chapishwa',
    totalApplications: 'Maombi Jumla',
    interviewsScheduled: 'Usaili Uliopangwa',
    successfulHires: 'Walioajiriwa Sahihi',
    recruitmentReports: 'Takwimu za Ajira',
    recruitmentReportsDescription: 'Muhtasari wa takwimu za uajiri na upangaji wa kazi.',
    exportPDF: 'Pakua PDF',
    exportCSV: 'Pakua CSV',
    timePeriod: 'Kipindi',
    last7Days: 'Siku 7 zilizopita',
    last30Days: 'Siku 30 zilizopita',
    last3Months: 'Miezi 3 iliyopita',
    last6Months: 'Miezi 6 iliyopita',
    lastYear: 'Mwaka uliopita',
    topEmployers: 'Waajiri Wakuu',
    topEmployersDescription: 'Waajiri wenye kiasi kikubwa cha maombi.',
    employer: 'Mwajiiri',
    jobs: 'Kazi',
    apps: 'Maombi',
    hires: 'Ajira',
    licenseCategoryBreakdown: 'Mahitaji ya Aina ya Leseni',
    licenseCategoryBreakdownDescription: 'Kiasi cha ajira kilichogawanywa na darasa la gari.',
    category: 'Aina',
    avgSalary: 'Mshahara wa Wastani',
    recruitmentFunnel: 'Mchakato wa Uajiri',
    recruitmentFunnelDescription: 'Viwango vya mabadiliko ya maombi jukwaani.',
    jobPosts: 'Machapisho ya Kazi',
    applicationsReceived: 'Maombi Yamepokelewa',
    applicationsPerJobAvg: 'Wastani wa maombi kwa kila kazi',
    shortlistedCandidates: 'Walioteuliwa',
    shortlistedPercentage: 'Asilimia ya walioteuliwa',
    interviewsConducted: 'Usaili Uliofanyika',
    interviewedPercentage: 'Asilimia ya walioteuliwa kufanyiwa usaili',
    hireConversionRate: 'Asilimia ya walioajiriwa',
    
    // About Page
    aboutTitle: 'Kuhusu Dereva Kiganjani',
    aboutSubtitle: 'Jukwaa la kidijitali la MDV Vehicle Fleet Limited kwa kujifunza madereva, majaribio, leseni, na uajiri.',
    whoWeAreTitle: 'Who We Are',
    whoWeAreText: 'Dereva Kiganjani ni jukwaa kamili la kidijitali lililobuniwa kubadilisha huduma za udereva Tanzania. Tunatoa uzoefu usio na mshono kwa kujifunza udereva, majaribio, leseni, na ajira, tukihakikisha usalama, weledi, na ufanisi katika kila hatua.',
    backedByMDVTitle: 'Inaungwa mkono na MDV Vehicle Fleet',
    backedByMDVText: 'Dereva Kiganjani ni programu inayojivunia ya MDV Vehicle Fleet Limited, kampuni inayoongoza kwa usafirishaji na usimamizi wa vyombo vya usafiri nchini Tanzania.',
    visitMDVWebsite: 'Tembelea Tovuti ya MDV',
    whatWeOfferTitle: 'Tunachotoa',
    elimikaAboutDesc: 'Elimu kamili ya udereva na kozi za multimedia na ufuatiliaji wa maendeleo.',
    jiTestiAboutDesc: 'Majaribio ya udereva ya weledi na matokeo ya papo hapo na vyeti vya kidijitali.',
    leseniAboutDesc: 'Maombi ya leseni yaliyorahisishwa na uhuishaji na ufuatiliaji wa hati.',
    recruitmentLabel: 'Uajiri',
    recruitmentAboutDesc: 'Unganisha madereva na waajiri kupitia wasifu uliothibitishwa na ulinganishaji wa kazi.',
    impactStatsTitle: 'Athari Zetu',
    driversTrainedLabel: 'Madereva Waliofunzwa',
    testsCompletedLabel: 'Majaribio Yaliyokamilika',
    licensesProcessedLabel: 'Leseni Zilizoshughulikiwa',
    placementsMadeLabel: 'Ajira Zilizotolewa',
    exploreServicesTitle: 'Uko Tayari Kuanza?',
    exploreServicesText: 'Gundua huduma zetu kamili na ujiunge na maelfu ya madereva wanaotegemea Dereva Kiganjani.',
    exploreServices: 'Gundua Huduma',
    
    // Contact Page
    contactTitle: 'Wasiliana Nasi',
    contactSubtitle: 'Wasiliana na timu yetu. Tuko hapa kukusaidia kwa maswali au wasiwasi wowote.',
    
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
