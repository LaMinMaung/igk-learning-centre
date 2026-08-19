migrate((app) => {
  const allUsers = app.findRecordsByFilter(
    "users",
    "email != 'academic@igklc.org'",
    "",
    0,
    0,
    {}
  )

  console.log(`Deleting ${allUsers.length} users...`)

  for (const user of allUsers) {
    console.log(`Deleting user: ${user.get("email")}`)
    app.delete(user)
  }

  console.log("Done. Only academic@igklc.org remains.")
}, (app) => {
  // No rollback — deleted data cannot be restored
})