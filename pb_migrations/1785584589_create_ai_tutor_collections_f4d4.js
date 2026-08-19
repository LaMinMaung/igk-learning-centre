migrate((app) => {
  const usersId = app.findCollectionByNameOrId("users").id;

  // ── ai_conversations ──────────────────────────────────────────────────────
  const convs = new Collection({
    name: "ai_conversations",
    type: "base",
    listRule: "student = @request.auth.id",
    viewRule: "student = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.student = @request.auth.id",
    updateRule: "student = @request.auth.id",
    deleteRule: "student = @request.auth.id",
  });

  convs.fields.add(
    new RelationField({ name: "student", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: true }),
    new SelectField({ name: "subject", required: true, values: ["rla", "math", "science", "social_studies", "general"], maxSelect: 1 }),
    new TextField({ name: "title", required: true, max: 200 }),
    new SelectField({ name: "language", values: ["auto", "en", "my"], maxSelect: 1 }),
    new AutodateField({ name: "created", onCreate: true, onUpdate: false }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );
  app.save(convs);

  // ── ai_messages ───────────────────────────────────────────────────────────
  const convsId = app.findCollectionByNameOrId("ai_conversations").id;

  const msgs = new Collection({
    name: "ai_messages",
    type: "base",
    listRule: "conversation.student = @request.auth.id",
    viewRule: "conversation.student = @request.auth.id",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  msgs.fields.add(
    new RelationField({ name: "conversation", required: true, collectionId: convsId, maxSelect: 1, cascadeDelete: true }),
    new SelectField({ name: "role", required: true, values: ["user", "assistant"], maxSelect: 1 }),
    new TextField({ name: "content", required: true, max: 50000 }),
    new AutodateField({ name: "created", onCreate: true, onUpdate: false }),
  );
  app.save(msgs);

}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("ai_messages")); } catch (_) {}
  try { app.delete(app.findCollectionByNameOrId("ai_conversations")); } catch (_) {}
});
