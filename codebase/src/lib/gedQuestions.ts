import type { SubjectId } from './gedConfig';

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'dropdown' | 'drag_drop';

export interface Question {
  id: string;
  subject: SubjectId;
  type: QuestionType;
  topic: string;
  passage?: string;
  question: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // multiple_choice / dropdown
  options?: string[];
  correctAnswer?: string;
  // fill_blank
  acceptedAnswers?: string[];
  numeric?: boolean;
  // drag_drop
  items?: string[];
  correctOrder?: string[];
  dragInstruction?: string;
}

// ─── Passages ─────────────────────────────────────────────────────────────────

const RLA_PASSAGE = `Adapted from Rachel Carson's "Silent Spring" (1962):

There was once a town in the heart of America where all life seemed to live in harmony with its surroundings. The town lay in the midst of a checkerboard of prosperous farms, with fields of grain and hillsides of orchards where, in spring, white clouds of bloom drifted above the green fields. In autumn, oak and maple and birch set up a blaze of color that flamed and flickered across a backdrop of pines. Then foxes barked in the hills and deer silently crossed the fields, half hidden in the mists of the fall mornings.

Then a strange blight crept over the area and everything began to change. Some evil spell had settled on the community: mysterious maladies swept the flocks of chickens; the cattle and sheep sickened and died. Everywhere was a shadow of death. The farmers spoke of much illness among their families. In the town the doctors had become more and more puzzled by new kinds of sickness appearing among their patients.`;

const SCIENCE_PASSAGE = `Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored as glucose. This process occurs primarily in the chloroplasts of plant cells, using sunlight, carbon dioxide, and water. The overall equation is:

6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

The process consists of two main stages: the light-dependent reactions (which occur in the thylakoid membranes) and the Calvin cycle (which occurs in the stroma). In the light-dependent stage, solar energy is captured to produce ATP and NADPH, and water molecules are split — releasing oxygen as a byproduct.`;

const SS_PASSAGE = `The First Amendment to the United States Constitution, ratified in 1791 as part of the Bill of Rights, prohibits the government from making laws that restrict freedom of speech, religion, press, assembly, and the right to petition. These five freedoms form the cornerstone of American civil liberties.

However, freedom of speech is not absolute — the Supreme Court has ruled that certain types of speech are not protected, including "true threats," obscenity, and speech that incites imminent lawless action.`;

// ─── Question Bank ─────────────────────────────────────────────────────────────

export const QUESTION_BANK: Question[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // RLA — Reasoning Through Language Arts
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'rla-01', subject: 'rla', type: 'multiple_choice', topic: 'Reading Comprehension',
    passage: RLA_PASSAGE,
    question: 'According to the passage, what change occurred in the town after the "strange blight" arrived?',
    options: [
      'The town grew rapidly and became more prosperous.',
      'A mysterious illness began affecting animals and people alike.',
      'The farmers adopted new and more efficient agricultural methods.',
      'A severe drought caused crops to fail across the entire region.',
    ],
    correctAnswer: 'A mysterious illness began affecting animals and people alike.',
    explanation: 'The passage states "mysterious maladies swept the flocks of chickens; the cattle and sheep sickened and died" and doctors were puzzled by "new kinds of sickness."',
    difficulty: 'easy',
  },
  {
    id: 'rla-02', subject: 'rla', type: 'multiple_choice', topic: "Author's Craft",
    passage: RLA_PASSAGE,
    question: "The author's primary purpose in describing the town both \"before\" and \"after\" the blight is to:",
    options: [
      'Explain the economic history of farming in rural America.',
      'Argue that foxes and deer should be protected as wildlife.',
      'Create a stark contrast that illustrates the devastating environmental change.',
      'Persuade farmers to relocate to regions with better soil.',
    ],
    correctAnswer: 'Create a stark contrast that illustrates the devastating environmental change.',
    explanation: "By painting an idyllic picture before and then describing collapse, Carson uses contrast as a rhetorical device to convey the severity of environmental damage.",
    difficulty: 'medium',
  },
  {
    id: 'rla-03', subject: 'rla', type: 'dropdown', topic: 'Vocabulary',
    passage: RLA_PASSAGE,
    question: 'As used in the passage, the word "blight" most nearly means:',
    options: ['Something beautiful and admired', 'A disease or destructive force', 'A type of weather pattern', 'An economic depression'],
    correctAnswer: 'A disease or destructive force',
    explanation: '"Blight" refers to a plant disease or destructive force; in context it describes the mysterious force killing animals and sickening people.',
    difficulty: 'easy',
  },
  {
    id: 'rla-04', subject: 'rla', type: 'fill_blank', topic: 'Reading Comprehension',
    passage: RLA_PASSAGE,
    question: 'According to the passage, the town was a place where "all life seemed to live in ___ with its surroundings."',
    correctAnswer: 'harmony',
    acceptedAnswers: ['harmony'],
    explanation: 'The exact phrase from the opening of the passage is "all life seemed to live in harmony with its surroundings."',
    difficulty: 'easy',
  },
  {
    id: 'rla-05', subject: 'rla', type: 'multiple_choice', topic: 'Inference',
    passage: RLA_PASSAGE,
    question: 'What can most reasonably be inferred as the likely cause of the "strange blight" described in the passage?',
    options: [
      'The blight was caused by a natural and severe drought.',
      'The blight was the result of a supernatural curse on the community.',
      'The blight was most likely caused by an external chemical or pesticide.',
      'The blight was spread by an invasive animal species entering the region.',
    ],
    correctAnswer: 'The blight was most likely caused by an external chemical or pesticide.',
    explanation: 'This passage is the opening of "Silent Spring," a book specifically about pesticide dangers. The simultaneous illness across multiple species points strongly to chemical contamination.',
    difficulty: 'hard',
  },
  {
    id: 'rla-06', subject: 'rla', type: 'multiple_choice', topic: 'Language Arts',
    question: 'Which of the following sentences uses a semicolon correctly?',
    options: [
      'She studied hard; therefore, she passed the exam.',
      'She studied; hard and passed the exam.',
      'She studied hard; and she passed.',
      'She; studied hard and passed the exam.',
    ],
    correctAnswer: 'She studied hard; therefore, she passed the exam.',
    explanation: 'A semicolon correctly joins two independent clauses, especially when followed by a conjunctive adverb like "therefore." The other options misplace the semicolon.',
    difficulty: 'medium',
  },
  {
    id: 'rla-07', subject: 'rla', type: 'dropdown', topic: 'Language Arts',
    question: 'Choose the best transition word to complete this sentence:\n"The students prepared thoroughly for the test. ___, they performed better than expected."',
    options: ['However', 'Therefore', 'Although', 'Despite'],
    correctAnswer: 'Therefore',
    explanation: '"Therefore" signals a logical result — performing better is a result of thorough preparation. "However" would signal a contrast, which does not fit.',
    difficulty: 'easy',
  },
  {
    id: 'rla-08', subject: 'rla', type: 'fill_blank', topic: 'Language Arts',
    question: 'A sentence that states the central argument or main point of an essay is called a ___ statement.',
    correctAnswer: 'thesis',
    acceptedAnswers: ['thesis'],
    explanation: 'A thesis statement is the central claim of an essay that the rest of the writing supports and develops.',
    difficulty: 'easy',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MATH — Mathematical Reasoning
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'math-01', subject: 'math', type: 'fill_blank', topic: 'Algebra',
    question: 'Solve for x:\n\n3x + 7 = 22\n\nx = ___',
    correctAnswer: '5',
    acceptedAnswers: ['5'],
    numeric: true,
    explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
    difficulty: 'easy',
  },
  {
    id: 'math-02', subject: 'math', type: 'multiple_choice', topic: 'Arithmetic',
    question: 'A store offers a 25% discount on a jacket originally priced at $80. What is the sale price?',
    options: ['$55.00', '$60.00', '$65.00', '$70.00'],
    correctAnswer: '$60.00',
    explanation: '25% of $80 = $20. Sale price = $80 − $20 = $60.',
    difficulty: 'easy',
  },
  {
    id: 'math-03', subject: 'math', type: 'fill_blank', topic: 'Geometry',
    question: 'What is the area, in square units, of a triangle with a base of 10 units and a height of 6 units?\n\nArea = ___',
    correctAnswer: '30',
    acceptedAnswers: ['30'],
    numeric: true,
    explanation: 'Area of a triangle = ½ × base × height = ½ × 10 × 6 = 30 square units.',
    difficulty: 'easy',
  },
  {
    id: 'math-04', subject: 'math', type: 'multiple_choice', topic: 'Algebra',
    question: 'Which of the following is equivalent to the expression:\n\n4(x + 3) − 2x',
    options: ['2x + 12', '2x + 3', '6x + 12', '4x + 12'],
    correctAnswer: '2x + 12',
    explanation: 'Distribute: 4x + 12 − 2x = 2x + 12.',
    difficulty: 'medium',
  },
  {
    id: 'math-05', subject: 'math', type: 'drag_drop', topic: 'Number Sense',
    question: 'Arrange the following values in order from LEAST to GREATEST.',
    dragInstruction: 'Drag items to reorder from least to greatest',
    items: ['3/4', '0.6', '5/8', '0.72'],
    correctOrder: ['0.6', '5/8', '0.72', '3/4'],
    explanation: 'Converting to decimals: 3/4 = 0.75, 5/8 = 0.625. Order: 0.6 < 0.625 (5/8) < 0.72 < 0.75 (3/4).',
    difficulty: 'medium',
  },
  {
    id: 'math-06', subject: 'math', type: 'multiple_choice', topic: 'Geometry',
    question: 'In a right triangle, one leg measures 6 cm and the hypotenuse measures 10 cm. What is the length of the other leg?',
    options: ['4 cm', '6 cm', '8 cm', '12 cm'],
    correctAnswer: '8 cm',
    explanation: 'Pythagorean theorem: a² + b² = c². 6² + b² = 10². 36 + b² = 100. b² = 64. b = 8 cm.',
    difficulty: 'medium',
  },
  {
    id: 'math-07', subject: 'math', type: 'dropdown', topic: 'Algebra',
    question: 'What is the equation of a line with slope 2 that passes through the point (0, 3)?',
    options: ['y = 2x − 3', 'y = 2x + 3', 'y = 3x + 2', 'y = −2x + 3'],
    correctAnswer: 'y = 2x + 3',
    explanation: 'Using slope-intercept form y = mx + b: m = 2, and when x = 0, y = 3, so b = 3. Equation: y = 2x + 3.',
    difficulty: 'medium',
  },
  {
    id: 'math-08', subject: 'math', type: 'fill_blank', topic: 'Arithmetic',
    question: 'If 40% of a number is 60, what is the number?\n\nAnswer: ___',
    correctAnswer: '150',
    acceptedAnswers: ['150'],
    numeric: true,
    explanation: '0.40 × n = 60. n = 60 ÷ 0.40 = 150.',
    difficulty: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'sci-01', subject: 'science', type: 'multiple_choice', topic: 'Life Science',
    passage: SCIENCE_PASSAGE,
    question: 'According to the passage, what is released as a byproduct when water molecules are split during the light-dependent reactions?',
    options: ['Carbon dioxide', 'Glucose', 'Oxygen', 'ATP'],
    correctAnswer: 'Oxygen',
    explanation: 'The passage explicitly states "water molecules are split — releasing oxygen as a byproduct."',
    difficulty: 'easy',
  },
  {
    id: 'sci-02', subject: 'science', type: 'multiple_choice', topic: 'Life Science',
    passage: SCIENCE_PASSAGE,
    question: 'Based on the photosynthesis equation in the passage, which of the following is a reactant (an input)?',
    options: ['Glucose', 'Oxygen', 'Carbon dioxide', 'Starch'],
    correctAnswer: 'Carbon dioxide',
    explanation: 'The equation shows 6CO₂ + 6H₂O + light energy on the left (reactants). Glucose and oxygen appear on the right as products.',
    difficulty: 'easy',
  },
  {
    id: 'sci-03', subject: 'science', type: 'fill_blank', topic: 'Life Science',
    passage: SCIENCE_PASSAGE,
    question: 'According to the passage, photosynthesis occurs primarily in the ___ of plant cells.',
    correctAnswer: 'chloroplasts',
    acceptedAnswers: ['chloroplast'],
    explanation: 'The passage directly states "This process occurs primarily in the chloroplasts of plant cells."',
    difficulty: 'easy',
  },
  {
    id: 'sci-04', subject: 'science', type: 'dropdown', topic: 'Scientific Practices',
    question: 'A scientist designs an experiment to test how light intensity affects the rate of photosynthesis. Light intensity is the variable she deliberately changes. What type of variable is this?',
    options: ['The dependent variable', 'The control variable', 'The independent variable', 'The constant variable'],
    correctAnswer: 'The independent variable',
    explanation: 'The independent variable is the one deliberately changed by the experimenter. The dependent variable is what is measured in response (photosynthesis rate).',
    difficulty: 'medium',
  },
  {
    id: 'sci-05', subject: 'science', type: 'multiple_choice', topic: 'Life Science',
    question: 'Which of the following best describes the relationship between photosynthesis and cellular respiration?',
    options: [
      'Both processes produce oxygen as a main product.',
      'They are entirely unrelated chemical processes.',
      'Photosynthesis produces glucose that is used as fuel in cellular respiration.',
      'Cellular respiration takes place inside chloroplasts.',
    ],
    correctAnswer: 'Photosynthesis produces glucose that is used as fuel in cellular respiration.',
    explanation: 'Photosynthesis converts CO₂ and water into glucose using light. Cellular respiration breaks down that glucose to produce ATP energy. They are complementary cycles.',
    difficulty: 'medium',
  },
  {
    id: 'sci-06', subject: 'science', type: 'drag_drop', topic: 'Scientific Practices',
    question: 'Place the following steps of the scientific method in the correct order.',
    dragInstruction: 'Drag steps into the correct sequence from first to last',
    items: [
      'Analyze results and draw conclusions',
      'Form a hypothesis',
      'Identify a problem or question',
      'Design and conduct an experiment',
      'Communicate results',
    ],
    correctOrder: [
      'Identify a problem or question',
      'Form a hypothesis',
      'Design and conduct an experiment',
      'Analyze results and draw conclusions',
      'Communicate results',
    ],
    explanation: 'The scientific method follows: Identify question → Hypothesis → Experiment → Analysis → Communicate.',
    difficulty: 'easy',
  },
  {
    id: 'sci-07', subject: 'science', type: 'multiple_choice', topic: 'Life Science',
    question: 'In genetics, an allele is described as dominant if its trait is expressed when:',
    options: [
      'The organism carries two recessive alleles.',
      'The organism carries at least one copy of that allele.',
      'The organism is female.',
      'The organism lives in a warm climate.',
    ],
    correctAnswer: 'The organism carries at least one copy of that allele.',
    explanation: 'A dominant allele masks the expression of a recessive allele. It is expressed whenever at least one copy is present (homozygous or heterozygous dominant).',
    difficulty: 'medium',
  },
  {
    id: 'sci-08', subject: 'science', type: 'fill_blank', topic: 'Physical Science',
    question: "According to Newton's Law of Universal Gravitation, the gravitational force between two objects increases as the ___ of the objects increases.",
    correctAnswer: 'mass',
    acceptedAnswers: ['masses', 'mass of'],
    explanation: "F = G(m₁m₂)/r². Gravitational force is directly proportional to mass — greater mass means a stronger gravitational pull.",
    difficulty: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL STUDIES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ss-01', subject: 'social_studies', type: 'multiple_choice', topic: 'Civics & Government',
    passage: SS_PASSAGE,
    question: 'According to the passage, how many freedoms does the First Amendment protect?',
    options: ['Three', 'Four', 'Five', 'Six'],
    correctAnswer: 'Five',
    explanation: 'The passage explicitly lists five freedoms: speech, religion, press, assembly, and the right to petition.',
    difficulty: 'easy',
  },
  {
    id: 'ss-02', subject: 'social_studies', type: 'multiple_choice', topic: 'Civics & Government',
    passage: SS_PASSAGE,
    question: 'A person falsely shouts "Fire!" in a crowded theater, causing a dangerous panic. Based on the passage, this speech would most likely be:',
    options: [
      'Protected by the First Amendment as free speech.',
      'Not protected, because it incites imminent lawless action.',
      'Protected as an expression of freedom of religion.',
      'Not protected only if the speaker is a government employee.',
    ],
    correctAnswer: 'Not protected, because it incites imminent lawless action.',
    explanation: 'The passage states speech that "incites imminent lawless action" is not protected. Causing a dangerous panic qualifies.',
    difficulty: 'medium',
  },
  {
    id: 'ss-03', subject: 'social_studies', type: 'fill_blank', topic: 'Civics & Government',
    passage: SS_PASSAGE,
    question: 'The passage states the First Amendment was ratified "as part of the Bill of ___."',
    correctAnswer: 'Rights',
    acceptedAnswers: ['rights'],
    explanation: 'The first ten amendments to the US Constitution, ratified in 1791, are collectively known as the Bill of Rights.',
    difficulty: 'easy',
  },
  {
    id: 'ss-04', subject: 'social_studies', type: 'multiple_choice', topic: 'Economics',
    question: 'When the supply of a product decreases while consumer demand stays the same, what typically happens to the price?',
    options: ['The price decreases.', 'The price stays the same.', 'The price increases.', 'The product is discontinued.'],
    correctAnswer: 'The price increases.',
    explanation: 'When supply falls and demand is unchanged, scarcity increases competition among buyers, driving prices upward (law of supply and demand).',
    difficulty: 'easy',
  },
  {
    id: 'ss-05', subject: 'social_studies', type: 'dropdown', topic: 'Geography',
    question: 'In which general direction does the Mississippi River flow?',
    options: ['North to south', 'South to north', 'East to west', 'West to east'],
    correctAnswer: 'North to south',
    explanation: 'The Mississippi River originates in northern Minnesota and flows generally southward, emptying into the Gulf of Mexico.',
    difficulty: 'easy',
  },
  {
    id: 'ss-06', subject: 'social_studies', type: 'multiple_choice', topic: 'Civics & Government',
    question: 'Which branch of the United States federal government is responsible for interpreting the Constitution and federal laws?',
    options: ['The Executive Branch', 'The Legislative Branch', 'The Judicial Branch', 'The Cabinet'],
    correctAnswer: 'The Judicial Branch',
    explanation: 'The Judicial Branch, headed by the Supreme Court, holds the power of judicial review — the authority to interpret the Constitution.',
    difficulty: 'easy',
  },
  {
    id: 'ss-07', subject: 'social_studies', type: 'drag_drop', topic: 'US History',
    question: 'Place the following events in American history in the correct chronological order.',
    dragInstruction: 'Drag events from earliest to most recent',
    items: [
      'World War II ends',
      'Declaration of Independence signed',
      'Moon landing',
      'Civil War begins',
      'Constitution ratified',
    ],
    correctOrder: [
      'Declaration of Independence signed',
      'Constitution ratified',
      'Civil War begins',
      'World War II ends',
      'Moon landing',
    ],
    explanation: '1776: Declaration. 1788: Constitution ratified. 1861: Civil War begins. 1945: WWII ends. 1969: Moon landing.',
    difficulty: 'medium',
  },
  {
    id: 'ss-08', subject: 'social_studies', type: 'fill_blank', topic: 'Economics',
    question: 'The economic measure representing the total value of all goods and services produced within a country in a given year is called the Gross Domestic ___.',
    correctAnswer: 'Product',
    acceptedAnswers: ['product'],
    explanation: 'GDP (Gross Domestic Product) is the primary indicator used to gauge the size and health of a national economy.',
    difficulty: 'easy',
  },
];

export function getQuestions(mode: string): Question[] {
  if (mode === 'full_exam') return QUESTION_BANK;
  return QUESTION_BANK.filter(q => q.subject === mode);
}
