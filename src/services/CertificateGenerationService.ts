
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Type definition for the data needed to create a certificate.
type CertificateData = {
    userId: string;
    attemptId: string;
    userName: string;
    testName: string;
    completedAt: Date;
};

/**
 * This service is responsible for generating a PDF certificate,
 * uploading it to Firebase Storage, and creating a corresponding
 * document in the 'certificates' collection.
 */
export const CertificateGenerationService = {
    /**
     * Generates a PDF certificate, uploads it, and updates Firestore.
     *
     * @param data - The data required to generate the certificate.
     * @returns The public URL of the generated certificate.
     */
    async generateAndUploadCertificate(data: CertificateData): Promise<string> {
        try {
            // 1. Create a container for the React component
            const certificateContainer = document.createElement('div');
            certificateContainer.style.position = 'absolute';
            certificateContainer.style.left = '-9999px';
            document.body.appendChild(certificateContainer);

            // 2. Render the React component into the container
            const certificateHtml = `
                <div id="certificate" style="width: 800px; padding: 2rem; background-color: white;">
                    <div style="text-align: center; border: 2px solid black; padding: 2rem;">
                        <h1 style="font-size: 2.5rem; font-weight: bold; color: #333;">Certificate of Completion</h1>
                        <p style="font-size: 1.2rem; margin-top: 1rem;">This certificate is awarded to</p>
                        <p style="font-size: 2rem; font-weight: 600; margin-top: 0.5rem;">${data.userName}</p>
                        <p style="font-size: 1.2rem; margin-top: 1rem;">for successfully completing the</p>
                        <p style="font-size: 1.5rem; font-weight: 600; margin-top: 0.5rem;">${data.testName}</p>
                        <p style="font-size: 1.2rem; margin-top: 1rem;">on</p>
                        <p style="font-size: 1.2rem; margin-top: 0.5rem;">${data.completedAt.toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            certificateContainer.innerHTML = certificateHtml;


            // 3. Generate a canvas from the HTML
            const canvas = await html2canvas(certificateContainer.querySelector('#certificate') as HTMLElement);

            // 4. Create a PDF from the canvas
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);

            // 5. Upload the PDF to Firebase Storage
            const storage = getStorage();
            const certificateRef = ref(storage, `certificates/${data.attemptId}.pdf`);
            const pdfBlob = pdf.output('blob');
            await uploadBytes(certificateRef, pdfBlob);

            // 6. Get the download URL
            const certificateUrl = await getDownloadURL(certificateRef);

            // 7. Create a certificate document in Firestore
            const newCertificateRef = await addDoc(collection(db, 'certificates'), {
                driverId: data.userId,
                testAttemptId: data.attemptId,
                course_name: data.testName,
                certificate_url: certificateUrl,
                issue_date: serverTimestamp(),
            });

            // 8. Update the test_attempts document with the certificate URL and ID
            const testAttemptRef = doc(db, 'test_attempts', data.attemptId);
            await updateDoc(testAttemptRef, {
                certificateId: newCertificateRef.id,
                certificateUrl: certificateUrl,
            });
            
            // 9. Clean up the temporary container
            document.body.removeChild(certificateContainer);

            console.log(`Certificate generated and uploaded for test attempt ${data.attemptId}`);

            return certificateUrl;
        } catch (error) {
            console.error("Error generating or uploading certificate: ", error);
            throw new Error("Failed to generate and upload certificate.");
        }
    },
};
