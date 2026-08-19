migrate((app) => {
  const usersId = app.findCollectionByNameOrId("users").id;

  const results = new Collection({
    name: "ged_test_results",
    type: "base",
    listRule: "student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'owner'",
    viewRule: "student = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'owner'",
    createRule: "@request.auth.id != '' && @request.body.student = @request.auth.id",
    updateRule: null,
    deleteRule: "@request.auth.role = 'admin' || @request.auth.role = 'owner'",
  });

  results.fields.add(
    new RelationField({ name: "student", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: true }),
    new SelectField({ name: "subject", required: true, values: ["rla", "math", "science", "social_studies", "full_exam"], maxSelect: 1 }),
    new NumberField({ name: "correct_count", required: true, min: 0 }),
    new NumberField({ name: "total_questions", required: true, min: 1 }),
    new NumberField({ name: "percentage", min: 0, max: 100 }),
    new NumberField({ name: "time_taken_seconds", min: 0 }),
    new BoolField({ name: "passed" }),
    new JSONField({ name: "details_json" }),
    new AutodateField({ name: "created", onCreate: true, onUpdate: false }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );

  app.save(results);
}, (app) => {
  const c = app.findCollectionByNameOrId("ged_test_results");
  app.delete(c);
});
