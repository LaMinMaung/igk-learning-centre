migrate((app) => {
  const usersId = app.findCollectionByNameOrId("users").id
  const coursesId = app.findCollectionByNameOrId("courses").id
  const lessonsId = app.findCollectionByNameOrId("lessons").id
  const quizzesId = app.findCollectionByNameOrId("quizzes").id

  // 1. USERS - Only admins can create users
  const users = app.findCollectionByNameOrId("users")
  users.createRule = "@request.auth.role = 'admin'"
  app.save(users)

  // 2. COURSES - Only admins can create/delete courses
  const courses = app.findCollectionByNameOrId("courses")
  courses.createRule = "@request.auth.role = 'admin'"
  courses.updateRule = "@request.auth.role = 'admin'"
  courses.deleteRule = "@request.auth.role = 'admin'"
  app.save(courses)

  // 3. LESSONS - Teachers can only manage lessons in assigned courses
  const lessons = app.findCollectionByNameOrId("lessons")
  
  // Teachers can only see lessons from their assigned courses
  lessons.listRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  lessons.viewRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  // Create: Admin OR teacher assigned to the course
  lessons.createRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && @request.body.course:isset = true && @request.body.course ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  // Update: Admin OR teacher assigned to this lesson's course
  lessons.updateRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  // Delete: Admin OR teacher assigned to this lesson's course
  lessons.deleteRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  app.save(lessons)

  // 4. QUIZZES - Same pattern as lessons
  const quizzes = app.findCollectionByNameOrId("quizzes")
  
  quizzes.listRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  quizzes.viewRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  quizzes.createRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && @request.body.course:isset = true && @request.body.course ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  quizzes.updateRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  quizzes.deleteRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  app.save(quizzes)

  // 5. QUIZ QUESTIONS - Follow parent quiz permissions
  const questions = app.findCollectionByNameOrId("quiz_questions")
  
  questions.listRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  questions.viewRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  questions.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  
  questions.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  
  questions.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  
  app.save(questions)

  // 6. ENROLLMENTS - Admin only creates enrollments
  const enrollments = app.findCollectionByNameOrId("enrollments")
  
  // Teachers can view enrollments for their assigned courses
  enrollments.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  enrollments.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  app.save(enrollments)

  // 7. STUDENT PROGRESS - Teachers can only view progress for students in assigned courses
  const progress = app.findCollectionByNameOrId("student_progress")
  
  progress.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && lesson.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  progress.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && lesson.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  app.save(progress)

  // 8. ASSIGNMENTS - Teachers can only manage assignments in assigned courses
  const assignments = app.findCollectionByNameOrId("assignments")
  
  assignments.listRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  assignments.viewRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id) || @request.auth.role = 'student'"
  
  assignments.createRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && @request.body.course:isset = true && @request.body.course ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  assignments.updateRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  assignments.deleteRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  app.save(assignments)

  // 9. ASSIGNMENT SUBMISSIONS - Teachers can only view submissions in assigned courses
  const submissions = app.findCollectionByNameOrId("assignment_submissions")
  
  submissions.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && assignment.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  submissions.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && assignment.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  app.save(submissions)

  // 10. QUIZ ATTEMPTS - Teachers can only view attempts in assigned courses
  const attempts = app.findCollectionByNameOrId("quiz_attempts")
  
  attempts.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  attempts.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && quiz.course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  app.save(attempts)

  // 11. ATTENDANCE - Teachers can only manage attendance for their assigned courses
  const attendance = app.findCollectionByNameOrId("attendance")
  
  attendance.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  attendance.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  
  attendance.createRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && @request.body.course:isset = true && @request.body.course ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  attendance.updateRule = "@request.auth.role = 'admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id)"
  
  app.save(attendance)

}, (app) => {
  // Rollback to previous permissive rules
  const users = app.findCollectionByNameOrId("users")
  users.createRule = ""
  app.save(users)
  
  const courses = app.findCollectionByNameOrId("courses")
  courses.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  courses.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  app.save(courses)
  
  const lessons = app.findCollectionByNameOrId("lessons")
  lessons.listRule = "@request.auth.id != ''"
  lessons.viewRule = "@request.auth.id != ''"
  lessons.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  lessons.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  lessons.deleteRule = "@request.auth.role = 'admin'"
  app.save(lessons)
  
  const quizzes = app.findCollectionByNameOrId("quizzes")
  quizzes.listRule = "@request.auth.id != ''"
  quizzes.viewRule = "@request.auth.id != ''"
  quizzes.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  quizzes.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  quizzes.deleteRule = "@request.auth.role = 'admin'"
  app.save(quizzes)
  
  const questions = app.findCollectionByNameOrId("quiz_questions")
  questions.listRule = "@request.auth.id != ''"
  questions.viewRule = "@request.auth.id != ''"
  app.save(questions)
  
  const enrollments = app.findCollectionByNameOrId("enrollments")
  enrollments.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  enrollments.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  app.save(enrollments)
  
  const progress = app.findCollectionByNameOrId("student_progress")
  progress.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  progress.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  app.save(progress)
  
  const assignments = app.findCollectionByNameOrId("assignments")
  assignments.listRule = "@request.auth.id != ''"
  assignments.viewRule = "@request.auth.id != ''"
  assignments.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  assignments.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  assignments.deleteRule = "@request.auth.role = 'admin'"
  app.save(assignments)
  
  const submissions = app.findCollectionByNameOrId("assignment_submissions")
  submissions.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  submissions.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  app.save(submissions)
  
  const attempts = app.findCollectionByNameOrId("quiz_attempts")
  attempts.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  attempts.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  app.save(attempts)
  
  const attendance = app.findCollectionByNameOrId("attendance")
  attendance.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  attendance.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  attendance.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  attendance.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'teacher'"
  app.save(attendance)
})