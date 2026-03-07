### 2.3. Initial Data Seeding Plan

To populate the Elimika module with initial content, a seeding script will be executed. This script will create documents in the `courses` and `lessons` collections based on the information provided in the UI mockup image.

**Source of Data:** The content is derived from the course cards in the `Dereva Huduma` UI screenshot.

**Execution:** A one-time script (`seedCourses.cjs`) will be run to inject the following data into the Firestore database.

**Seeding Details:**

1.  **Courses to be Added:**
    -   Road Safety Fundamentals
    -   Traffic Signs & Signals
    -   Defensive Driving
    -   Vehicle Maintenance Basics
    -   Emergency Response
    -   Commercial Driving

2.  **Lessons to be Added:**
    -   Each course will have 2-3 sample lessons created and linked to it, establishing the relationship between the `courses` and `lessons` collections.
    -   Lesson details will include titles and a sequential order.

3.  **Schema Adherence:**
    -   All seeded data will strictly follow the structure defined in `firestore_schema.md` for both `courses` and `lessons` documents.
    -   This includes using appropriate data types and field names (e.g., `course_name_en`, `duration_hours`, `lesson_order`).

