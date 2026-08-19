migrate((app) => {
  // Find existing admin
  const existingAdmins = app.findRecordsByFilter(
    "users",
    "email = 'admin@igklearningcentre.org'",
    "",
    1,
    0,
    {}
  )
  
  if (existingAdmins.length > 0) {
    // Update existing admin
    const admin = existingAdmins[0]
    admin.set("email", "academic@igklc.org")
    admin.set("name", "Academic Director")
    admin.setPassword("sayakyaw12348765")
    app.save(admin)
  } else {
    // Create new admin if doesn't exist
    const users = app.findCollectionByNameOrId("users")
    const admin = new Record(users)
    admin.set("email", "academic@igklc.org")
    admin.set("name", "Academic Director")
    admin.set("role", "admin")
    admin.set("emailVisibility", true)
    admin.setPassword("sayakyaw12348765")
    app.save(admin)
  }
}, (app) => {
  // Rollback to original admin
  const admins = app.findRecordsByFilter(
    "users",
    "email = 'academic@igklc.org'",
    "",
    1,
    0,
    {}
  )
  
  if (admins.length > 0) {
    const admin = admins[0]
    admin.set("email", "admin@igklearningcentre.org")
    admin.set("name", "System Administrator")
    admin.setPassword("Admin@IGK2024")
    app.save(admin)
  }
})