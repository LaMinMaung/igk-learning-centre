migrate((app) => {
  const admins = app.findCollectionByNameOrId("_superusers")
  
  const existingAdmins = app.findRecordsByFilter(
    "_superusers",
    "email = 'support@igklearningcentre.org'",
    "",
    1,
    0,
    {}
  )
  
  if (existingAdmins.length > 0) {
    const admin = existingAdmins[0]
    admin.set("email", "support@igklearningcentre.com")
    app.save(admin)
  }
}, (app) => {
  const admins = app.findRecordsByFilter(
    "_superusers",
    "email = 'support@igklearningcentre.com'",
    "",
    1,
    0,
    {}
  )
  
  if (admins.length > 0) {
    const admin = admins[0]
    admin.set("email", "support@igklearningcentre.org")
    app.save(admin)
  }
})