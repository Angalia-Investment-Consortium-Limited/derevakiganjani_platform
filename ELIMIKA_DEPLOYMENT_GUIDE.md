# ELIMIKA MODULE - DEPLOYMENT GUIDE

## 🚀 STEP-BY-STEP DEPLOYMENT INSTRUCTIONS

Follow these steps **in order** to deploy the Elimika module updates.

---

## STEP 1: INSTALL FRAPPE TYPES (If Not Already Installed)

```bash
cd ~/frappe-bench

# Get the frappe-types app
bench get-app https://github.com/The-Commit-Company/frappe-types

# Install on your site
bench --site derevakiganjani.mdvfleet.co.tz install-app frappe_types

# Restart bench
bench restart
```

**Verify Installation**:
- Open Frappe Desk: https://derevakiganjani.mdvfleet.co.tz
- Search for "Type Generation Settings" in Awesomebar
- If found, installation successful ✅

---

## STEP 2: CONFIGURE TYPE GENERATION SETTINGS

1. **Open Frappe Desk**: https://derevakiganjani.mdvfleet.co.tz
2. **Login as Administrator**
3. **Search** for "Type Generation Settings" in Awesomebar
4. **Click "New"**
5. **Fill in**:
   - **App Name**: `derevahuduma_platform`
   - **Path**: `apps/derevahuduma_platform/landing/src/types`
6. **Save**

---

## STEP 3: RUN DATABASE MIGRATIONS

```bash
cd ~/frappe-bench

# Run migrations to create new doctypes
bench --site derevakiganjani.mdvfleet.co.tz migrate

# Clear cache
bench --site derevakiganjani.mdvfleet.co.tz clear-cache

# Restart bench
bench restart
```

**Verify Migration**:
```bash
# Check if doctypes were created
bench --site derevakiganjani.mdvfleet.co.tz console
```

Then in console:
```python
import frappe
print(frappe.db.exists("DocType", "Course"))  # Should print "Course"
print(frappe.db.exists("DocType", "Lesson"))  # Should print "Lesson"
print(frappe.db.exists("DocType", "Course Enrollment"))  # Should print "Course Enrollment"
print(frappe.db.exists("DocType", "Lesson Progress"))  # Should print "Lesson Progress"
print(frappe.db.exists("DocType", "Course Certificate"))  # Should print "Course Certificate"
exit()
```

All should return the doctype name. If any return `None`, migration failed.

---

## STEP 4: GENERATE TYPESCRIPT TYPES

```bash
cd ~/frappe-bench

# Generate types for each doctype
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Course"

bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Lesson"

bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Course Enrollment"

bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Lesson Progress"

bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Course Certificate"
```

**Or generate for entire module** (easier):
```bash
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-module \
  --app derevahuduma_platform \
  --module "Dereva Huduma Platform"
```

**Verify Types Generated**:
```bash
ls -la apps/derevahuduma_platform/landing/src/types/DerevaHudumaPlatform/
```

Should see:
- `Course.ts`
- `Lesson.ts`
- `CourseEnrollment.ts`
- `LessonProgress.ts`
- `CourseCertificate.ts`

---

## STEP 5: RUN SEED DATA SCRIPT

This will create the initial 6 courses with lessons.

```bash
cd ~/frappe-bench

# Option 1: Via bench execute (recommended)
bench --site derevakiganjani.mdvfleet.co.tz execute \
  derevahuduma_platform.api.seed_elimika_data.seed_elimika_courses
```

**Or Option 2: Via bench console**:
```bash
bench --site derevakiganjani.mdvfleet.co.tz console
```

Then in console:
```python
from derevahuduma_platform.api.seed_elimika_data import seed_elimika_courses
result = seed_elimika_courses()
print(result)
exit()
```

**Expected Output**:
```
Starting Elimika data migration...
✓ Created course: Road Safety Fundamentals
  ✓ Created lesson: Introduction to Road Safety
  ✓ Created lesson: Understanding Traffic Laws
  ...
✓ Created course: Traffic Signs & Signals
  ...
✓ Created course: Defensive Driving
  ...
✓ Created course: Vehicle Maintenance Basics
  ...
✓ Created course: Emergency Response
  ...
✓ Created course: Commercial Driving
  ...

==================================================
Migration complete!
Created 6 courses
==================================================

Summary by Track:
  Beginner: 3 courses
  Professional: 3 courses

Summary by Category:
  PIKIPIKI: 0 courses
  BASIC: 3 courses
  VIP: 1 courses
  PSV: 1 courses
  HGV: 1 courses

Total Lessons: 18
```

---

## STEP 6: VERIFY BACKEND DEPLOYMENT

### 6.1 Check Doctypes in Desk

1. Open: https://derevakiganjani.mdvfleet.co.tz
2. Go to: **Desk → DocType List**
3. Search for: `Course`
4. Should see all 5 new doctypes:
   - Course
   - Lesson
   - Course Enrollment
   - Lesson Progress
   - Course Certificate

### 6.2 Check Courses Created

1. Go to: **Desk → Course** (or search "Course List")
2. Should see 6 courses:
   - Road Safety Fundamentals (beginner, basic)
   - Traffic Signs & Signals (beginner, basic)
   - Defensive Driving (professional, vip)
   - Vehicle Maintenance Basics (beginner, basic)
   - Emergency Response (professional, psv)
   - Commercial Driving (professional, hgv)

### 6.3 Test API Endpoints

```bash
# Test 1: Get all courses
curl -X POST https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.elimika.get_courses \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 2: Get beginner courses only
curl -X POST https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.elimika.get_courses \
  -H "Content-Type: application/json" \
  -d '{"track": "beginner"}'

# Test 3: Get professional courses only
curl -X POST https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.elimika.get_courses \
  -H "Content-Type: application/json" \
  -d '{"track": "professional"}'

# Test 4: Get course detail (replace COURSE-00001 with actual course name)
curl -X POST https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.elimika.get_course_detail \
  -H "Content-Type: application/json" \
  -d '{"course_id": "COURSE-00001"}'

# Test 5: Get learner statistics (requires admin login)
curl -X POST https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.elimika.get_learner_statistics \
  -H "Content-Type: application/json" \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

**Expected Response** (for get_courses):
```json
{
  "message": {
    "success": true,
    "data": [
      {
