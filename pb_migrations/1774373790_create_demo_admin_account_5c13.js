migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  
  const demo = new Record(users)
  demo.set("email", "demo@igklc.org")
  demo.set("name", "Demo Administrator")
  demo.set("role", "admin")
  demo.set("emailVisibility", true)
  demo.setPassword("Demo@IGK2024")
  app.save(demo)
}, (app) => {
  try {
    const demo = app.findAuthRecordByEmail("users", "demo@igklc.org")
    app.delete(demo)
  } catch {}
})