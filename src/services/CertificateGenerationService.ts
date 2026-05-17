import { jsPDF } from 'jspdf';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

import logoUrl from '@/assets/logo.png';
import mdvLogoUrl from '@/assets/mdv-logo.png';

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
    // We'll use portrait A4 as before, but adjust the layout since the mock is more tightly packed,
    // or use landscape. Let's stick to portrait as previously used, but format properly.
    // Wait, let's use landscape, it looks much better for a certificate!
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Landscape A4: width 297, height 210
    const centerX = 297 / 2; // 148.5

    const qrCodeMessage = 'This certificate is issued by Dereva Kiganjani, a proud digital platform of MDV Fleet Limited.';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeMessage)}`;

    // Fetch all images concurrently
    const [logoDataUrl, mdvLogoDataUrl, qrCodeDataUrl] = await Promise.all([
        getImageDataUrl(logoUrl),
        getImageDataUrl(mdvLogoUrl),
        getImageDataUrl(qrCodeUrl)
    ]);

    // 1. MDV Fleet Logo (Top Center)
    if (mdvLogoDataUrl) {
        doc.addImage(mdvLogoDataUrl, 'PNG', centerX - 30, 15, 60, 20);
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 200, 200);
        doc.text('MDV FLEET LIMITED LOGO', centerX, 25, { align: 'center' });
    }

    // 2. CERTIFICATE OF COMPLETION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('CERTIFICATE OF COMPLETION', centerX, 60, { align: 'center' });

    // 3. This is to certify that
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(22);
    doc.setTextColor(128, 128, 128); // Gray
    doc.text('This is to certify that', centerX, 80, { align: 'center' });

    // 4. Name with Yellow Highlight Background
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    const nameWidth = doc.getTextWidth(data.name);
    const highlightPadding = 15;
    
    // Draw yellow rectangle
    doc.setFillColor(252, 211, 77); // Yellowish highlight color (#fcd34d)
    doc.rect(centerX - (nameWidth / 2) - highlightPadding, 100 - 12, nameWidth + (highlightPadding * 2), 16, 'F');
    
    // Draw Name Text
    doc.setTextColor(0, 0, 0); // Black
    doc.text(data.name, centerX, 100, { align: 'center', baseline: 'middle' });

    // Line below name
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(30, 115, 267, 115);

    // 5. has successfully completed and passed
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(22);
    doc.setTextColor(128, 128, 128);
    doc.text('has successfully completed and passed', centerX, 135, { align: 'center' });

    // 6. Course Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(128, 128, 128);
    doc.text(data.course, centerX, 155, { align: 'center' });

    // 7. Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);
    doc.setTextColor(128, 128, 128);
    doc.text(`on ${data.date}`, centerX, 175, { align: 'center' });

    // --- Bottom Section ---
    const bottomY = 175;

    // 8. Bottom Left: iDEREVA Logo
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 30, bottomY - 10, 50, 20);
    }

    // 9. Bottom Center: QR Code
    if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', centerX - 15, bottomY - 15, 30, 30);
    } else {
        doc.setFillColor(74, 122, 203);
        doc.rect(centerX - 15, bottomY - 15, 30, 30, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('QR CODE', centerX, bottomY, { align: 'center' });
    }

    // 10. Bottom Right: Signature
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(210, bottomY, 267, bottomY);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('David Michael', 210, bottomY + 8, { align: 'left' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Managing Director', 210, bottomY + 14, { align: 'left' });

    // --- PDF Generation and Upload ---
    const pdfAsString = doc.output('datauristring');
    const storage = getStorage();
    const storageRef = ref(storage, `certificates/${userId}/${data.course.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    await uploadString(storageRef, pdfAsString, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};
