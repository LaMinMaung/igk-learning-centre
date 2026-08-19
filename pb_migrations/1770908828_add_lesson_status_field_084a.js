migrate((app) => {
  const lessons = app.findCollectionByNameOrId("lessons")
  
  // Add status field to lessons
  lessons.fields.add(new SelectField({
    name: "status",
    required: true,
    values: ["draft", "published"],
    maxSelect: 1
  }))
  
  app.save(lessons)
  
  // Set all existing lessons to published
  const existingLessons = app.findRecordsByFilter("lessons", "", "", 0, 0, {})
  for (const lesson of existingLessons) {
    lesson.set("status", "published")
    app.save(lesson)
  }
}, (app) => {
  const lessons = app.findCollectionByNameOrId("lessons")
  lessons.fields.removeByName("status")
  app.save(lessons)
})