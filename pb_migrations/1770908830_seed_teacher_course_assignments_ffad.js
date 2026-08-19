migrate((app) => {
  // Get Sarah Johnson (first teacher)
  const teachers = app.findRecordsByFilter(
    "users",
    "role = 'teacher' && email = 'sarah.johnson@igklc.org'",
    "",
    1,
    0,
    {}
  )
  
  if (teachers.length === 0) return
  
  const teacherId = teachers[0].id
  
  // Get all courses (for demo, assign first teacher to all courses)
  const courses = app.findRecordsByFilter("courses", "", "", 10, 0, {})
  
  const assignments = app.findCollectionByNameOrId("teacher_course_assignments")
  
  for (const course of courses) {
    // Check if assignment already exists
    const existing = app.findRecordsByFilter(
      "teacher_course_assignments",
      "teacher = {:t} && course = {:c}",
      "",
      1,
      0,
      { t: teacherId, c: course.id }
    )
    
    if (existing.length === 0) {
      const assignment = new Record(assignments)
      assignment.set("teacher", teacherId)
      assignment.set("course", course.id)
      app.save(assignment)
    }
  }
}, (app) => {
  // Remove all assignments for demo teacher
  const teachers = app.findRecordsByFilter(
    "users",
    "email = 'sarah.johnson@igklc.org'",
    "",
    1,
    0,
    {}
  )
  
  if (teachers.length === 0) return
  
  const assignments = app.findRecordsByFilter(
    "teacher_course_assignments",
    "teacher = {:id}",
    "",
    0,
    0,
    { id: teachers[0].id }
  )
  
  for (const assignment of assignments) {
    app.delete(assignment)
  }
})