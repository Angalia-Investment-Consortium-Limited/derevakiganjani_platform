
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

// Type definition for the data needed to create a certificate.
// This should be expanded as the certificate details become more defined.
type CertificateData = {
    driverId: string;
    testAttemptId: string;
    testName: string;
    // In the future, this will include a URL from Firebase Storage
    certificate_url: string; 
};

/**
 * This service is responsible for handling the certificate generation process.
 * For now, it creates a document in the 'certificates' collection in Firestore.
 * In the future, this will be expanded to handle the actual generation of a 
 * certificate file (e.g., PDF) and uploading it to Firebase Storage.
 */
export const CertificateGenerationService = {
    /**
     * Creates a certificate document in Firestore and links it to the test attempt.
     *
     * @param data - The data required to generate the certificate.
     * @returns The ID of the newly created certificate document.
     */
    async createCertificate(data: CertificateData): Promise<string> {
        try {
            // 1. Create the certificate document in the 'certificates' collection
            const certificateRef = await addDoc(collection(db, 'certificates'), {
                driverId: data.driverId,
                testAttemptId: data.testAttemptId,
                course_name: data.testName, // Aligning with the schema
                certificate_url: data.certificate_url, // Placeholder URL for now
                issue_date: serverTimestamp(),
            });

            // 2. Update the corresponding test_attempts document with the new certificate ID
            const testAttemptRef = doc(db, 'test_attempts', data.testAttemptId);
            await updateDoc(testAttemptRef, {
                certificateId: certificateRef.id,
                certificateUrl: data.certificate_url, // Also add the URL here for easy access
            });

            console.log(`Certificate ${certificateRef.id} created for test attempt ${data.testAttemptId}`);

            return certificateRef.id;
        } catch (error) {
            console.error("Error creating certificate: ", error);
            // Re-throw the error to be handled by the calling function
            throw new Error("Failed to create certificate document.");
        }
    },
};
