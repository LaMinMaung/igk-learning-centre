migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  
  // Create admin user
  const admin = new Record(users)
  admin.set("email", "admin@igklearningcentre.org")
  admin.set("name", "System Administrator")
  admin.set("role", "admin")
  admin.set("emailVisibility", true)
  admin.setPassword("Admin@IGK2024")
  app.save(admin)
  
}, (app) => {
  try {
    const admin = app.findAuthRecordByEmail("users", "admin@igklearningcentre.org")
    app.delete(admin)
  } catch {}
})