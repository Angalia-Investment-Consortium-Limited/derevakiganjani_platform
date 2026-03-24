
import * as crypto from "crypto";

const SELCOM_API_SECRET = '4a19e7-221273-452a9c-b0f8fc-0d7d75-49';

const generateSignatureOld = (timestamp: string, params: Record<string, any>) => {
    const sortedKeys = Object.keys(params).sort();
    const signedFields = sortedKeys.join(',');

    let dataToSign = `timestamp=${timestamp}`;
    for (const key of sortedKeys) {
        dataToSign += `&${key}=${encodeURIComponent(params[key])}`;
    }

    const hmac = crypto.createHmac('sha256', SELCOM_API_SECRET);
    hmac.update(dataToSign);
    const digest = hmac.digest('base64');
    
    return { digest, signedFields, dataToSign };
};

const generateSignatureNew = (timestamp: string, params: Record<string, any>) => {
    const sortedKeys = Object.keys(params).sort();
    const signedFields = sortedKeys.join(',');

    let dataToSign = `timestamp=${timestamp}`;
    for (const key of sortedKeys) {
        dataToSign += `&${key}=${params[key]}`;
    }

    const hmac = crypto.createHmac('sha256', SELCOM_API_SECRET);
    hmac.update(dataToSign);
    const digest = hmac.digest('base64');
    
    return { digest, signedFields, dataToSign };
};

const testParams = {
    buyer_name: "John Doe",
    buyer_remarks: "Payment for Leseni: New"
};
const timestamp = "2023-10-28T12:00:00+03:00";

const oldRes = generateSignatureOld(timestamp, testParams);
const newRes = generateSignatureNew(timestamp, testParams);

console.log("OLD (with encodeURIComponent):");
console.log("Data to sign:", oldRes.dataToSign);
console.log("Digest:", oldRes.digest);

console.log("\nNEW (without encodeURIComponent):");
console.log("Data to sign:", newRes.dataToSign);
console.log("Digest:", newRes.digest);

if (oldRes.digest !== newRes.digest) {
    console.log("\nDIFF DETECTED: The signatures are different.");
} else {
    console.log("\nNO DIFF: The signatures are the same (this should only happen if there are no special characters).");
}
