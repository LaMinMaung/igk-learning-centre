migrate((app) => {
  const admins = app.findCollectionByNameOrId("_superusers")
  
  const existingAdmins = app.findRecordsByFilter(
    "_superusers",
    "emailVisibility = true",
    "",
    1,
    0,
    {}
  )
  
  if (existingAdmins.length > 0) {
    const admin = existingAdmins[0]
    admin.set("email", "info@igklearningcentre.org")
    app.save(admin)
  } else {
    const admin = new Record(admins)
    admin.set("email", "info@igklearningcentre.org")
    admin.set("emailVisibility", true)
    admin.setRandomPassword()
    app.save(admin)
  }
}, (app) => {
  const admins = app.findRecordsByFilter(
    "_superusers",
    "email = 'info@igklearningcentre.org'",
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