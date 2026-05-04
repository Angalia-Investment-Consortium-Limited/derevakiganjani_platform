
import { jsPDF } from 'jspdf';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// URLs for all assets in the public folder
const logoUrl = '/logo.png';
// const signatureUrl = '/signature.jpeg'; // REMOVED: Replaced with text signature
const mdvLogoUrl = '/logo2.png';

interface CertificateData {
  name: string;
  course: string;
  date: string;
}

// Generic function to fetch an image and convert it to a data URL
const getImageDataUrl = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch image: ${url} (${response.statusText})`);
            return null;
        }
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null); // Resolve with null on error
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Could not load image for PDF from ${url}:`, error);
        return null;
    }
};

export const generateCertificate = async (data: CertificateData, userId: string): Promise<string> => {
    const doc = new jsPDF();

    // Fetch all images concurrently
    const [logoDataUrl, mdvLogoDataUrl] = await Promise.all([
        getImageDataUrl(logoUrl),
        getImageDataUrl(mdvLogoUrl)
    ]);

    // --- Certificate Layout ---
    doc.setDrawColor(0, 105, 217); // Blue border
    doc.setLineWidth(1.5);
    doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

    // 1. Certificate ID (Top Right)
    const certId = `DK-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificate ID: ${certId}`, 195, 15, { align: 'right' });

    // 2. Add MDV Logo (Top Left)
    if (mdvLogoDataUrl) {
        doc.addImage(mdvLogoDataUrl, 'PNG', 15, 15, 40, 20);
    }

    // 3. Add Main Logo (Top Center)
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 70, 15, 70, 35);
    }

    // 2. Certificate Title (Restored)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(40, 40, 40);
    doc.text('CERTIFICATE OF COMPLETION', 105, 60, { align: 'center' });

    // --- Main Content ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text('Proudly Presented To', 105, 80, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(0, 105, 217);
    doc.text(data.name, 105, 100, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('For successfully completing the course:', 105, 120, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(data.course, 105, 135, { align: 'center' });

    // --- Signatures & Issuing Info ---
    const signatureY = 175;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Issue Date
    doc.setLineWidth(0.5);
    doc.line(40, signatureY, 100, signatureY);
    doc.text('Issue Date', 70, signatureY + 5, { align: 'center' });
    doc.text(data.date, 70, signatureY + 10, { align: 'center' });

    // 3. Add Text-Based Signature
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(50, 50, 50); 
    doc.text('David Michael', 155, signatureY - 7, { align: 'center' }); // Cursive text signature
    doc.setFont('helvetica', 'normal'); // Reset font
    doc.line(130, signatureY, 180, signatureY); // Line for signature
    doc.setFontSize(12);
    doc.text('Authorized Signature', 155, signatureY + 5, { align: 'center' });


    // 4. Add MDV Logo (Bottom Right)
    if (mdvLogoDataUrl) {
        doc.addImage(mdvLogoDataUrl, 'PNG', 150, signatureY + 10, 30, 15);
        doc.setFontSize(10);
        doc.setTextColor(100,100,100);
        doc.text('Issued by: MDV Vehicle Fleet Limited', 165, signatureY + 30, { align: 'center' });
    }

    // 5. Add Dereva Kiganjani Footer (Bottom Center)
    const footerY = 265;
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 95, footerY, 20, 10);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated from the Dereva Kiganjani platform', 105, footerY + 15, { align: 'center' });
    }
    
    // --- PDF Generation and Upload ---
    const pdfAsString = doc.output('datauristring');
    const storage = getStorage();
    const storageRef = ref(storage, `certificates/${userId}/${data.course.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    await uploadString(storageRef, pdfAsString, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};
