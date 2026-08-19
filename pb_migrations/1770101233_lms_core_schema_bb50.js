migrate((app) => {
  const usersId = app.findCollectionByNameOrId("users").id
  
  // 1. Update users collection to add role field
  const users = app.findCollectionByNameOrId("users")
  users.fields.add(
    new SelectField({
      name: "role",
      required: true,
      values: ["admin", "teacher", "student", "parent"],
      maxSelect: 1
    }),
    new TextField({ name: "phone", max: 50 }),
    new TextField({ name: "address", max: 500 })
  )
  app.save(users)
  
  // 2. Courses Collection
  const courses = new Collection({
    name: "courses",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "description", required: true },
      { type: "file", name: "thumbnail", maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
      { type: "select", name: "level", required: true, values: ["nursery", "primary", "secondary", "exam_prep"], maxSelect: 1 },
      { type: "select", name: "status", required: true, values: ["draft", "published", "archived"], maxSelect: 1 },
      { type: "relation", name: "created_by", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "number", name: "duration_weeks", min: 1 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(courses)
  const coursesId = courses.id
  
  // 3. Lessons Collection
  const lessons = new Collection({
    name: "lessons",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "course", required: true, collectionId: coursesId, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "content" },
      { type: "select", name: "type", required: true, values: ["video", "pdf", "text", "mixed"], maxSelect: 1 },
      { type: "url", name: "video_url" },
      { type: "file", name: "attachments", maxSelect: 10, mimeTypes: ["application/pdf", "image/jpeg", "image/png", "video/mp4"] },
      { type: "number", name: "order", required: true, min: 0 },
      { type: "number", name: "duration_minutes", min: 0 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(lessons)
  const lessonsId = lessons.id
  
  // 4. Enrollments Collection
  const enrollments = new Collection({
    name: "enrollments",
    type: "base",
    listRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    viewRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "student", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "course", required: true, collectionId: coursesId, maxSelect: 1, cascadeDelete: true },
      { type: "date", name: "enrolled_date", required: true },
      { type: "select", name: "status", required: true, values: ["active", "completed", "dropped"], maxSelect: 1 },
      { type: "number", name: "progress_percentage", min: 0, max: 100 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(enrollments)
  
  // 5. Student Progress Collection
  const progress = new Collection({
    name: "student_progress",
    type: "base",
    listRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    viewRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    createRule: "@request.auth.role = 'student'",
    updateRule: "@request.auth.id != '' && student = @request.auth.id",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "student", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "lesson", required: true, collectionId: lessonsId, maxSelect: 1, cascadeDelete: true },
      { type: "bool", name: "completed" },
      { type: "date", name: "completed_date" },
      { type: "number", name: "time_spent_minutes", min: 0 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(progress)
  
  // 6. Quizzes Collection
  const quizzes = new Collection({
    name: "quizzes",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "course", required: true, collectionId: coursesId, maxSelect: 1, cascadeDelete: true },
      { type: "relation", name: "lesson", collectionId: lessonsId, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "instructions" },
      { type: "number", name: "time_limit_minutes", min: 0 },
      { type: "number", name: "passing_score", min: 0, max: 100 },
      { type: "bool", name: "randomize_questions" },
      { type: "select", name: "status", required: true, values: ["draft", "published"], maxSelect: 1 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(quizzes)
  const quizzesId = quizzes.id
  
  // 7. Quiz Questions Collection
  const questions = new Collection({
    name: "quiz_questions",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "quiz", required: true, collectionId: quizzesId, maxSelect: 1, cascadeDelete: true },
      { type: "editor", name: "question_text", required: true },
      { type: "select", name: "question_type", required: true, values: ["multiple_choice", "true_false", "short_answer"], maxSelect: 1 },
      { type: "json", name: "options" },
      { type: "text", name: "correct_answer", required: true, max: 500 },
      { type: "number", name: "points", required: true, min: 1 },
      { type: "number", name: "order", required: true, min: 0 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(questions)
  
  // 8. Quiz Attempts Collection
  const attempts = new Collection({
    name: "quiz_attempts",
    type: "base",
    listRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    viewRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    createRule: "@request.auth.role = 'student'",
    updateRule: "@request.auth.id != '' && student = @request.auth.id",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "student", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "quiz", required: true, collectionId: quizzesId, maxSelect: 1, cascadeDelete: true },
      { type: "json", name: "answers", required: true },
      { type: "number", name: "score", min: 0, max: 100 },
      { type: "bool", name: "passed" },
      { type: "date", name: "started_at", required: true },
      { type: "date", name: "submitted_at" },
      { type: "number", name: "time_taken_minutes", min: 0 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(attempts)
  
  // 9. Assignments Collection
  const assignments = new Collection({
    name: "assignments",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "course", required: true, collectionId: coursesId, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "description", required: true },
      { type: "file", name: "attachments", maxSelect: 5, mimeTypes: ["application/pdf", "image/jpeg", "image/png"] },
      { type: "date", name: "due_date", required: true },
      { type: "number", name: "max_points", required: true, min: 1 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(assignments)
  const assignmentsId = assignments.id
  
  // 10. Assignment Submissions Collection
  const submissions = new Collection({
    name: "assignment_submissions",
    type: "base",
    listRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    viewRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    createRule: "@request.auth.role = 'student'",
    updateRule: "@request.auth.id != '' && student = @request.auth.id",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "student", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "assignment", required: true, collectionId: assignmentsId, maxSelect: 1, cascadeDelete: true },
      { type: "editor", name: "submission_text" },
      { type: "file", name: "files", maxSelect: 5, mimeTypes: ["application/pdf", "image/jpeg", "image/png", "video/mp4"] },
      { type: "date", name: "submitted_at", required: true },
      { type: "number", name: "grade", min: 0 },
      { type: "editor", name: "teacher_feedback" },
      { type: "select", name: "status", required: true, values: ["submitted", "graded", "late"], maxSelect: 1 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(submissions)
  
  // 11. Parent-Student Links Collection
  const parentLinks = new Collection({
    name: "parent_student_links",
    type: "base",
    listRule: "@request.auth.id != '' && (parent = @request.auth.id || student = @request.auth.id || @request.auth.role = 'admin')",
    viewRule: "@request.auth.id != '' && (parent = @request.auth.id || student = @request.auth.id || @request.auth.role = 'admin')",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "parent", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "student", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "select", name: "relationship", required: true, values: ["mother", "father", "guardian"], maxSelect: 1 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(parentLinks)
  
  // 12. Teacher Course Assignments Collection
  const teacherAssignments = new Collection({
    name: "teacher_course_assignments",
    type: "base",
    listRule: "@request.auth.id != '' && (teacher = @request.auth.id || @request.auth.role = 'admin')",
    viewRule: "@request.auth.id != '' && (teacher = @request.auth.id || @request.auth.role = 'admin')",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "teacher", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "course", required: true, collectionId: coursesId, maxSelect: 1, cascadeDelete: true },
      { type: "autodate", name: "assigned_date", onCreate: true }
    ]
  })
  app.save(teacherAssignments)
  
  // 13. Attendance Collection
  const attendance = new Collection({
    name: "attendance",
    type: "base",
    listRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    viewRule: "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'teacher'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "relation", name: "student", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "relation", name: "course", required: true, collectionId: coursesId, maxSelect: 1, cascadeDelete: true },
      { type: "date", name: "date", required: true },
      { type: "select", name: "status", required: true, values: ["present", "absent", "late", "excused"], maxSelect: 1 },
      { type: "text", name: "notes", max: 500 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(attendance)
  
  // 14. Announcements Collection
  const announcements = new Collection({
    name: "announcements",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "content", required: true },
      { type: "select", name: "target_roles", required: true, values: ["all", "students", "teachers", "parents"], maxSelect: 4 },
      { type: "select", name: "priority", required: true, values: ["low", "medium", "high", "urgent"], maxSelect: 1 },
      { type: "date", name: "publish_date", required: true },
      { type: "date", name: "expiry_date" },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(announcements)
  
  // 15. Notifications Collection
  const notifications = new Collection({
    name: "notifications",
    type: "base",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    fields: [
      { type: "relation", name: "user", required: true, collectionId: usersId, maxSelect: 1 },
      { type: "text", name: "title", required: true, max: 200 },
      { type: "text", name: "message", required: true, max: 1000 },
      { type: "select", name: "type", required: true, values: ["info", "success", "warning", "error"], maxSelect: 1 },
      { type: "bool", name: "read" },
      { type: "url", name: "action_link" },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(notifications)
  
}, (app) => {
  // Rollback: Remove all LMS collections
  const collections = [
    "notifications",
    "announcements",
    "attendance",
    "teacher_course_assignments",
    "parent_student_links",
    "assignment_submissions",
    "assignments",
    "quiz_attempts",
    "quiz_questions",
    "quizzes",
    "student_progress",
    "enrollments",
    "lessons",
    "courses"
  ]
  
  for (const name of collections) {
    try {
      const c = app.findCollectionByNameOrId(name)
      app.delete(c)
    } catch {}
  }
  
  // Remove fields from users collection
  const users = app.findCollectionByNameOrId("users")
  users.fields.removeByName("role")
  users.fields.removeByName("phone")
  users.fields.removeByName("address")
  app.save(users)
})