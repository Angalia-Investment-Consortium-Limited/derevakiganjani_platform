const admin = require('firebase-admin');
// Assuming serviceAccountKey.json is in the same directory
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const jitestiCategories = [
    {
        id: 'MOTO',
        name_en: 'Motorcycle Test',
        name_sw: 'Mtihani wa Pikipiki',
        description_en: 'Test for motorcycle (Class A) license applicants',
        description_sw: 'Mtihani kwa waombaji wa leseni ya pikipiki (Daraja A)',
        price: 25000,
        duration_minutes: 30,
        total_questions: 30,
        pass_mark: 80,
        status: 'active',
        license_class: 'A'
    },
    {
        id: 'BASIC',
        name_en: 'Basic Driving Test',
        name_sw: 'Mtihani wa Msingi wa Uendeshaji',
        description_en: 'Basic driving knowledge test for Class B license',
        description_sw: 'Mtihani wa maarifa ya msingi ya uendeshaji kwa leseni ya Daraja B',
        price: 30000,
        duration_minutes: 45,
        total_questions: 40,
        pass_mark: 85,
        status: 'active',
        license_class: 'B'
    },
    {
        id: 'VIP',
        name_en: 'VIP Driver Test',
        name_sw: 'Mtihani wa Dereva wa VIP',
        description_en: 'Advanced test for VIP and executive drivers',
        description_sw: 'Mtihani wa hali ya juu kwa madereva wa VIP na watendaji',
        price: 50000,
        duration_minutes: 60,
        total_questions: 50,
        pass_mark: 90,
        status: 'active',
        license_class: null
    },
    {
        id: 'PSV',
        name_en: 'Public Service Vehicle Test',
        name_sw: 'Mtihani wa Gari la Huduma ya Umma',
        description_en: 'Test for public service vehicle (PSV) drivers - Class C',
        description_sw: 'Mtihani kwa madereva wa magari ya huduma ya umma (PSV) - Daraja C',
        price: 40000,
        duration_minutes: 50,
        total_questions: 45,
        pass_mark: 85,
        status: 'active',
        license_class: 'C'
    },
    {
        id: 'HGV',
        name_en: 'Heavy Goods Vehicle Test',
        name_sw: 'Mtihani wa Gari Kubwa la Mizigo',
        description_en: 'Test for heavy goods vehicle (HGV) drivers - Class D',
        description_sw: 'Mtihani kwa madereva wa magari makubwa ya mizigo (HGV) - Daraja D',
        price: 45000,
        duration_minutes: 55,
        total_questions: 50,
        pass_mark: 85,
        status: 'active',
        license_class: 'D'
    },
    {
        id: 'INTERVIEW',
        name_en: 'Driver Interview Preparation',
        name_sw: 'Maandalizi ya Mahojiano ya Dereva',
        description_en: 'Comprehensive test to prepare for driver job interviews',
        description_sw: 'Mtihani kamili wa kujiandaa kwa mahojiano ya kazi ya udereva',
        price: 35000,
        duration_minutes: 40,
        total_questions: 40,
        pass_mark: 80,
        status: 'active',
        license_class: null
    }
];

const seedJitestiCategories = async () => {
    const categoryCollection = db.collection('jitesti-categories');
    console.log('Seeding jitesti categories...');

    const batch = db.batch();

    for (const category of jitestiCategories) {
        // Use the custom ID as the document ID
        const docRef = categoryCollection.doc(category.id);
        const docWithTimestamp = {
            ...category,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        batch.set(docRef, docWithTimestamp);
    }

    try {
        await batch.commit();
        console.log('Successfully seeded all jitesti categories!');
    } catch (error) {
        console.error('Error seeding jitesti categories', error);
        process.exit(1); // Exit with error
    }

    // No need to call process.exit(0) as the script will exit naturally
};

seedJitestiCategories();
