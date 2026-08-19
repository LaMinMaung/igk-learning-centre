migrate((app) => {

  // ── 1. Add "owner" to the users role field ──────────────────────────────
  const users = app.findCollectionByNameOrId("users")
  const roleField = users.fields.getByName("role")
  roleField.values = ["admin", "teacher", "student", "parent", "owner"]
  app.save(users)

  // ── 2. Grant owner access to site_content ───────────────────────────────
  const siteContent = app.findCollectionByNameOrId("site_content")
  siteContent.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  siteContent.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  siteContent.deleteRule = "@request.auth.role = 'admin'"
  app.save(siteContent)

  // ── 3. Grant owner access to site_media ─────────────────────────────────
  const siteMedia = app.findCollectionByNameOrId("site_media")
  siteMedia.createRule  = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  siteMedia.updateRule  = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  siteMedia.deleteRule  = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  app.save(siteMedia)

  // ── 4. Grant owner access to programs (view drafts + edit, not delete) ──
  const programs = app.findCollectionByNameOrId("programs")
  programs.listRule   = "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner'"
  programs.viewRule   = "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin' || @request.auth.role = 'owner'"
  programs.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  programs.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'owner'"
  programs.deleteRule = "@request.auth.role = 'admin'"
  app.save(programs)

  // ── 5. Create the owner account ─────────────────────────────────────────
  const usersCol = app.findCollectionByNameOrId("users")
  const owner = new Record(usersCol)
  owner.set("email",            "owner@igklearningcentre.org")
  owner.set("name",             "Site Owner")
  owner.set("role",             "owner")
  owner.set("emailVisibility",  true)
  owner.setPassword("IGKOwner@2024")
  app.save(owner)

}, (app) => {

  // ── Rollback owner account ───────────────────────────────────────────────
  try {
    const owner = app.findAuthRecordByEmail("users", "owner@igklearningcentre.org")
    app.delete(owner)
  } catch {}

  // ── Rollback role field ──────────────────────────────────────────────────
  try {
    const users = app.findCollectionByNameOrId("users")
    const roleField = users.fields.getByName("role")
    roleField.values = ["admin", "teacher", "student", "parent"]
    app.save(users)
  } catch {}

  // ── Rollback site_content rules ──────────────────────────────────────────
  try {
    const sc = app.findCollectionByNameOrId("site_content")
    sc.createRule = "@request.auth.role = 'admin'"
    sc.updateRule = "@request.auth.role = 'admin'"
    sc.deleteRule = "@request.auth.role = 'admin'"
    app.save(sc)
  } catch {}

  // ── Rollback site_media rules ────────────────────────────────────────────
  try {
    const sm = app.findCollectionByNameOrId("site_media")
    sm.createRule = "@request.auth.role = 'admin'"
    sm.updateRule = "@request.auth.role = 'admin'"
    sm.deleteRule = "@request.auth.role = 'admin'"
    app.save(sm)
  } catch {}

  // ── Rollback programs rules ──────────────────────────────────────────────
  try {
    const p = app.findCollectionByNameOrId("programs")
    p.listRule   = "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin'"
    p.viewRule   = "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin'"
    p.createRule = "@request.auth.role = 'admin'"
    p.updateRule = "@request.auth.role = 'admin'"
    p.deleteRule = "@request.auth.role = 'admin'"
    app.save(p)
  } catch {}

})
