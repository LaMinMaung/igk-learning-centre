migrate((app) => {
  // 1. Add "demo_admin" to role values
  const users = app.findCollectionByNameOrId("users")
  const roleField = users.fields.getByName("role")
  roleField.values = ["admin", "teacher", "student", "parent", "demo_admin"]
  app.save(users)

  // 2. Update all collections to allow demo_admin for list/view only

  // USERS
  users.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || id = @request.auth.id"
  users.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || id = @request.auth.id"
  app.save(users)

  // COURSES
  const courses = app.findCollectionByNameOrId("courses")
  courses.listRule = "@request.auth.id != '' || @request.auth.role = 'demo_admin'"
  courses.viewRule = "@request.auth.id != '' || @request.auth.role = 'demo_admin'"
  app.save(courses)

  // LESSONS
  const lessons = app.findCollectionByNameOrId("lessons")
  lessons.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  lessons.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  app.save(lessons)

  // ENROLLMENTS
  const enrollments = app.findCollectionByNameOrId("enrollments")
  enrollments.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  enrollments.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  app.save(enrollments)

  // STUDENT_PROGRESS
  const progress = app.findCollectionByNameOrId("student_progress")
  progress.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && lesson.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  progress.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && lesson.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  app.save(progress)

  // QUIZZES
  const quizzes = app.findCollectionByNameOrId("quizzes")
  quizzes.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  quizzes.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  app.save(quizzes)

  // QUIZ_QUESTIONS
  const questions = app.findCollectionByNameOrId("quiz_questions")
  questions.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  questions.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  app.save(questions)

  // QUIZ_ATTEMPTS
  const attempts = app.findCollectionByNameOrId("quiz_attempts")
  attempts.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  attempts.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  app.save(attempts)

  // ASSIGNMENTS
  const assignments = app.findCollectionByNameOrId("assignments")
  assignments.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  assignments.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  app.save(assignments)

  // ASSIGNMENT_SUBMISSIONS
  const submissions = app.findCollectionByNameOrId("assignment_submissions")
  submissions.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && assignment.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  submissions.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && assignment.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  app.save(submissions)

  // PARENT_STUDENT_LINKS
  const links = app.findCollectionByNameOrId("parent_student_links")
  links.listRule = "@request.auth.id != '' && (parent = @request.auth.id || student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin')"
  links.viewRule = "@request.auth.id != '' && (parent = @request.auth.id || student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin')"
  app.save(links)

  // TEACHER_COURSE_ASSIGNMENTS
  const teacherAssignments = app.findCollectionByNameOrId("teacher_course_assignments")
  teacherAssignments.listRule = "@request.auth.id != '' && (teacher = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin')"
  teacherAssignments.viewRule = "@request.auth.id != '' && (teacher = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin')"
  app.save(teacherAssignments)

  // ATTENDANCE
  const attendance = app.findCollectionByNameOrId("attendance")
  attendance.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  attendance.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  app.save(attendance)

  // ANNOUNCEMENTS
  const announcements = app.findCollectionByNameOrId("announcements")
  announcements.listRule = "@request.auth.id != '' || @request.auth.role = 'demo_admin'"
  announcements.viewRule = "@request.auth.id != '' || @request.auth.role = 'demo_admin'"
  app.save(announcements)

  // NOTIFICATIONS
  const notifications = app.findCollectionByNameOrId("notifications")
  notifications.listRule = "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin')"
  notifications.viewRule = "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin')"
  app.save(notifications)

  // 3. Create or update demo admin account (handle case where it already exists)
  let demo
  try {
    demo = app.findAuthRecordByEmail("users", "demo@igklc.org")
  } catch {
    const usersCollection = app.findCollectionByNameOrId("users")
    demo = new Record(usersCollection)
    demo.set("email", "demo@igklc.org")
    demo.setPassword("Demo@IGK2024")
  }
  demo.set("name", "Demo Viewer")
  demo.set("role", "demo_admin")
  demo.set("emailVisibility", true)
  app.save(demo)

}, (app) => {
  try {
    const demo = app.findAuthRecordByEmail("users", "demo@igklc.org")
    app.delete(demo)
  } catch {}

  const users = app.findCollectionByNameOrId("users")
  const roleField = users.fields.getByName("role")
  roleField.values = ["admin", "teacher", "student", "parent"]
  app.save(users)
})
