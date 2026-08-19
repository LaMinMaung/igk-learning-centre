migrate((app) => {
  const usersId = app.findCollectionByNameOrId("users").id;

  // ── resources ─────────────────────────────────────────────────────────────
  const resources = new Collection({
    name: "resources",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin' || @request.auth.role = 'owner'",
    updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'owner'",
    deleteRule: "@request.auth.role = 'admin' || @request.auth.role = 'owner'",
  });

  resources.fields.add(
    new SelectField({ name: "subject", required: true, values: ["rla", "math", "science", "social_studies"], maxSelect: 1 }),
    new TextField({ name: "topic", required: true, max: 100 }),
    new SelectField({ name: "type", required: true, values: ["study_guide", "formula_sheet", "vocab_list", "breakdown"], maxSelect: 1 }),
    new TextField({ name: "title", required: true, max: 200 }),
    new TextField({ name: "content", max: 50000 }),
    new URLField({ name: "file_url" }),
    new AutodateField({ name: "created", onCreate: true, onUpdate: false }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );
  app.save(resources);

  // ── resource_bookmarks ────────────────────────────────────────────────────
  const resourcesId = app.findCollectionByNameOrId("resources").id;

  const bookmarks = new Collection({
    name: "resource_bookmarks",
    type: "base",
    listRule: "student = @request.auth.id",
    viewRule: "student = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.student = @request.auth.id",
    updateRule: null,
    deleteRule: "student = @request.auth.id",
  });

  bookmarks.fields.add(
    new RelationField({ name: "student", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: true }),
    new RelationField({ name: "resource", required: true, collectionId: resourcesId, maxSelect: 1, cascadeDelete: true }),
    new AutodateField({ name: "created", onCreate: true, onUpdate: false }),
  );
  app.save(bookmarks);

  // ── Seed resources ─────────────────────────────────────────────────────────
  var col = app.findCollectionByNameOrId("resources");

  var seeds = [
    // RLA
    {
      subject: "rla", topic: "Reading Comprehension", type: "study_guide",
      title: "Reading Comprehension Strategies",
      content: "# Reading Comprehension Strategies\n\nThe GED RLA section tests your ability to read, analyze, and evaluate passages. Master these strategies to maximize your score.\n\n## Strategy 1: Read the Questions First\n\nBefore reading the passage, scan all the questions. This tells you exactly what details to look for — saving you time.\n\n## Strategy 2: Find the Main Idea\n\n- The main idea is usually in the first or last paragraph\n- It must be broad enough to cover the **whole** passage\n- Ask yourself: *What is this passage mostly about?*\n\n## Strategy 3: Use Text Evidence\n\nEvery answer must be supported by the passage. Go back and find the exact sentence that proves your choice. Never answer from memory alone.\n\n## Strategy 4: Inference Questions\n\nInference questions ask what is implied, not directly stated.\n\n1. Find the relevant paragraph\n2. Combine text clues with logic\n3. Eliminate choices that contradict the text\n\n## Strategy 5: Vocabulary in Context\n\nFor an unknown word, read the full sentence around it. Look for context clues such as synonyms, examples, or contrasts nearby.\n\n## Author's Purpose\n\n| Purpose | Key Clues |\n|---------|----------|\n| Inform | Facts, neutral tone, definitions |\n| Persuade | Opinion words, emotional language, calls to action |\n| Entertain | Story structure, vivid description, narrative voice |\n\n## Common Mistakes\n\n- Answering from personal opinion instead of the text\n- Choosing extreme words like *always* or *never* — these are usually wrong\n- Confusing a supporting detail with the main idea\n\n## Daily Practice Habit\n\nRead one editorial or news article per day. After reading, write:\n1. The main idea in one sentence\n2. The author's purpose\n3. One inference the author expects you to draw"
    },
    {
      subject: "rla", topic: "Writing & Language", type: "formula_sheet",
      title: "Grammar Quick Reference",
      content: "# Grammar Quick Reference\n\n## Subject-Verb Agreement\n\n- Singular subject → singular verb: *The student **runs**.*\n- Plural subject → plural verb: *The students **run**.*\n- Subjects joined by **and** → plural verb\n- Subjects joined by **or / nor** → verb agrees with the closer subject\n- Collective nouns (team, class, group) → usually singular\n\n## Pronoun Rules\n\n- A pronoun must match its noun in number and gender\n- Indefinite pronouns (everyone, nobody, each) → singular\n- Correct: *Everyone must submit **their** assignment.*\n\n## Comma Rules\n\n1. Before FANBOYS (for, and, nor, but, or, yet, so) in compound sentences\n2. After introductory phrases: *After the test, she relaxed.*\n3. To separate items in a series: *reading, writing, and math*\n4. Around nonessential clauses: *My teacher, who is from Myanmar, explained it.*\n\n## Common Sentence Errors\n\n| Error | Incorrect | Correct |\n|-------|-----------|--------|\n| Run-on | *I studied I passed.* | *I studied, so I passed.* |\n| Fragment | *Because I studied.* | *I passed because I studied.* |\n| Misplaced modifier | *She almost drove her kids to school every day.* | *She drove her kids to school almost every day.* |\n\n## Apostrophes\n\n- **Possession (singular):** the student's book\n- **Possession (plural):** the students' books\n- **Contraction:** *It's* raining (= it is) vs. *Its* color (= belonging to it)\n\n## Transitional Words\n\n| Purpose | Words |\n|---------|-------|\n| Contrast | however, although, on the other hand |\n| Addition | furthermore, in addition, moreover |\n| Cause/Effect | therefore, as a result, consequently |\n| Example | for instance, for example, specifically |"
    },
    {
      subject: "rla", topic: "Writing & Language", type: "study_guide",
      title: "GED Extended Response Writing Guide",
      content: "# GED Extended Response Writing Guide\n\nYou have **45 minutes** to write a well-organized argument based on two reading passages.\n\n## The 5-Paragraph Structure\n\n### Paragraph 1: Introduction\n- State your position clearly in a **thesis statement**\n- Briefly preview your two or three supporting reasons\n- Example: *The author of Passage 1 presents a stronger argument because of clear evidence, logical structure, and emotional appeal.*\n\n### Paragraphs 2-3: Body\nEach body paragraph should follow this pattern:\n\n1. **Topic sentence** — state the point of this paragraph\n2. **Evidence** — quote or paraphrase from a passage\n3. **Explanation** — connect the evidence to your thesis\n4. **Transition** — lead into the next paragraph\n\n### Paragraph 4 (optional): Counter-Argument\n- Acknowledge the opposing view briefly\n- Then explain why your position is still stronger\n\n### Paragraph 5: Conclusion\n- Restate your thesis in different words\n- Summarize your two or three main points\n- End with a strong closing thought\n\n## Scoring Criteria\n\n| Area | What Graders Look For |\n|------|----------------------|\n| Analysis | Does your argument engage meaningfully with both passages? |\n| Development | Is each point supported with specific text evidence? |\n| Organization | Is the essay logically structured with clear transitions? |\n| Language Use | Is writing clear, varied, and grammatically sound? |\n\n## Time Management\n\n- **5 min** — Read both passages; plan your argument and outline\n- **35 min** — Write intro + 2-3 body paragraphs + conclusion\n- **5 min** — Proofread for grammar, spelling, punctuation\n\n## Key Do's and Don'ts\n\n**Do:** Cite specific evidence from the passages. Use transitional words. Vary your sentence structure.\n\n**Don't:** Share personal opinions without textual support. Summarize both passages without taking a position. Rush the conclusion."
    },
    {
      subject: "rla", topic: "Literary Analysis", type: "vocab_list",
      title: "Literary Terms Glossary",
      content: "# Literary Terms Glossary\n\n## Narrative Elements\n\n| Term | Definition |\n|------|------------|\n| **Plot** | The sequence of events in a story |\n| **Setting** | The time and place where the story occurs |\n| **Protagonist** | The main character |\n| **Antagonist** | The character or force opposing the protagonist |\n| **Conflict** | The central problem or struggle |\n| **Resolution** | How the conflict is resolved |\n| **Point of View** | The perspective from which the story is told |\n| **Narrator** | The voice telling the story |\n\n## Figurative Language\n\n| Term | Definition | Example |\n|------|------------|--------|\n| **Simile** | Comparison using *like* or *as* | *She ran like the wind.* |\n| **Metaphor** | Direct comparison without like/as | *Life is a journey.* |\n| **Personification** | Giving human traits to non-human things | *The wind whispered.* |\n| **Hyperbole** | Extreme exaggeration for effect | *I've told you a million times.* |\n| **Alliteration** | Repeating initial consonant sounds | *Peter Piper picked...* |\n| **Irony** | Saying the opposite of what is meant | |\n| **Symbolism** | An object that represents something larger | |\n| **Foreshadowing** | Hints about future events | |\n\n## Text Analysis Terms\n\n| Term | Definition |\n|------|------------|\n| **Theme** | The central message or lesson of the text |\n| **Tone** | The author's attitude toward the subject |\n| **Mood** | The feeling the text creates in the reader |\n| **Inference** | A conclusion drawn from evidence, not directly stated |\n| **Explicit** | Directly stated in the text |\n| **Implicit** | Implied but not directly stated |\n| **Claim** | The author's main argument or position |\n| **Evidence** | Facts, examples, or quotes that support a claim |"
    },

    // MATH
    {
      subject: "math", topic: "Algebra", type: "formula_sheet",
      title: "Algebra Formula Sheet",
      content: "# Algebra Formula Sheet\n\n## Linear Equations\n\n| Formula | Name |\n|---------|------|\n| y = mx + b | Slope-intercept form |\n| y - y1 = m(x - x1) | Point-slope form |\n| Ax + By = C | Standard form |\n| m = (y2 - y1) / (x2 - x1) | Slope formula |\n\n## Quadratic Formula\n\n**x = (-b ± sqrt(b^2 - 4ac)) / 2a**\n\nUsed for equations in the form **ax^2 + bx + c = 0**\n\n- If b^2 - 4ac > 0: two real solutions\n- If b^2 - 4ac = 0: one real solution\n- If b^2 - 4ac < 0: no real solutions\n\n## Exponent Rules\n\n| Rule | Formula |\n|------|---------|\n| Product | x^a times x^b = x^(a+b) |\n| Quotient | x^a / x^b = x^(a-b) |\n| Power of a power | (x^a)^b = x^(ab) |\n| Zero exponent | x^0 = 1 |\n| Negative exponent | x^(-a) = 1/x^a |\n\n## Factoring\n\n- **FOIL:** (a+b)(c+d) = ac + ad + bc + bd\n- **Difference of squares:** a^2 - b^2 = (a+b)(a-b)\n- **Perfect square:** (a+b)^2 = a^2 + 2ab + b^2\n\n## Inequalities\n\n- Flip the sign when multiplying or dividing by a **negative** number\n- Example: -2x > 6 becomes x < -3\n\n## Systems of Equations\n\n1. **Substitution** — solve one equation for a variable, substitute into the other\n2. **Elimination** — multiply equations to cancel one variable, then add\n3. **Graphing** — find the intersection point of two lines"
    },
    {
      subject: "math", topic: "Algebra", type: "study_guide",
      title: "Solving Linear Equations Step by Step",
      content: "# Solving Linear Equations Step by Step\n\nA linear equation has one or more variables, each with an exponent of 1. Your goal: get the variable alone on one side.\n\n## The Golden Rule\n\n**Whatever you do to one side, you MUST do to the other side.**\n\n## Basic Steps\n\n1. Distribute parentheses if present\n2. Combine like terms on each side\n3. Move all variable terms to one side\n4. Move all constant terms to the other side\n5. Divide both sides by the coefficient of the variable\n6. Check your answer by substituting back\n\n## Worked Example 1\n\n**Solve: 3x + 5 = 20**\n\n- Subtract 5 from both sides: 3x = 15\n- Divide both sides by 3: **x = 5**\n- Check: 3(5) + 5 = 15 + 5 = 20 ✓\n\n## Worked Example 2\n\n**Solve: 2(x - 3) = 4x + 2**\n\n- Distribute: 2x - 6 = 4x + 2\n- Subtract 4x from both sides: -2x - 6 = 2\n- Add 6 to both sides: -2x = 8\n- Divide by -2: **x = -4**\n- Check: 2(-4-3) = 2(-7) = -14 and 4(-4)+2 = -16+2 = -14 ✓\n\n## Common Mistakes\n\n| Mistake | Wrong | Right |\n|---------|-------|-------|\n| Forgetting to distribute | 2(x+3) = 2x+3 | 2(x+3) = 2x+6 |\n| Sign error when moving terms | -2x = 8, so x = 4 | -2x = 8, so x = -4 |\n| Not checking the answer | Skip check | Always verify |\n\n## Solving Inequalities\n\nSame steps as equations, except:\n- When you multiply or divide by a **negative number**, flip the inequality sign\n- Example: -3x < 9 → x > -3"
    },
    {
      subject: "math", topic: "Geometry", type: "formula_sheet",
      title: "Geometry Formulas Reference",
      content: "# Geometry Formulas Reference\n\n## Area Formulas\n\n| Shape | Formula |\n|-------|---------|\n| Square | A = s^2 |\n| Rectangle | A = l x w |\n| Triangle | A = (1/2) x b x h |\n| Circle | A = pi x r^2 |\n| Parallelogram | A = b x h |\n| Trapezoid | A = (1/2) x (b1 + b2) x h |\n\n## Perimeter and Circumference\n\n| Shape | Formula |\n|-------|---------|\n| Square | P = 4s |\n| Rectangle | P = 2l + 2w |\n| Triangle | P = a + b + c |\n| Circle | C = 2 x pi x r (or pi x d) |\n\n## Volume\n\n| Solid | Formula |\n|-------|---------|\n| Rectangular prism | V = l x w x h |\n| Cylinder | V = pi x r^2 x h |\n| Cone | V = (1/3) x pi x r^2 x h |\n| Sphere | V = (4/3) x pi x r^3 |\n| Pyramid | V = (1/3) x B x h |\n\n## Pythagorean Theorem\n\n**a^2 + b^2 = c^2**\n\n- c = hypotenuse (opposite the right angle)\n- a, b = the two legs\n\n## Special Right Triangles\n\n- **30-60-90:** sides in ratio 1 : sqrt(3) : 2\n- **45-45-90:** sides in ratio 1 : 1 : sqrt(2)\n\n## Angle Rules\n\n- Straight line = 180 degrees\n- Full rotation = 360 degrees\n- Triangle interior angles sum = 180 degrees\n- Vertical angles are equal\n- Supplementary angles sum to 180 degrees\n- Complementary angles sum to 90 degrees\n\n## Coordinate Geometry\n\n- **Distance:** d = sqrt((x2-x1)^2 + (y2-y1)^2)\n- **Midpoint:** M = ((x1+x2)/2, (y1+y2)/2)"
    },
    {
      subject: "math", topic: "Data Analysis", type: "study_guide",
      title: "Reading Charts, Graphs & Statistics",
      content: "# Reading Charts, Graphs & Statistics\n\nThe GED Math section often uses tables, charts, and graphs. You must read them accurately and draw correct conclusions.\n\n## Types of Graphs\n\n### Bar Graph\n- Compares quantities across categories\n- Read bar height against the y-axis scale\n- Always check whether the scale starts at 0\n\n### Line Graph\n- Shows change over time\n- Look for trends (rising, falling, stable)\n- Steeper slope = faster rate of change\n\n### Pie Chart\n- Shows parts of a whole (adds to 100%)\n- Each slice represents a percentage or fraction\n\n### Scatterplot\n- Shows the relationship between two variables\n- **Positive correlation:** as x rises, y rises\n- **Negative correlation:** as x rises, y falls\n- **No correlation:** data points scatter randomly\n\n## Statistical Measures\n\n| Measure | How to Calculate |\n|---------|------------------|\n| **Mean** | Sum of all values divided by the count |\n| **Median** | Middle value when sorted in order |\n| **Mode** | Most frequently occurring value |\n| **Range** | Highest value minus lowest value |\n\n## Probability\n\n**P(event) = favorable outcomes / total possible outcomes**\n\n- Probability ranges from 0 (impossible) to 1 (certain)\n- P(A and B) = P(A) x P(B) for independent events\n- Percent chance = probability x 100\n\n## Tips for Data Questions\n\n1. Read the title and all axis labels before looking at the data\n2. Check the scale and units carefully\n3. For percent change: (new - old) / old x 100\n4. Identify exactly what the question is asking before reading the graph"
    },

    // SCIENCE
    {
      subject: "science", topic: "Life Science", type: "study_guide",
      title: "Cell Biology Fundamentals",
      content: "# Cell Biology Fundamentals\n\nAll living things are made of cells. Understanding cell structure and function is foundational for GED Science.\n\n## Two Types of Cells\n\n### Prokaryotic Cells\n- **No nucleus** — DNA floats free in the cytoplasm\n- Smaller and simpler in structure\n- Found in bacteria and archaea\n\n### Eukaryotic Cells\n- **Have a nucleus** — DNA is enclosed inside\n- Larger and more complex\n- Found in animals, plants, and fungi\n\n## Key Organelles\n\n| Organelle | Function |\n|-----------|----------|\n| Nucleus | Control center; contains DNA |\n| Cell membrane | Controls what enters and leaves |\n| Mitochondria | Produces energy (ATP) |\n| Ribosome | Makes proteins |\n| Endoplasmic reticulum | Transports materials within cell |\n| Golgi apparatus | Packages and ships proteins |\n| Vacuole | Stores water and nutrients |\n| Chloroplast | (Plant only) Performs photosynthesis |\n| Cell wall | (Plant only) Provides rigid outer support |\n\n## Key Cell Processes\n\n### Photosynthesis (Plants)\n\n6CO2 + 6H2O + light energy → C6H12O6 + 6O2\n\n- Occurs in chloroplasts\n- Converts light energy into chemical energy (glucose)\n\n### Cellular Respiration (All Cells)\n\nC6H12O6 + 6O2 → 6CO2 + 6H2O + ATP energy\n\n- Occurs mainly in mitochondria\n- Releases energy stored in glucose\n\n## Cell Division\n\n- **Mitosis:** Produces 2 identical daughter cells — used for growth and repair\n- **Meiosis:** Produces 4 sex cells (sperm or egg) with half the chromosomes — used for reproduction"
    },
    {
      subject: "science", topic: "Life Science", type: "vocab_list",
      title: "Biology Key Terms",
      content: "# Biology Key Terms\n\n## Cells and Genetics\n\n| Term | Definition |\n|------|------------|\n| **Cell** | The basic structural unit of all life |\n| **DNA** | Molecule that carries genetic instructions |\n| **Gene** | A segment of DNA that codes for a specific trait |\n| **Chromosome** | Tightly coiled strand of DNA |\n| **Allele** | A version of a gene (dominant or recessive) |\n| **Phenotype** | The observable characteristic you can see |\n| **Genotype** | The genetic makeup (the alleles carried) |\n| **Mutation** | A change in the DNA sequence |\n| **Dominant** | Allele expressed even if only one copy is present |\n| **Recessive** | Allele expressed only if two copies are present |\n\n## Evolution and Ecology\n\n| Term | Definition |\n|------|------------|\n| **Natural selection** | Process where organisms with favorable traits reproduce more |\n| **Adaptation** | A trait that increases survival in an environment |\n| **Species** | A group of organisms that can interbreed |\n| **Ecosystem** | All living and non-living things in an area interacting |\n| **Food chain** | Linear sequence showing who eats whom |\n| **Producer** | Organism that makes its own food (plants, algae) |\n| **Consumer** | Organism that eats other organisms |\n| **Decomposer** | Breaks down dead matter (fungi, bacteria) |\n| **Habitat** | The natural environment where an organism lives |\n\n## Body Systems Summary\n\n| System | Main Function |\n|--------|---------------|\n| Circulatory | Moves blood, oxygen, and nutrients |\n| Respiratory | Oxygen intake and CO2 removal |\n| Digestive | Breaks down food for energy and nutrients |\n| Nervous | Sends electrical signals; controls responses |\n| Endocrine | Produces hormones that regulate body processes |\n| Immune | Defends against pathogens and disease |"
    },
    {
      subject: "science", topic: "Physical Science", type: "formula_sheet",
      title: "Physics and Chemistry Formula Sheet",
      content: "# Physics and Chemistry Formula Sheet\n\n## Motion and Forces\n\n| Formula | Meaning |\n|---------|---------|\n| v = d / t | Speed = Distance divided by Time |\n| a = delta-v / t | Acceleration = Change in velocity divided by Time |\n| F = m x a | Force = Mass x Acceleration |\n| W = F x d | Work = Force x Distance |\n| P = W / t | Power = Work divided by Time |\n| KE = (1/2)mv^2 | Kinetic energy |\n| PE = mgh | Potential energy = mass x gravity x height |\n\n## Newton's Laws\n\n1. **Law of Inertia:** An object at rest stays at rest; an object in motion stays in motion — unless acted on by a net force.\n2. **F = ma:** Net force equals mass times acceleration.\n3. **Action-Reaction:** For every action there is an equal and opposite reaction.\n\n## Electricity (Ohm's Law)\n\n| Formula | Meaning |\n|---------|---------|\n| V = I x R | Voltage = Current x Resistance |\n| P = I x V | Power = Current x Voltage |\n\n## Chemistry Basics\n\n| Concept | Key Facts |\n|---------|-----------|\n| Atomic number | Number of protons (= electrons in neutral atom) |\n| Mass number | Protons + Neutrons |\n| Isotope | Same element, different number of neutrons |\n| pH scale | 0-6 = Acid, 7 = Neutral, 8-14 = Base |\n| Endothermic | Reaction absorbs heat from surroundings |\n| Exothermic | Reaction releases heat to surroundings |\n\n## Waves\n\n- Wave speed = frequency x wavelength\n- EM Spectrum (low to high frequency): Radio, Microwave, Infrared, Visible Light, UV, X-Ray, Gamma Ray"
    },

    // SOCIAL STUDIES
    {
      subject: "social_studies", topic: "US History", type: "study_guide",
      title: "Key Events in US History",
      content: "# Key Events in US History\n\n## Colonial Period and Revolution\n\n- **1776** — Declaration of Independence: colonies declare freedom from British rule\n- **1787** — Constitutional Convention: the US Constitution is drafted\n- **1791** — Bill of Rights added: first 10 amendments protecting individual freedoms\n\n## Expansion and Civil War\n\n- **1803** — Louisiana Purchase: US doubles its territory\n- **1861-1865** — Civil War between the Union (North) and Confederacy (South) over slavery and states' rights\n- **1863** — Emancipation Proclamation: Lincoln declares enslaved people in rebel states to be free\n- **1865** — 13th Amendment abolishes slavery nationwide\n\n## Reconstruction and Industrialization\n\n- **1865-1877** — Reconstruction Era: effort to rebuild the South and integrate freed people\n- **1869** — Transcontinental railroad completed, connecting East and West\n- **1920** — 19th Amendment gives women the right to vote\n\n## 20th Century\n\n- **1929** — Great Depression begins after the stock market crash\n- **1933-1939** — New Deal: FDR's government programs to provide jobs and aid recovery\n- **1941** — US enters World War II after the attack on Pearl Harbor\n- **1954** — Brown v. Board of Education: Supreme Court rules school segregation unconstitutional\n- **1964** — Civil Rights Act: prohibits discrimination by race, color, religion, sex, or national origin\n- **1965** — Voting Rights Act: protects minority voting rights\n\n## Key Concepts\n\n- **Checks and balances:** Each branch of government limits the others\n- **Federalism:** Power is shared between national and state governments\n- **Civil liberties:** Freedoms guaranteed by the Constitution"
    },
    {
      subject: "social_studies", topic: "Civics & Government", type: "vocab_list",
      title: "Civics and Government Key Terms",
      content: "# Civics and Government Key Terms\n\n## Government Structure\n\n| Term | Definition |\n|------|------------|\n| **Democracy** | Government by the people, directly or through elected representatives |\n| **Republic** | Citizens elect representatives to make decisions on their behalf |\n| **Federalism** | Power is divided between the national and state governments |\n| **Separation of powers** | Government is divided into three branches with distinct roles |\n| **Checks and balances** | Each branch can limit the power of the others |\n| **Bicameral** | A legislature with two chambers (the Senate and the House) |\n\n## The Three Branches\n\n| Branch | Institution | Primary Power |\n|--------|-------------|---------------|\n| Legislative | Congress (Senate + House of Representatives) | Makes laws |\n| Executive | President, Vice President, Cabinet | Enforces laws |\n| Judicial | Supreme Court and federal courts | Interprets laws |\n\n## Rights and Freedoms\n\n| Term | Definition |\n|------|------------|\n| **Civil rights** | Rights that protect individuals from discrimination |\n| **Civil liberties** | Freedoms guaranteed by the Constitution |\n| **Due process** | Government must follow fair procedures before depriving rights |\n| **Equal protection** | All persons must be treated equally under the law |\n| **Amendment** | A formal change or addition to the Constitution |\n\n## Key Amendments to Know\n\n| Amendment | Right Protected |\n|-----------|-----------------|\n| 1st | Speech, religion, press, assembly, petition |\n| 2nd | Right to bear arms |\n| 4th | Protection from unreasonable searches and seizures |\n| 5th | Right against self-incrimination; due process |\n| 13th | Abolition of slavery |\n| 14th | Equal protection and citizenship |\n| 19th | Women's right to vote |"
    },
    {
      subject: "social_studies", topic: "Economics", type: "study_guide",
      title: "Basic Economics Concepts",
      content: "# Basic Economics Concepts\n\nThe GED Social Studies test includes questions on personal finance, microeconomics, and macroeconomics.\n\n## Fundamental Economic Principles\n\n### Scarcity\nResources (time, money, materials) are limited but human wants are unlimited. This forces choices about how resources are used.\n\n### Opportunity Cost\nThe value of the best alternative you give up when making a choice.\n\n**Example:** If you spend Saturday studying, the opportunity cost might be time with friends or rest.\n\n### Supply and Demand\n\n| Change | Effect on Price |\n|--------|----------------|\n| Demand increases | Price tends to rise |\n| Demand decreases | Price tends to fall |\n| Supply increases | Price tends to fall |\n| Supply decreases | Price tends to rise |\n\n**Equilibrium:** The price at which the quantity supplied equals the quantity demanded.\n\n## Types of Economic Systems\n\n| System | Key Feature |\n|--------|-------------|\n| Market economy | Individuals and businesses make most decisions |\n| Command economy | Government controls production and pricing |\n| Mixed economy | Combination of both (most countries today) |\n\n## Key Economic Indicators\n\n| Indicator | What It Measures |\n|-----------|------------------|\n| GDP | Total value of goods and services produced |\n| Inflation | General rise in prices over time |\n| Unemployment rate | Percentage of workers without jobs |\n| Interest rate | Cost of borrowing money |\n\n## Personal Finance Basics\n\n- **Budget:** A plan for income and expenses\n- **Credit score:** Measure of creditworthiness (300-850)\n- **Compound interest:** Interest earned on interest — grows savings, worsens debt\n- **Gross income vs. Net income:** Before tax vs. after tax"
    },
  ];

  for (var i = 0; i < seeds.length; i++) {
    var r = new Record(col);
    r.set("subject", seeds[i].subject);
    r.set("topic", seeds[i].topic);
    r.set("type", seeds[i].type);
    r.set("title", seeds[i].title);
    r.set("content", seeds[i].content);
    app.save(r);
  }

}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("resource_bookmarks")); } catch (_) {}
  try { app.delete(app.findCollectionByNameOrId("resources")); } catch (_) {}
});
