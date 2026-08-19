migrate((app) => {
  // 1. PROGRAMS COLLECTION - Fully manageable program cards
  const programs = new Collection({
    name: "programs",
    type: "base",
    listRule: "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin'",
    viewRule: "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'demo_admin'",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "title", required: true, max: 200 },
      { type: "editor", name: "description", required: true },
      { type: "text", name: "duration", required: true, max: 100 },
      { type: "text", name: "level", required: true, max: 100 },
      { type: "select", name: "icon", required: true, values: ["BookOpen", "GraduationCap", "Award", "Calculator", "Languages", "Globe"], maxSelect: 1 },
      { type: "json", name: "features", required: true },
      { type: "text", name: "route", required: true, max: 100 },
      { type: "select", name: "status", required: true, values: ["draft", "published"], maxSelect: 1 },
      { type: "number", name: "order", min: 0 },
      { type: "autodate", name: "created", onCreate: true },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(programs)

  // Seed existing programs
  const programsData = [
    {
      title: "Montessori Pre-School",
      description: "Nurturing young minds through the Montessori method, fostering independence, creativity, and a love for learning from nursery to kindergarten.",
      duration: "Full Academic Year",
      level: "Nursery - Kindergarten",
      icon: "BookOpen",
      features: ["Child-Centered Learning", "Hands-On Activities", "Social Development", "Creative Expression"],
      route: "/programs/montessori",
      status: "published",
      order: 1
    },
    {
      title: "Cambridge International Curriculum",
      description: "Comprehensive Cambridge (UK) International Curriculum preparing students for global academic success from Year 1 to Year 9.",
      duration: "Year 1 to Year 9",
      level: "Primary & Secondary",
      icon: "GraduationCap",
      features: ["UK Curriculum", "International Standards", "Critical Thinking", "Holistic Development"],
      route: "/programs/cambridge",
      status: "published",
      order: 2
    },
    {
      title: "Test Preparation Programs",
      description: "Expert preparation for IGCSE, GED, Pre-GED, SAT, and TOEFL with proven strategies and comprehensive study materials.",
      duration: "8-16 weeks",
      level: "Secondary & High School",
      icon: "Award",
      features: ["IGCSE Preparation", "GED & Pre-GED", "SAT Preparation", "TOEFL Training"],
      route: "/programs/test-prep",
      status: "published",
      order: 3
    },
    {
      title: "Singapore Math",
      description: "World-renowned Singapore Math program using the Concrete-Pictorial-Abstract approach to build strong mathematical foundations.",
      duration: "Weekend Program",
      level: "All Levels",
      icon: "Calculator",
      features: ["CPA Method", "Problem-Solving Focus", "Mental Math", "Visual Learning"],
      route: "/programs/singapore-math",
      status: "published",
      order: 4
    },
    {
      title: "Young Learners English (YLE)",
      description: "Cambridge Young Learners English program building language foundations through Starters, Movers, and Flyers levels.",
      duration: "Weekend Program",
      level: "Ages 7-12",
      icon: "Award",
      features: ["Cambridge YLE Exams", "Starters/Movers/Flyers", "All 4 Skills", "International Certification"],
      route: "/programs/singapore-math",
      status: "published",
      order: 5
    },
    {
      title: "Language Programs",
      description: "Comprehensive language instruction in Thai, Chinese, and other languages with qualified instructors.",
      duration: "Flexible",
      level: "All Ages",
      icon: "Globe",
      features: ["Thai Language", "Chinese (Mandarin)", "Other Languages", "Qualified Instructors"],
      route: "/programs/languages",
      status: "published",
      order: 6
    }
  ]

  for (const p of programsData) {
    const record = new Record(programs)
    record.set("title", p.title)
    record.set("description", p.description)
    record.set("duration", p.duration)
    record.set("level", p.level)
    record.set("icon", p.icon)
    record.set("features", p.features)
    record.set("route", p.route)
    record.set("status", p.status)
    record.set("order", p.order)
    app.save(record)
  }

  // 2. SITE CONTENT COLLECTION - Editable text blocks
  const siteContent = new Collection({
    name: "site_content",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "key", required: true, max: 100 },
      { type: "editor", name: "value", required: true },
      { type: "text", name: "section", required: true, max: 50 },
      { type: "text", name: "description", max: 200 },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  })
  app.save(siteContent)

  // Seed content blocks
  const contentData = [
    { key: "hero_subtitle", value: "Leading International School In Maesod", section: "hero", description: "Hero section subtitle" },
    { key: "hero_title", value: "Honored to be Part of Your Learning Journey", section: "hero", description: "Hero main heading" },
    { key: "hero_description", value: "From Montessori to Cambridge International Curriculum, test preparation to language programs - IGK Learning Centre provides comprehensive education for all ages.", section: "hero", description: "Hero description text" },
    { key: "programs_heading", value: "Our Educational Programs", section: "programs", description: "Programs section heading" },
    { key: "programs_subheading", value: "Comprehensive learning opportunities from early childhood through test preparation and beyond.", section: "programs", description: "Programs section subheading" },
    { key: "extracurriculars_heading", value: "Extracurricular Programs", section: "extracurriculars", description: "Extracurriculars heading" },
    { key: "extracurriculars_description", value: "Once you join any program, you will automatically gain access to our comprehensive extracurricular activities - providing strong evidence of well-rounded development for university applications.", section: "extracurriculars", description: "Extracurriculars description" },
    { key: "about_heading", value: "Why Choose IGK Learning Centre?", section: "about", description: "About section heading" },
    { key: "about_description", value: "We provide a nurturing environment that combines international standards with personalized attention, helping students achieve their full potential from early childhood through advanced test preparation.", section: "about", description: "About description" },
    { key: "contact_heading", value: "Get in Touch", section: "contact", description: "Contact section heading" },
    { key: "contact_subheading", value: "Have questions about our programs? We'd love to hear from you.", section: "contact", description: "Contact subheading" },
    { key: "footer_tagline", value: "Honored to be a part of the children's learning journey.", section: "footer", description: "Footer tagline" }
  ]

  for (const c of contentData) {
    const record = new Record(siteContent)
    record.set("key", c.key)
    record.set("value", c.value)
    record.set("section", c.section)
    record.set("description", c.description)
    app.save(record)
  }

  // 3. SITE MEDIA COLLECTION - Uploadable images
  const siteMedia = new Collection({
    name: "site_media",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text", name: "name", required: true, max: 100 },
      { type: "file", name: "image", required: true, maxSelect: 1, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
      { type: "text", name: "alt_text", max: 200 },
      { type: "text", name: "usage_key", required: true, max: 100 },
      { type: "autodate", name: "created", onCreate: true }
    ]
  })
  app.save(siteMedia)

}, (app) => {
  const collections = ["site_media", "site_content", "programs"]
  for (const name of collections) {
    try {
      const c = app.findCollectionByNameOrId(name)
      app.delete(c)
    } catch {}
  }
})
