migrate((app) => {

  // ── 1. Update owner account: .org → .com ────────────────────────────────
  try {
    const owner = app.findAuthRecordByEmail("users", "owner@igklearningcentre.org")
    owner.set("email", "owner@igklearningcentre.com")
    app.save(owner)
  } catch {}

  // ── 2. Update LMS admin account: .org → .com ────────────────────────────
  try {
    const admin = app.findAuthRecordByEmail("users", "academic@igklc.org")
    admin.set("email", "academic@igklc.com")
    app.save(admin)
  } catch {}

  // ── 3. Update demo admin account: .org → .com ───────────────────────────
  try {
    const demo = app.findAuthRecordByEmail("users", "demo@igklc.org")
    demo.set("email", "demo@igklc.com")
    app.save(demo)
  } catch {}

  // ── 4. Update site_settings contact email ───────────────────────────────
  try {
    const settings = app.findRecordsByFilter("site_settings", "email = 'info@igklearningcentre.org'", "", 1, 0, {})
    for (const s of settings) {
      s.set("email", "info@igklearningcentre.com")
      app.save(s)
    }
  } catch {}

  // ── 5. Update PocketBase superuser email ────────────────────────────────
  try {
    const superuser = app.findAuthRecordByEmail("_superusers", "info@igklearningcentre.org")
    superuser.set("email", "info@igklearningcentre.com")
    app.save(superuser)
  } catch {}

}, (app) => {

  // ── Rollback: .com → .org ───────────────────────────────────────────────
  try {
    const owner = app.findAuthRecordByEmail("users", "owner@igklearningcentre.com")
    owner.set("email", "owner@igklearningcentre.org")
    app.save(owner)
  } catch {}

  try {
    const admin = app.findAuthRecordByEmail("users", "academic@igklc.com")
    admin.set("email", "academic@igklc.org")
    app.save(admin)
  } catch {}

  try {
    const demo = app.findAuthRecordByEmail("users", "demo@igklc.com")
    demo.set("email", "demo@igklc.org")
    app.save(demo)
  } catch {}

  try {
    const settings = app.findRecordsByFilter("site_settings", "email = 'info@igklearningcentre.com'", "", 1, 0, {})
    for (const s of settings) {
      s.set("email", "info@igklearningcentre.org")
      app.save(s)
    }
  } catch {}

  try {
    const superuser = app.findAuthRecordByEmail("_superusers", "info@igklearningcentre.com")
    superuser.set("email", "info@igklearningcentre.org")
    app.save(superuser)
  } catch {}

})
