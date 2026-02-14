DEREVA KIGANJANI PLATFORM – FIRESTORE-ONLY ARCHITECTURE (NO CLOUD FUNCTIONS)
1. SYSTEM OVERVIEW

Dereva Kiganjani is a digital driver services platform powered by:

Firebase Authentication

Firestore (Primary Database)

Firebase Storage (Media & Documents)

Selcom Payment Gateway (Client-side integration via secure API proxy)

⚠️ This version does NOT use Firebase Cloud Functions.

All business logic is handled in:

Frontend (React Web + Mobile App)

Firestore document triggers (manual logic)

Selcom redirect + status polling

2. TECH STACK
Backend Services

Firebase Authentication

Firestore

Firebase Storage

Frontend

React Web App

React Native Mobile App

Botpress WhatsApp Chatbot

Payment Gateway

Selcom Checkout API

Client-side order creation via secure server endpoint (temporary)

3. USER ROLES
Driver

Take tests (JiTesti)

Enroll in courses (Elimika)

Apply for license (Leseni)

Apply for jobs (Ajira ya Udereva)

Upload CV

Request CV creation

Pay for services

Track application status

Employer

Post jobs

Hire drivers

Outsource drivers

View applicants

Pay placement fees

Manage subscriptions

Admin

Manage users

Review license applications

Manage courses & tests

Moderate jobs

View payments

Export reports

4. MODULE SPECIFICATIONS
🔹 JITESTI (Driver Testing)
Driver Features

Browse test categories

View duration & pass mark

Click Pay

After payment → Start test

Timed exam

Instant scoring

Pass/Fail result

Save result in Firestore

Issue certificate

Payment Flow (Firestore Only)

Driver clicks "Pay"

Frontend:

Creates document in payments

Calls Selcom /create-order-minimal

User redirected to Selcom

After redirect:

Frontend calls /order-status

If COMPLETED:

Update payment.status = Completed

Unlock test access

⚠️ No webhook validation (MVP only).

🔹 ELIMIKA (E-Learning)
Driver Features

Browse courses

View beginner/pro tracks

Enroll

Pay (if paid)

Access lessons

Track progress

Receive certificate

Unlock logic:

Course locked until:
payments.status == Completed

🔹 LESENI (License Services)
Driver Side

Submit application

Upload documents (Storage)

Pay processing fee

Track status

Admin Side

Review application

View documents

Approve / Reject

Add notes

Unlock:

Application moves to "Under Review" only if payment completed.

🔹 AJIRA YA UDEREVA (Driver Jobs)
Driver

Browse jobs

Membership paywall

Apply

Request CV creation

Request MDV apply-for-me

Track applications

Membership access:

driver_membership.status == Active

Verified via payments

🔹 AJIRI DEREVA (Employer Hiring)
Employer

Hire directly

Outsource

Submit requirements form

Pay placement fee

Access unlock:

Payment required before admin assigns driver.

5. FIRESTORE COLLECTION DESIGN

Existing:

users

driver_profiles

employers

admins

courses

lessons

jitesti-categories

tests

questions

course_enrollments

certificates

job_applications

license_applications

payments

Add:

driver_memberships

userId

startDate

expiryDate

status

paymentId

placements

employerId

driverId

feePaid

status

employer_subscriptions

employerId

plan

startDate

expiryDate

status

6. PAYMENT MODULE (FIRESTORE-ONLY DESIGN)
Collection: payments
Field	Type
userId	String
service	String
serviceId	String
amount	Number
provider	"Selcom"
referenceId	String
transactionId	String
status	Pending / Completed / Failed
createdAt	Timestamp
Global Payment Flow

Create payment doc (Pending)

Call Selcom create-order

Redirect user

On return:

Poll /order-status

If Completed:

Update Firestore

Unlock service

7. CHATBOT (BOTPRESS)

Bot will:

Generate payment request

Send payment link

Ask user to confirm payment

Admin verifies in Firestore

Unlock service manually if needed

⚠️ Chatbot cannot securely call Selcom without backend proxy.

8. SECURITY RULES (CRITICAL)

Since no Cloud Functions:

Firestore Rules Must:

Users read/write only own documents

Admin role required for:

status updates

approvals

certificate issuance

payments.status only updatable by admin role

9. LIMITATIONS OF THIS ARCHITECTURE

⚠️ No secure server-side payment validation
⚠️ API secret exposure risk if not proxied
⚠️ No automatic webhook handling
⚠️ Manual verification may be required

Suitable for:

MVP

Pilot phase

Controlled user base

Not ideal for:

High-volume production

Government integration

Financial compliance

10. FULL PLATFORM FEATURE MATRIX
Drivers

Account management

Test engine

Course engine

License application

Job application

Membership

Payment tracking

Certificate download

Employers

Company profile

Job posting

Driver search

Placement payments

Subscription billing

Outsource contracts

Admin

User management

License moderation

Course management

Test management

Job moderation

Finance review

Reporting dashboard

11. SCALABILITY PLAN (Future Upgrade)

When ready:

Add Firebase Cloud Functions

Move Selcom integration server-side

Implement webhook listener

Add payment reconciliation automation

Add wallet system