migrate((app) => {

  // ── 1. Users: owner gets full CRUD over all users ────────────────────────
  const users = app.findCollectionByNameOrId("users")
  users.listRule   = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner' || id = @request.auth.id"
  users.viewRule   = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner' || id = @request.auth.id"
  users.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  users.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner' || id = @request.auth.id"
  users.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(users)

  // ── 2. Courses: owner full CRUD ──────────────────────────────────────────
  const courses = app.findCollectionByNameOrId("courses")
  courses.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  courses.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  courses.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(courses)

  // ── 3. Enrollments: owner full CRUD ─────────────────────────────────────
  const enrollments = app.findCollectionByNameOrId("enrollments")
  enrollments.listRule   = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  enrollments.viewRule   = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  enrollments.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  enrollments.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  enrollments.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(enrollments)

  // ── 4. Announcements: owner full CRUD ───────────────────────────────────
  const ann = app.findCollectionByNameOrId("announcements")
  ann.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  ann.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  ann.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(ann)

  // ── 5. Parent-student links: owner full CRUD ─────────────────────────────
  const psl = app.findCollectionByNameOrId("parent_student_links")
  psl.listRule   = "@request.auth.id != '' && (parent = @request.auth.id || student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner')"
  psl.viewRule   = "@request.auth.id != '' && (parent = @request.auth.id || student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner')"
  psl.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  psl.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  psl.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(psl)

  // ── 6. Teacher-course assignments: owner full CRUD ───────────────────────
  const tca = app.findCollectionByNameOrId("teacher_course_assignments")
  tca.listRule   = "@request.auth.id != '' && (teacher = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner')"
  tca.viewRule   = "@request.auth.id != '' && (teacher = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner')"
  tca.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  tca.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  tca.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(tca)

  // ── 7. Attendance: owner can view all ────────────────────────────────────
  const att = app.findCollectionByNameOrId("attendance")
  att.listRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  att.viewRule = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
  app.save(att)

  // ── 8. Create site_settings collection ──────────────────────────────────
  const settings = new Collection({
    name: "site_settings",
    type: "base",
    listRule:   "",
    viewRule:   "",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'owner'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'owner'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text",  name: "school_name",    required: true, max: 200 },
      { type: "text",  name: "tagline",         max: 300 },
      { type: "text",  name: "phone",           max: 50  },
      { type: "email", name: "email" },
      { type: "text",  name: "whatsapp",        max: 50  },
      { type: "text",  name: "line_id",         max: 100 },
      { type: "text",  name: "address",         max: 500 },
      { type: "url",   name: "facebook_url"  },
      { type: "url",   name: "instagram_url" },
      { type: "url",   name: "google_maps_url" },
      { type: "text",  name: "working_hours",   max: 200 },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(settings)

  // Seed default settings
  const sr = new Record(settings)
  sr.set("school_name",    "IGK Learning Centre")
  sr.set("tagline",        "Honored to be Part of Your Learning Journey")
  sr.set("phone",          "+66 (0) 55 531 188")
  sr.set("email",          "info@igklearningcentre.org")
  sr.set("address",        "Maesod, Thailand")
  sr.set("working_hours",  "Monday – Friday: 8:00 AM – 5:00 PM")
  app.save(sr)

}, (app) => {
  try { const c = app.findCollectionByNameOrId("site_settings"); app.delete(c) } catch {}

  try {
    const users = app.findCollectionByNameOrId("users")
    users.listRule   = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || id = @request.auth.id"
    users.viewRule   = "@request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || id = @request.auth.id"
    users.createRule = "@request.auth.role = 'admin'"
    users.updateRule = "@request.auth.role = 'admin' || id = @request.auth.id"
    users.deleteRule = "@request.auth.role = 'admin'"
    app.save(users)
  } catch {}

  try {
    const courses = app.findCollectionByNameOrId("courses")
    courses.createRule = "@request.auth.role = 'admin'"
    courses.updateRule = "@request.auth.role = 'admin'"
    courses.deleteRule = "@request.auth.role = 'admin'"
    app.save(courses)
  } catch {}

  try {
    const enrollments = app.findCollectionByNameOrId("enrollments")
    enrollments.listRule   = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
    enrollments.viewRule   = "@request.auth.id != '' && (student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || (@request.auth.role = 'teacher' && course.id ?= @collection.teacher_course_assignments.course.id && @collection.teacher_course_assignments.teacher.id ?= @request.auth.id))"
    enrollments.createRule = "@request.auth.role = 'admin'"
    enrollments.updateRule = "@request.auth.role = 'admin'"
    enrollments.deleteRule = "@request.auth.role = 'admin'"
    app.save(enrollments)
  } catch {}

  try {
    const ann = app.findCollectionByNameOrId("announcements")
    ann.createRule = "@request.auth.role = 'admin'"
    ann.updateRule = "@request.auth.role = 'admin'"
    ann.deleteRule = "@request.auth.role = 'admin'"
    app.save(ann)
  } catch {}
})
