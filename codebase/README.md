# IGK Learning Centre - Learning Management System

## 🎓 System Overview

This is a complete Learning Management System (LMS) integrated into the IGK Learning Centre website with role-based access for Administrators, Teachers, Students, and Parents.

---

## 🔐 Demo Login Credentials

### **Administrator Access (FULL CONTROL)**
- **Email:** `academic@igklc.org`
- **Password:** `sayakyaw12348765`
- **Dashboard:** `/lms/admin/dashboard`

**Admin Capabilities:**
- ✅ Manage all users (create, edit, delete)
- ✅ Create and manage courses
- ✅ **Create and manage quizzes**
- ✅ Assign teachers to courses
- ✅ Enroll students in courses
- ✅ Link parents to students
- ✅ View system analytics
- ✅ Full system control

---

### **Teacher Access (3 Demo Teachers)**

**Teacher 1:**
- **Name:** Sarah Johnson
- **Email:** `sarah.johnson@igklc.org`
- **Password:** `Teacher@123`
- **Assigned Courses:** All existing courses (demo setup)

**Teacher 2:**
- **Name:** Michael Chen
- **Email:** `michael.chen@igklc.org`
- **Password:** `Teacher@123`

**Teacher 3:**
- **Name:** Emily Rodriguez
- **Email:** `emily.rodriguez@igklc.org`
- **Password:** `Teacher@123`

**Teacher Capabilities:**
- ✅ View assigned courses only
- ✅ Add lessons to their courses
- ✅ Upload videos, PDFs, files
- ✅ Create quizzes (coming soon)
- ✅ Create assignments (coming soon)
- ✅ Publish or save as draft
- ✅ Edit/delete their content
- ✅ View student enrollment count

---

### **Student Access (5 Demo Students)**

**Student 1:**
- **Name:** Alice Wong
- **Email:** `alice.wong@student.igklc.org`
- **Password:** `Student@123`
- **Parent:** Jennifer Wong (mother)

**Student 2:**
- **Name:** Bob Martinez
- **Email:** `bob.martinez@student.igklc.org`
- **Password:** `Student@123`
- **Parent:** David Martinez (father)

**Student 3:**
- **Name:** Charlie Kim
- **Email:** `charlie.kim@student.igklc.org`
- **Password:** `Student@123`
- **Parent:** Lisa Kim (mother)

**Student 4:**
- **Name:** Diana Patel
- **Email:** `diana.patel@student.igklc.org`
- **Password:** `Student@123`
- **Parent:** Lisa Kim (guardian)

**Student 5:**
- **Name:** Ethan Brown
- **Email:** `ethan.brown@student.igklc.org`
- **Password:** `Student@123`
- **Parent:** None

**Student Capabilities:**
- ✅ View enrolled courses ONLY (access control enforced)
- ✅ Cannot access courses they're not enrolled in
- ✅ See course progress
- ✅ Watch video lessons
- ✅ Read text lessons
- ✅ Download PDFs and files
- ✅ Mark lessons complete
- ✅ Track progress automatically
- ✅ Take quizzes (coming soon)
- ✅ Submit assignments (coming soon)

---

### **Parent Access (3 Demo Parents)**

**Parent 1 (Single Child):**
- **Name:** Jennifer Wong
- **Email:** `jennifer.wong@parent.igklc.org`
- **Password:** `Parent@123`
- **Children:** Alice Wong (daughter)

**Parent 2 (Single Child):**
- **Name:** David Martinez
- **Email:** `david.martinez@parent.igklc.org`
- **Password:** `Parent@123`
- **Children:** Bob Martinez (son)

**Parent 3 (Multiple Children - BEST FOR TESTING):**
- **Name:** Lisa Kim
- **Email:** `lisa.kim@parent.igklc.org`
- **Password:** `Parent@123`
- **Children:** 
  - Charlie Kim (son - relationship: mother)
  - Diana Patel (daughter - relationship: guardian)

**Parent Capabilities:**
- ✅ View all linked children
- ✅ Switch between children (if multiple)
- ✅ Monitor course enrollments
- ✅ Track learning progress
- ✅ View attendance records
- ✅ See performance insights
- ✅ Receive automated alerts
- ✅ Contact school directly

---

## 📚 Complete Testing Guide

### **🔴 Admin Testing Workflow**

1. **Login as Admin**
   ```
   Email: academic@igklc.org
   Password: sayakyaw12348765
   ```

2. **Create a Course**
   - Navigate to "Courses" from sidebar
   - Click "Create Course"
   - Fill form:
     - Title: "Cambridge Primary Year 3 Mathematics"
     - Description: "Comprehensive math program for Year 3 students"
     - Level: Primary
     - Status: Published
     - Duration: 12 weeks
   - Upload thumbnail (optional)
   - Click "Create Course"

3. **Create a Quiz**
   - Navigate to "Quizzes" from sidebar
   - Click "Create Quiz"
   - Fill quiz settings:
     - Select course
     - Title: "Chapter 1 Quiz - Introduction to Fractions"
     - Time limit: 30 minutes
     - Passing score: 70%
     - Status: Published
   - Add questions:
     - Click question type (Multiple Choice/True-False/Short Answer)
     - Enter question text
     - Add options (for multiple choice)
     - Select/enter correct answer
     - Set points
     - Click "Add Question to Quiz"
   - Add multiple questions
   - Click "Create Quiz"

4. **Assign Teacher to Course**
   - Already done: Sarah Johnson is assigned to all courses

5. **Enroll Students**
   - Navigate to "Users" from sidebar
   - (Currently manual via PocketBase - enrollment UI coming in Phase 7)
   - Or use Database → PocketBase Dashboard to create enrollment records

6. **View System Analytics**
   - Dashboard shows total users, courses, enrollments, quizzes
   - Quick actions available

---

### **👨‍🏫 Teacher Testing Workflow**

1. **Login as Teacher**
   ```
   Email: sarah.johnson@igklc.org
   Password: Teacher@123
   ```

2. **View Dashboard**
   - See "My Courses" (assigned courses only)
   - View student count per course
   - Click "Manage Course" on any course

3. **Add First Lesson**
   - Click "Add Lesson" button
   - Fill simple form:
     - **Title:** "Introduction to Fractions"
     - **Status:** Published
     - **Video Link:** `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
     - **Lesson Text:** "In this lesson, we'll learn what fractions are..."
     - **Upload Files:** Add a PDF (optional)
     - **Estimated Time:** 30 minutes
   - Click "Add Lesson"
   - See success message ✓

4. **Create Draft Lesson**
   - Click "Add Lesson" again
   - Title: "Advanced Fraction Problems"
   - Status: **Draft** (only you can see)
   - Add content
   - Save
   - Notice gray "Draft" badge

5. **Edit Lesson**
   - Click Edit (✏️) on any lesson
   - Change content
   - Add/remove files
   - Change Draft → Published
   - Save changes

6. **Delete Lesson**
   - Click Delete (🗑️)
   - Read warning
   - Type "DELETE"
   - Confirm

7. **Manage Multiple Lessons**
   - Add 5+ lessons to test ordering
   - Mix of video, text, and files
   - Some draft, some published

---

### **👨‍🎓 Student Testing Workflow**

1. **Login as Student**
   ```
   Email: alice.wong@student.igklc.org
   Password: Student@123
   ```

2. **View Dashboard**
   - See enrolled courses ONLY (access control enforced)
   - View progress bars
   - See course thumbnails
   - Check stats (Active Courses, Completed, Average Progress)

3. **Test Access Control**
   - Try accessing a course you're NOT enrolled in
   - Manually visit `/lms/student/course/RANDOM_ID`
   - **Result:** Redirected to Unauthorized page ✓

4. **Open Course**
   - Click "Continue Learning" on enrolled course
   - See ordered lesson list
   - View completed vs incomplete lessons
   - Check overall course progress

5. **Take a Lesson**
   - Click any lesson from the list
   - Watch embedded video (if teacher added YouTube/Vimeo)
   - Read lesson text
   - Download PDF files
   - Scroll through all content

6. **Mark Complete**
   - Click large green "Mark Lesson as Complete" button
   - See success message ✓
   - Auto-redirect to course after 2 seconds
   - Notice green checkmark on completed lesson

7. **Track Progress**
   - Return to dashboard
   - See progress bar updated
   - Complete more lessons
   - Watch percentage increase

8. **Complete Course**
   - Complete all lessons
   - See 100% progress
   - See completion celebration 🎉

---

### **👨‍👩‍👧 Parent Testing Workflow**

**Option A: Single Child (Jennifer Wong)**

1. **Login as Parent**
   ```
   Email: jennifer.wong@parent.igklc.org
   Password: Parent@123
   ```

2. **View Dashboard**
   - See Alice Wong's header immediately
   - View 4 quick stats
   - No child selection needed

3. **Monitor Progress**
   - See enrolled courses with progress bars
   - Check attendance records
   - Read performance insights
   - View circular progress indicator

4. **Contact School**
   - Click phone button → Opens phone app
   - Click email button → Opens email app

---

**Option B: Multiple Children (Lisa Kim - BEST TEST)**

1. **Login as Parent**
   ```
   Email: lisa.kim@parent.igklc.org
   Password: Parent@123
   ```

2. **See Child Selector**
   - Two cards displayed: Charlie Kim, Diana Patel
   - Shows relationship type
   - Click Charlie Kim

3. **View Charlie's Data**
   - See his courses
   - View his progress
   - Check his attendance
   - Read performance insights specific to Charlie

4. **Switch to Diana**
   - Click Diana Patel card
   - Dashboard updates to show Diana's data
   - See her separate progress
   - View her attendance
   - Compare performance

5. **Monitor Both Children**
   - Easy switching between children
   - Independent stats for each
   - Separate alerts and insights

---

## 🎯 Complete End-to-End Test Scenario

**Full System Test (30 minutes):**

### **Step 1: Admin Setup (5 min)**
1. Login as admin (academic@igklc.org)
2. Create course: "Primary Mathematics Year 3"
3. Create quiz: "Fractions Quiz" with 5 questions
4. Verify Sarah Johnson is assigned (already done)
5. Navigate to Database → PocketBase Dashboard
6. Create enrollment: Student = Alice Wong, Course = Primary Math, Status = active

### **Step 2: Teacher Content Creation (10 min)**
1. Login as Teacher Sarah
2. Open "Primary Mathematics Year 3"
3. Add Lesson 1:
   - Title: "Counting 1-10"
   - Video: YouTube link
   - Text: Explanation
   - Status: Published
4. Add Lesson 2:
   - Title: "Addition Basics"
   - Upload PDF
   - Text: Instructions
   - Status: Published
5. Add Lesson 3:
   - Title: "Advanced Addition"
   - Status: Draft (not ready)

### **Step 3: Student Learning (10 min)**
1. Login as Student Alice
2. See "Primary Mathematics Year 3" enrolled
3. Open course → See 2 published lessons (Lesson 3 hidden)
4. Open Lesson 1 "Counting 1-10"
5. Watch video
6. Read content
7. Mark complete
8. See progress: 50% (1 of 2 lessons)
9. Open Lesson 2 "Addition Basics"
10. Download PDF
11. Mark complete
12. See progress: 100% 🎉

### **Step 4: Parent Monitoring (5 min)**
1. Login as Parent Jennifer
2. See Alice's dashboard immediately
3. View course: "Primary Mathematics Year 3" - 100% complete
4. Check attendance (if admin added records)
5. See "Excellent Progress!" insight
6. See completion celebration banner
7. Test contact buttons

---

## 📱 Mobile Testing

**Test on mobile device:**
- All dashboards responsive
- Touch-friendly buttons
- Readable text sizes
- Scrollable modals
- No horizontal scroll
- Easy navigation

---

## 🔒 Security Features

**Role-Based Access:**
- ✅ Admins see everything
- ✅ Teachers see only assigned courses
- ✅ Students see only enrolled courses (cannot access others by URL)
- ✅ Parents see only linked children's data
- ✅ Unauthorized access blocked
- ✅ Auto-redirect to appropriate dashboard

**Data Protection:**
- ✅ Row-level security via PocketBase rules
- ✅ Protected routes with role verification
- ✅ Enrollment verification for student course/lesson access
- ✅ Teacher assignment verification for course management
- ✅ Session management with auto-refresh
- ✅ Logout clears auth state

---

## 🎨 Design System

**Consistent Dark Gray Theme:**
- Gray-900/Gray-800 backgrounds
- Gray-700 cards with gradient overlays
- Red-700/Red-600 primary buttons
- Amber-400 highlights and accents
- Color-coded badges (Green/Blue/Purple/Red)
- 2xl rounded corners
- 2px borders
- Smooth hover effects
- Scale animations

---

## 📊 Current System Status

### **✅ Fully Functional:**
- User authentication (all 4 roles)
- Admin user management (CRUD, linking)
- Admin course management (CRUD)
- **Admin quiz management (CREATE with visual builder)**
- Teacher lesson management (create, edit, delete)
- Student learning experience (view, complete)
- **Student access control (enrollment verification)**
- Parent monitoring dashboard
- Progress tracking
- Attendance display
- Multi-child support
- Mobile responsive design

### **🔄 Coming Soon:**
- Quiz taking interface (students)
- Quiz grading (auto for MCQ/TF, manual for short answer)
- Assignment manager (teachers assign, students submit)
- Grading system
- Direct messaging
- Certificates generation
- Advanced analytics
- Payment integration

---

## 🚀 Quick Start Guide

### **For School Administrators:**
1. Login with admin credentials (academic@igklc.org / sayakyaw12348765)
2. Go to Users → Create teachers, students, parents
3. Go to Courses → Create courses
4. **Go to Quizzes → Create quizzes with questions**
5. Link parents to students
6. Assign teachers to courses
7. Enroll students in courses (via PocketBase Dashboard currently)

### **For Teachers:**
1. Login with teacher credentials
2. See your assigned courses
3. Click course → Add lessons
4. Upload content (videos, PDFs, text)
5. Publish when ready
6. Monitor student enrollment count

### **For Students:**
1. Login with student credentials
2. View enrolled courses
3. Click course → See lessons
4. Complete lessons one by one
5. Track your progress
6. Celebrate achievements

### **For Parents:**
1. Login with parent credentials
2. View linked children
3. Select child (if multiple)
4. Monitor progress and attendance
5. Read performance insights
6. Contact school if needed

---

## 📞 Support Contact

**IGK Learning Centre**
- **Phone:** 082-354-5362 / 082-465-3236
- **Email:** info@igklearningcentre.org
- **Address:** 95/72 Samak Sappakan Road, Mae Sot District, Tak Province 63110
- **Hours:** Monday - Sunday, 8:00 AM - 5:00 PM

---

## 🎯 System Architecture

### **Frontend:**
- React 19 + TypeScript
- Tailwind CSS v4 (Dark Gray Theme)
- React Router (routing)
- Vite (build tool)

### **Backend:**
- PocketBase (BaaS)
- 15 Collections (users, courses, lessons, enrollments, quizzes, etc.)
- Row-level security
- File storage
- Authentication

### **Key Collections:**
- `users` - All users with role field
- `courses` - Course catalog
- `lessons` - Lesson content
- `enrollments` - Student-course links (enforces access control)
- `student_progress` - Lesson completion tracking
- `teacher_course_assignments` - Teacher-course access (enforces access control)
- `parent_student_links` - Parent-child relationships
- `attendance` - Attendance records
- `quizzes` - Quiz metadata
- `quiz_questions` - Quiz questions and answers
- `quiz_attempts` - Student quiz submissions

---

## 🧪 Testing Checklist

### **Admin Tests:**
- [ ] Create new user (all 4 roles)
- [ ] Edit user information
- [ ] Delete user (with confirmation)
- [ ] Link parent to student
- [ ] Create new course
- [ ] Edit course details
- [ ] Delete course (with confirmation)
- [ ] **Create quiz with multiple questions**
- [ ] **Edit quiz questions**
- [ ] **Delete quiz**
- [ ] Search/filter users
- [ ] Search/filter courses
- [ ] **Search/filter quizzes**

### **Teacher Tests:**
- [ ] View assigned courses only
- [ ] Add lesson with video link
- [ ] Add lesson with PDF upload
- [ ] Add lesson with text content
- [ ] Save lesson as draft
- [ ] Publish lesson
- [ ] Edit existing lesson
- [ ] Delete lesson (with confirmation)
- [ ] View student count

### **Student Tests:**
- [ ] View enrolled courses ONLY
- [ ] **Try accessing unenrolled course (should fail)**
- [ ] See progress percentage
- [ ] Open course view
- [ ] Click lesson to view
- [ ] Watch embedded video
- [ ] Download PDF file
- [ ] Mark lesson complete
- [ ] See progress update
- [ ] View completion celebration
- [ ] **Verify cannot see draft lessons**

### **Parent Tests:**
- [ ] View linked children
- [ ] Switch between children (if multiple)
- [ ] See child's enrolled courses
- [ ] View progress bars
- [ ] Check attendance records
- [ ] Read performance insights
- [ ] Click contact school buttons

---

## 🎨 UI/UX Highlights

**Admin-Friendly:**
- "Create Quiz" not "Insert quiz record"
- Visual quiz builder with live preview
- Question counter showing progress
- Color-coded question types
- Drag-and-drop future support

**Teacher-Friendly:**
- "Add Lesson" not "Create lesson record"
- "Upload files" not "Attach to database"
- "Students can see it" not "Update visibility"
- Large buttons, clear labels
- Success/error messages in plain English

**Student-Friendly:**
- Clean, distraction-free learning
- Large "Mark Complete" button
- Visual progress bars
- Motivational messages
- Mobile-optimized
- **Cannot cheat by URL manipulation**

**Parent-Friendly:**
- At-a-glance stats
- Color-coded alerts
- Easy child switching
- Clear performance insights
- Direct contact options

---

## 💡 Tips for Real Usage

### **For Admins:**
- Create courses first
- Then create quizzes for each course
- Create/import users
- Assign teachers to courses
- Enroll students via PocketBase Dashboard (enrollment UI coming)
- Link parents to students via Users page

### **For Teachers:**
- Start with 3-5 lessons per course
- Use Draft mode while preparing content
- Publish when ready for students
- Mix content types (videos, text, PDFs)
- Add estimated time for planning

### **For Students:**
- Complete lessons in order for best learning flow
- Mark lessons complete to track progress
- Download PDFs for offline study
- Ask teachers if you need help

### **For Parents:**
- Check dashboard weekly
- Monitor attendance regularly
- Contact school if concerns arise
- Celebrate your child's achievements

---

## 🔧 Technical Notes

**Database Access:**
- Click "Database" in left menu → "PocketBase Dashboard"
- View collections, records, schema
- Manual data entry if needed

**Password Reset:**
- Admins can reset any user password via Edit User modal
- Use "Generate Password" for secure random passwords

**File Uploads:**
- Max 50MB per file for lessons
- Max 5MB for user avatars and course thumbnails
- Supported: JPG, PNG, WebP, PDF, MP4

---

## 🎉 What's Complete

- ✅ **Phase 1:** Foundation & Authentication
- ✅ **Phase 2:** Admin User Management
- ✅ **Phase 3:** Admin Course Management
- ✅ **Phase 4:** Teacher Content Management
- ✅ **Phase 5:** Student Learning Experience
- ✅ **Phase 6:** Parent Dashboard
- ✅ **Phase 7A:** Admin Quiz Creation (Visual Builder)
- ✅ **Access Control:** Students can only access enrolled courses

**Your LMS is production-ready for core learning activities!**

---

## 🚀 Next Steps (Optional Enhancements)

**Phase 7B - Quiz Taking:**
- Student quiz interface
- Timer countdown
- Auto-submit on time limit
- Instant grading for MCQ/TF

**Phase 8 - Assignment System:**
- Assignment creation for teachers
- File submission for students
- Grading interface
- Due date tracking

**Phase 9 - Advanced Features:**
- Student enrollment UI (admin)
- Messaging system
- Certificates generator
- Advanced analytics dashboard
- Payment integration
- Email notifications

---

## 📖 Quick Reference

**Main Website:** `/`
**LMS Login:** `/lms/login`

**Admin Portal:** `/lms/admin/*`
**Teacher Portal:** `/lms/teacher/*`
**Student Portal:** `/lms/student/*`
**Parent Portal:** `/lms/parent/*`

---

**Need help?** Contact IGK Learning Centre support or refer to this guide for testing credentials and workflows.