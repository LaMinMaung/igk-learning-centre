migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  
  // Create 3 Teachers
  const teachers = [
    { name: "Teacher Sarah Johnson", email: "sarah.johnson@igklc.org", phone: "082-111-1111" },
    { name: "Teacher Michael Chen", email: "michael.chen@igklc.org", phone: "082-111-1112" },
    { name: "Teacher Emily Rodriguez", email: "emily.rodriguez@igklc.org", phone: "082-111-1113" }
  ]
  
  for (const teacher of teachers) {
    const record = new Record(users)
    record.set("name", teacher.name)
    record.set("email", teacher.email)
    record.set("phone", teacher.phone)
    record.set("role", "teacher")
    record.set("emailVisibility", true)
    record.setPassword("Teacher@123")
    app.save(record)
  }
  
  // Create 5 Students
  const students = [
    { name: "Student Alice Wong", email: "alice.wong@student.igklc.org", phone: "082-222-2221" },
    { name: "Student Bob Martinez", email: "bob.martinez@student.igklc.org", phone: "082-222-2222" },
    { name: "Student Charlie Kim", email: "charlie.kim@student.igklc.org", phone: "082-222-2223" },
    { name: "Student Diana Patel", email: "diana.patel@student.igklc.org", phone: "082-222-2224" },
    { name: "Student Ethan Brown", email: "ethan.brown@student.igklc.org", phone: "082-222-2225" }
  ]
  
  const studentIds = []
  for (const student of students) {
    const record = new Record(users)
    record.set("name", student.name)
    record.set("email", student.email)
    record.set("phone", student.phone)
    record.set("role", "student")
    record.set("emailVisibility", true)
    record.setPassword("Student@123")
    app.save(record)
    studentIds.push(record.id)
  }
  
  // Create 3 Parents
  const parents = [
    { name: "Parent Jennifer Wong", email: "jennifer.wong@parent.igklc.org", phone: "082-333-3331" },
    { name: "Parent David Martinez", email: "david.martinez@parent.igklc.org", phone: "082-333-3332" },
    { name: "Parent Lisa Kim", email: "lisa.kim@parent.igklc.org", phone: "082-333-3333" }
  ]
  
  const parentIds = []
  for (const parent of parents) {
    const record = new Record(users)
    record.set("name", parent.name)
    record.set("email", parent.email)
    record.set("phone", parent.phone)
    record.set("role", "parent")
    record.set("emailVisibility", true)
    record.setPassword("Parent@123")
    app.save(record)
    parentIds.push(record.id)
  }
  
  // Link Parents to Students
  const links = app.findCollectionByNameOrId("parent_student_links")
  
  // Parent 1 (Jennifer Wong) -> Student 1 (Alice Wong) - mother
  const link1 = new Record(links)
  link1.set("parent", parentIds[0])
  link1.set("student", studentIds[0])
  link1.set("relationship", "mother")
  app.save(link1)
  
  // Parent 2 (David Martinez) -> Student 2 (Bob Martinez) - father
  const link2 = new Record(links)
  link2.set("parent", parentIds[1])
  link2.set("student", studentIds[1])
  link2.set("relationship", "father")
  app.save(link2)
  
  // Parent 3 (Lisa Kim) -> Student 3 (Charlie Kim) - mother
  const link3 = new Record(links)
  link3.set("parent", parentIds[2])
  link3.set("student", studentIds[2])
  link3.set("relationship", "mother")
  app.save(link3)
  
  // Parent 3 (Lisa Kim) -> Student 4 (Diana Patel) - guardian (showing multiple children)
  const link4 = new Record(links)
  link4.set("parent", parentIds[2])
  link4.set("student", studentIds[3])
  link4.set("relationship", "guardian")
  app.save(link4)
  
}, (app) => {
  // Rollback: Delete all demo users and links
  const emails = [
    "sarah.johnson@igklc.org",
    "michael.chen@igklc.org",
    "emily.rodriguez@igklc.org",
    "alice.wong@student.igklc.org",
    "bob.martinez@student.igklc.org",
    "charlie.kim@student.igklc.org",
    "diana.patel@student.igklc.org",
    "ethan.brown@student.igklc.org",
    "jennifer.wong@parent.igklc.org",
    "david.martinez@parent.igklc.org",
    "lisa.kim@parent.igklc.org"
  ]
  
  for (const email of emails) {
    try {
      const user = app.findAuthRecordByEmail("users", email)
      app.delete(user)
    } catch {}
  }
})