# Seeding Guide: VIP Driver Theory Test (Multilingual with Images)

This document provides a complete guide on how to structure and seed the "Mtihani wa Kujipima – Madereva wa Viongozi (VIP)" test into your Firestore database, with full support for English, Swahili, and image-based questions.

---

## 1. Final Data Structure & Schema

This is the recommended structure to support all required features.

### `tests` Collection Document

Stores the main details of the test.

```json
// Path: /tests/vip-driver-assessment-01
{
  "test_title_en": "Self-Assessment Test - VIP Drivers",
  "test_title_sw": "Mtihani wa Kujipima – Madereva wa Viongozi (VIP)",
  "description_en": "This exam contains 6 sections and a total of 123 questions. You have 90 minutes to answer all questions. You must score 75% to pass. You can retake the exam once if you do not reach 75%.",
  "description_sw": "Huu mtihani una sehemu sita (6) na jumla ya maswali 123. Una saa moja na nusu (dakika 90) kujibu maswali yote. Unatakiwa kupata alama 75% kufaulu. Unaweza kurudia mtihani huu mara moja kama utashindwa.",
  "courseId": "", // Link to a course if applicable
  "duration_minutes": 90,
  "total_questions": 123,
  "pass_mark_percentage": 75,
  "max_retakes": 1,
  "license_class": "VIP", // Custom field for categorization
  "status": "draft", // 'draft' or 'published'
  "createdAt": "SERVER_TIMESTAMP",
  "questionIds": [
    "vip_q_001",
    "vip_q_002",
    "vip_q_061",
    "vip_q_074",
    "vip_q_075"
    // ...add all 123 question IDs here
  ]
}
```

### `questions` Collection Document

Stores each individual question. Note the bilingual fields and the `image` field for linking to Firebase Storage.

```json
// Path: /questions/{questionId}
{
    "question_text_en": "(English Text)",
    "question_text_sw": "(Swahili Text)",
    "category_en": "Defensive Driving",
    "category_sw": "Udereva wa Kujihami",
    "question_type": "multiple-choice",
    "is_active": 1, // 1 for active/published, 0 for draft
    "modified": "SERVER_TIMESTAMP",
    "image": "https://firebasestorage.googleapis.com/.../image.png", // Public URL from Firebase Storage (or null)
    "options": [
        { "text_en": "Option A (EN)", "text_sw": "Option A (SW)", "is_correct": false },
        { "text_en": "Option B (EN)", "text_sw": "Option B (SW)", "is_correct": true },
        { "text_en": "Option C (EN)", "text_sw": "Option C (SW)", "is_correct": false }
    ]
}
```

---

## 2. How to Add the Test to the System

Follow this two-step process.

### Step 1: Upload Images to Firebase Storage

For every question that has an image or diagram in the PDF:

1.  **Extract the image** from the PDF and save it as a `.png` or `.jpg` file.
2.  Go to the **Firebase Console > Storage**.
3.  Create a folder named `question_images` to keep things organized.
4.  **Upload** the image file into this folder.
5.  Click on the uploaded file. In the right-hand panel, find the **Download URL**. Copy this URL; you will need it for the Firestore document.

### Step 2: Seed the Data into Firestore

*   **Method A: Manual Seeding (Firebase Console)**

    1.  **Add Questions:** In the `questions` collection, manually create a new document for each of the 123 questions. Fill in the `question_text_sw`, `options`, `category_sw`, etc., based on the PDF. Add the English translations if you have them. If a question has an image, paste the **Download URL** from Step 1 into the `image` field.
    2.  **Collect IDs:** After creating each question, copy its auto-generated Document ID.
    3.  **Create Test:** In the `tests` collection, create a single document for the VIP test. Fill in the main details (`test_title_sw`, `duration_minutes`, etc.). In the `questionIds` array field, paste all 123 of the question IDs you collected.

*   **Method B: Automated Seeding (Script)**

    For developers, the most efficient method is to create a JSON file containing all 123 questions and then write a script (e.g., using Node.js and the Firebase Admin SDK) to automatically upload this data to your `questions` and `tests` collections.

---

## 3. Concrete Question Examples (from your PDF text)

Here is exactly how to structure some of the more complex questions.

### Example 1: Standard Text Question (`vip_q_001`)

```json
{
    "question_text_en": "Which of the following is NOT a simple definition of a Very Important Person (VIP)?",
    "question_text_sw": "Mojawapo siyo tafsiri rahisi kuhusu mtu muhimu sana (VIP)",
    "category_en": "Hallmarks of a VIP Driver",
    "category_sw": "Sifa Bainifu za Dereva wa Gari la Kiongozi",
    "is_active": 1,
    "image": null,
    "options": [
        { "text_en": "A soldier", "text_sw": "Mwanajeshi", "is_correct": true },
        { "text_en": "A high-level politician", "text_sw": "Mwanasiasa wa ngazi ya juu", "is_correct": false },
        { "text_en": "CEO of a large institution", "text_sw": "Kiongozi wa taasisi au kampuni kubwa", "is_correct": false },
        { "text_en": "A famous artist", "text_sw": "Msanii mashuhuri", "is_correct": false }
    ]
}
```

### Example 2: Image-Based Question (`vip_q_074`)

*(**Note:** I cannot see the image. You must upload it and replace the placeholder URL)*

```json
{
    "question_text_en": "What does this sign mean?",
    "question_text_sw": "Alama hii inamaana gani?",
    "category_en": "Road Signs, Signals, and Markings",
    "category_sw": "Alama, Ishara, na Michoro ya Barabarani",
    "is_active": 1,
    "image": "https://firebasestorage.googleapis.com/.../vip_q_74_image.png", // <-- REPLACE WITH YOUR REAL URL
    "options": [
        { "text_en": "There is a barrier ahead", "text_sw": "Kuna kizuizi mbele", "is_correct": false },
        { "text_en": "Warning, speed bump ahead", "text_sw": "Onyo mbele kuna tuta la kupunguza mwendo", "is_correct": false },
        { "text_en": "End of priority road", "text_sw": "Mwisho wa barabara yenye kipaumbele", "is_correct": false },
        { "text_en": "No entry", "text_sw": "No entry", "is_correct": true }
    ]
}
```

### Example 3: Another Image-Based Question (`vip_q_075`)

*(**Note:** I cannot see the image. You must upload it and replace the placeholder URL)*

```json
{
    "question_text_en": "What warning does this sign give to drivers?",
    "question_text_sw": "Alama hii inatoa tahadhali gani kwa madereva?",
    "category_en": "Road Signs, Signals, and Markings",
    "category_sw": "Alama, Ishara, na Michoro ya Barabarani",
    "is_active": 1,
    "image": "https://firebasestorage.googleapis.com/.../vip_q_75_image.png", // <-- REPLACE WITH YOUR REAL URL
    "options": [
        { "text_en": "Bridge construction", "text_sw": "Ujenzi wa daraja", "is_correct": false },
        { "text_en": "Flyover construction", "text_sw": "Ujenzi wa fly over", "is_correct": false },
        { "text_en": "Railway construction", "text_sw": "Ujenzi wa reli", "is_correct": false },
        { "text_en": "Road construction", "text_sw": "Ujenzi wa barabara", "is_correct": true }
    ]
}
```

---

## 4. Backend/Frontend Code Adjustments

Your existing `useJiTesti.ts` hook needs a small adjustment to align with this schema.

**File:** `src/hooks/useJiTesti.ts`

**Current Code (Line 190):**
`pass_mark: testData.pass_mark,`

**Recommended Update:**
Change `pass_mark` to `pass_mark_percentage` to match the schema and provide more clarity.

```typescript
// In useJiTesti.ts, inside the return object of startTest
return {
  // ...other fields
  pass_mark_percentage: testData.pass_mark_percentage,
};
```
This ensures your frontend receives the correct pass mark value from the `test` document.