migrate((app) => {
  const admins = app.findCollectionByNameOrId("_superusers")
  
  // Try to find first superuser with emailVisibility = 1
  const existingAdmins = app.findRecordsByFilter(
    "_superusers",
    "emailVisibility = true",
    "",
    1,
    0,
    {}
  )
  
  if (existingAdmins.length > 0) {
    // Update existing superuser's email
    const admin = existingAdmins[0]
    admin.set("email", "support@igklearningcentre.org")
    app.save(admin)
  } else {
    // Create new superuser if none exists
    const admin = new Record(admins)
    admin.set("email", "support@igklearningcentre.org")
    admin.set("emailVisibility", true)
    admin.setRandomPassword()
    app.save(admin)
  }
}, (app) => {
  // Rollback: restore to .com (if you need to revert)
  const admins = app.findRecordsByFilter(
    "_superusers",
    "email = 'support@igklearningcentre.org'",
    "",
    1,
    0,
    {}
  )
  
  if (admins.length > 0) {
    const admin = admins[0]
    admin.set("email", "support@igklearningcentre.com")
    app.save(admin)
  }
})