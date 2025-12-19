"""
Seed script to migrate hardcoded Elimika courses to Frappe database
Run this after creating the doctypes to populate initial course data
"""

import frappe
from frappe.utils import today

def seed_elimika_courses():
    """Migrate existing hardcoded courses to database"""
    
    print("Starting Elimika data migration...")
    
    courses_data = [
        {
            "course_name_en": "Road Safety Fundamentals",
            "course_name_sw": "Misingi ya Usalama Barabarani",
            "description_en": "<p>Master essential road safety rules and regulations for confident driving. This comprehensive course covers traffic laws, road signs, and safe driving practices.</p>",
            "description_sw": "<p>Jifunze sheria muhimu za usalama barabarani kwa udereva wenye ujasiri. Kozi hii kamili inashughulikia sheria za trafiki, alama za barabara, na mazoezi salama ya udereva.</p>",
            "course_track": "beginner",
            "course_category": "basic",
            "level": "Basic",
            "duration_hours": 4,
            "thumbnail_emoji": "🚦",
            "status": "Published",
            "is_free": 1,
            "published_date": today(),
            "lessons": [
                {
                    "lesson_title_en": "Introduction to Road Safety",
                    "lesson_title_sw": "Utangulizi wa Usalama Barabarani",
                    "content_type": "text",
                    "duration_minutes": 15,
                    "lesson_order": 1,
                    "summary_en": "Learn the basics of road safety and why it matters",
                    "summary_sw": "Jifunze misingi ya usalama barabarani na kwa nini ni muhimu",
                    "content_text_en": "<h2>Welcome to Road Safety</h2><p>Road safety is crucial for all road users. In this lesson, you'll learn the fundamental principles that keep everyone safe on the roads.</p>",
                    "content_text_sw": "<h2>Karibu kwenye Usalama Barabarani</h2><p>Usalama barabarani ni muhimu kwa watumiaji wote wa barabara. Katika somo hili, utajifunza kanuni za msingi zinazoweka kila mtu salama barabarani.</p>"
                },
                {
                    "lesson_title_en": "Understanding Traffic Laws",
                    "lesson_title_sw": "Kuelewa Sheria za Trafiki",
                    "content_type": "text",
                    "duration_minutes": 20,
                    "lesson_order": 2,
                    "summary_en": "Overview of essential traffic laws and regulations",
                    "summary_sw": "Muhtasari wa sheria muhimu za trafiki na kanuni"
                },
                {
                    "lesson_title_en": "Right of Way Rules",
                    "lesson_title_sw": "Sheria za Haki ya Njia",
                    "content_type": "text",
                    "duration_minutes": 25,
                    "lesson_order": 3,
                    "summary_en": "Learn when to yield and who has priority",
                    "summary_sw": "Jifunze wakati wa kutoa njia na nani ana kipaumbele"
                },
                {
                    "lesson_title_en": "Speed Limits and Regulations",
                    "lesson_title_sw": "Vikomo vya Kasi na Kanuni",
                    "content_type": "text",
                    "duration_minutes": 20,
                    "lesson_order": 4,
                    "summary_en": "Understanding speed limits in different zones",
                    "summary_sw": "Kuelewa vikomo vya kasi katika maeneo tofauti"
                }
            ]
        },
        {
            "course_name_en": "Traffic Signs & Signals",
            "course_name_sw": "Alama za Trafiki",
            "description_en": "<p>Learn to recognize and understand all traffic signs and signals. Essential knowledge for safe navigation on roads.</p>",
            "description_sw": "<p>Jifunze kutambua na kuelewa alama zote za trafiki na ishara. Maarifa muhimu kwa usafiri salama barabarani.</p>",
            "course_track": "beginner",
            "course_category": "basic",
            "level": "Basic",
            "duration_hours": 5,
            "thumbnail_emoji": "🚸",
            "status": "Published",
            "is_free": 1,
            "published_date": today(),
            "lessons": [
                {
                    "lesson_title_en": "Warning Signs",
                    "lesson_title_sw": "Alama za Onyo",
                    "content_type": "text",
                    "duration_minutes": 20,
                    "lesson_order": 1,
                    "summary_en": "Recognize and understand warning signs",
                    "summary_sw": "Tambua na elewa alama za onyo"
                },
                {
                    "lesson_title_en": "Regulatory Signs",
                    "lesson_title_sw": "Alama za Udhibiti",
                    "content_type": "text",
                    "duration_minutes": 25,
                    "lesson_order": 2,
                    "summary_en": "Learn about mandatory and prohibitory signs",
                    "summary_sw": "Jifunze kuhusu alama za lazima na marufuku"
                },
                {
                    "lesson_title_en": "Information Signs",
                    "lesson_title_sw": "Alama za Taarifa",
                    "content_type": "text",
                    "duration_minutes": 20,
                    "lesson_order": 3,
                    "summary_en": "Understanding directional and informational signs",
                    "summary_sw": "Kuelewa alama za mwelekeo na taarifa"
                }
            ]
        },
        {
            "course_name_en": "Defensive Driving",
            "course_name_sw": "Udereva wa Kujilinda",
            "description_en": "<p>Advanced techniques for safe driving in challenging conditions. Learn to anticipate and avoid potential hazards.</p>",
            "description_sw": "<p>Mbinu za juu za udereva salama katika hali ngumu. Jifunze kutabiri na kuepuka hatari zinazoweza kutokea.</p>",
            "course_track": "professional",
            "course_category": "vip",
            "level": "Intermediate",
            "duration_hours": 6,
            "thumbnail_emoji": "🛡️",
            "status": "Published",
            "is_free": 0,
            "price": 50000,
            "published_date": today(),
            "lessons": [
                {
                    "lesson_title_en": "Hazard Perception",
                    "lesson_title_sw": "Kutambua Hatari",
                    "content_type": "text",
                    "duration_minutes": 30,
                    "lesson_order": 1,
                    "summary_en": "Learn to identify potential hazards early",
                    "summary_sw": "Jifunze kutambua hatari zinazoweza kutokea mapema"
                },
                {
                    "lesson_title_en": "Safe Following Distance",
                    "lesson_title_sw": "Umbali Salama wa Kufuata",
                    "content_type": "text",
                    "duration_minutes": 25,
                    "lesson_order": 2,
                    "summary_en": "Maintain proper distance from other vehicles",
                    "summary_sw": "Weka umbali sahihi kutoka magari mengine"
                },
                {
                    "lesson_title_en": "Emergency Maneuvers",
                    "lesson_title_sw": "Mienendo ya Dharura",
                    "content_type": "text",
                    "duration_minutes": 35,
                    "lesson_order": 3,
                    "summary_en": "How to react in emergency situations",
                    "summary_sw": "Jinsi ya kutenda katika hali za dharura"
                }
            ]
        },
        {
            "course_name_en": "Vehicle Maintenance Basics",
            "course_name_sw": "Misingi ya Matengenezo ya Gari",
            "description_en": "<p>Essential vehicle care and maintenance knowledge every driver should know.</p>",
            "description_sw": "<p>Maarifa muhimu ya matengenezo ya gari ambayo kila dereva anapaswa kujua.</p>",
            "course_track": "beginner",
            "course_category": "basic",
            "level": "Basic",
            "duration_hours": 3,
            "thumbnail_emoji": "🔧",
            "status": "Published",
            "is_free": 1,
            "published_date": today(),
            "lessons": [
                {
                    "lesson_title_en": "Daily Vehicle Checks",
                    "lesson_title_sw": "Ukaguzi wa Kila Siku wa Gari",
                    "content_type": "text",
                    "duration_minutes": 20,
                    "lesson_order": 1,
                    "summary_en": "What to check before driving",
                    "summary_sw": "Nini cha kukagua kabla ya kuendesha"
                },
                {
                    "lesson_title_en": "Tire Maintenance",
                    "lesson_title_sw": "Matengenezo ya Matairi",
                    "content_type": "text",
                    "duration_minutes": 25,
                    "lesson_order": 2,
                    "summary_en": "Proper tire care and pressure checks",
                    "summary_sw": "Matunzo sahihi ya matairi na ukaguzi wa shinikizo"
                },
                {
                    "lesson_title_en": "Fluid Levels",
                    "lesson_title_sw": "Viwango vya Maji",
                    "content_type": "text",
                    "duration_minutes": 20,
                    "lesson_order": 3,
                    "summary_en": "Checking and maintaining fluid levels",
                    "summary_sw": "Kukagua na kudumisha viwango vya maji"
                }
            ]
        },
        {
            "course_name_en": "Emergency Response",
            "course_name_sw": "Majibu ya Dharura",
            "description_en": "<p>How to handle road emergencies and accidents professionally.</p>",
            "description_sw": "<p>Jinsi ya kushughulikia dharura za barabara na ajali kwa kitaaluma.</p>",
            "course_track": "professional",
            "course_category": "psv",
            "level": "Intermediate",
            "duration_hours": 3,
            "thumbnail_emoji": "🚨",
            "status": "Published",
            "is_free": 0,
            "price": 30000,
            "published_date": today(),
            "lessons": [
                {
                    "lesson_title_en": "Accident Scene Management",
                    "lesson_title_sw": "Usimamizi wa Eneo la Ajali",
                    "content_type": "text",
                    "duration_minutes": 25,
                    "lesson_order": 1,
                    "summary_en": "How to secure an accident scene",
                    "summary_sw": "Jinsi ya kulinda eneo la ajali"
                },
                {
                    "lesson_title_en": "First Aid Basics",
                    "lesson_title_sw": "Misingi ya Huduma ya Kwanza",
                    "content_type": "text",
                    "duration_minutes": 30,
                    "lesson_order": 2,
                    "summary_en": "Basic first aid for road accidents",
                    "summary_sw": "Huduma ya kwanza ya msingi kwa ajali za barabara"
                },
                {
                    "lesson_title_en": "Emergency Contacts",
                    "lesson_title_sw": "Mawasiliano ya Dharura",
                    "content_type": "text",
                    "duration_minutes": 15,
                    "lesson_order": 3,
                    "summary_en": "Who to call in emergencies",
                    "summary_sw": "Nani wa kupigia simu katika dharura"
                }
            ]
        },
        {
            "course_name_en": "Commercial Driving",
            "course_name_sw": "Udereva wa Biashara",
            "description_en": "<p>Professional driving for commercial vehicles including trucks and heavy goods vehicles.</p>",
            "description_sw": "<p>Udereva wa kitaaluma wa magari ya biashara ikiwemo malori na magari ya mizigo mizito.</p>",
            "course_track": "professional",
            "course_category": "hgv",
            "level": "Advanced",
            "duration_hours": 8,
            "thumbnail_emoji": "🚛",
            "status": "Published",
            "is_free": 0,
            "price": 100000,
            "published_date": today(),
            "lessons": [
                {
                    "lesson_title_en": "HGV Regulations",
                    "lesson_title_sw": "Kanuni za Magari Mazito",
                    "content_type": "text",
                    "duration_minutes": 30,
                    "lesson_order": 1,
                    "summary_en": "Legal requirements for heavy goods vehicles",
                    "summary_sw": "Mahitaji ya kisheria kwa magari ya mizigo mizito"
                },
                {
                    "lesson_title_en": "Load Security",
                    "lesson_title_sw": "Usalama wa Mzigo",
                    "content_type": "text",
                    "duration_minutes": 35,
                    "lesson_order": 2,
                    "summary_en": "Proper loading and securing of cargo",
                    "summary_sw": "Kupakia na kufunga mizigo kwa usahihi"
                },
                {
                    "lesson_title_en": "Long Distance Driving",
                    "lesson_title_sw": "Udereva wa Umbali Mrefu",
                    "content_type": "text",
                    "duration_minutes": 40,
                    "lesson_order": 3,
                    "summary_en": "Managing fatigue and long journeys",
                    "summary_sw": "Kusimamia uchovu na safari ndefu"
                }
            ]
        }
    ]
    
    created_courses = []
    
    for course_data in courses_data:
        try:
            # Extract lessons data
            lessons_data = course_data.pop("lessons", [])
            
            # Check if course already exists
            existing = frappe.db.exists("Course", {
                "course_name_en": course_data["course_name_en"]
            })
            
            if existing:
                print(f"Course '{course_data['course_name_en']}' already exists. Skipping...")
                continue
            
            # Create course
            course = frappe.get_doc({
                "doctype": "Course",
                **course_data
            })
            course.insert(ignore_permissions=True)
            print(f"✓ Created course: {course.course_name_en}")
            
            # Create lessons for this course
            for lesson_data in lessons_data:
                lesson_data["course"] = course.name
                lesson_data["is_active"] = 1
                
                lesson = frappe.get_doc({
                    "doctype": "Lesson",
                    **lesson_data
                })
                lesson.insert(ignore_permissions=True)
                print(f"  ✓ Created lesson: {lesson.lesson_title_en}")
            
            # Update course total lessons
            course.total_lessons = len(lessons_data)
            course.save(ignore_permissions=True)
            
            created_courses.append(course.name)
            
        except Exception as e:
            print(f"✗ Error creating course '{course_data.get('course_name_en', 'Unknown')}': {str(e)}")
            frappe.log_error(frappe.get_traceback(), f"Seed Course Error: {course_data.get('course_name_en')}")
    
    frappe.db.commit()
    
    print(f"\n{'='*50}")
    print(f"Migration complete!")
    print(f"Created {len(created_courses)} courses")
    print(f"{'='*50}\n")
    
    # Print summary
    print("Summary by Track:")
    beginner_count = frappe.db.count("Course", {"course_track": "beginner"})
    professional_count = frappe.db.count("Course", {"course_track": "professional"})
    print(f"  Beginner: {beginner_count} courses")
    print(f"  Professional: {professional_count} courses")
    
    print("\nSummary by Category:")
    for category in ["pikipiki", "basic", "vip", "psv", "hgv"]:
        count = frappe.db.count("Course", {"course_category": category})
        print(f"  {category.upper()}: {count} courses")
    
    print(f"\nTotal Lessons: {frappe.db.count('Lesson')}")
    
    return {
        "success": True,
        "courses_created": len(created_courses),
        "course_names": created_courses
    }


@frappe.whitelist()
def run_seed():
    """Whitelisted method to run seed from API"""
    if not frappe.has_permission("Course", "create"):
        frappe.throw("Insufficient permissions")
    
    return seed_elimika_courses()
