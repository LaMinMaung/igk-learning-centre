export type SubjectId = 'rla' | 'math' | 'science' | 'social_studies';
export type ExamMode = SubjectId | 'full_exam';

export interface SectionConfig {
  id: SubjectId;
  label: string;
  shortLabel: string;
  /** Edit to change time limits */
  durationMinutes: number;
  hasBreak: boolean;
  /** Minutes elapsed before break starts (RLA only) */
  breakAfterMinutes?: number;
  /** Duration of break in minutes */
  breakDurationMinutes?: number;
  passPercentage: number;
  description: string;
  colorClass: string;
  accentClass: string;
  borderClass: string;
}

// ─── Edit these values to adjust time limits ──────────────────────────────────
export const SECTION_CONFIGS: Record<SubjectId, SectionConfig> = {
  rla: {
    id: 'rla',
    label: 'Reasoning Through Language Arts',
    shortLabel: 'RLA',
    durationMinutes: 150,
    hasBreak: true,
    breakAfterMinutes: 60,
    breakDurationMinutes: 10,
    passPercentage: 65,
    description: 'Reading comprehension, extended response writing, and language skills.',
    colorClass: 'from-blue-900/40 to-blue-800/20',
    accentClass: 'text-blue-400',
    borderClass: 'border-blue-600/50 hover:border-blue-400',
  },
  math: {
    id: 'math',
    label: 'Mathematical Reasoning',
    shortLabel: 'Math',
    durationMinutes: 115,
    hasBreak: false,
    passPercentage: 65,
    description: 'Quantitative problem-solving and algebraic thinking.',
    colorClass: 'from-green-900/40 to-green-800/20',
    accentClass: 'text-green-400',
    borderClass: 'border-green-600/50 hover:border-green-400',
  },
  science: {
    id: 'science',
    label: 'Science',
    shortLabel: 'Science',
    durationMinutes: 90,
    hasBreak: false,
    passPercentage: 65,
    description: 'Life science, physical science, and Earth & space science.',
    colorClass: 'from-purple-900/40 to-purple-800/20',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-600/50 hover:border-purple-400',
  },
  social_studies: {
    id: 'social_studies',
    label: 'Social Studies',
    shortLabel: 'Social Studies',
    durationMinutes: 70,
    hasBreak: false,
    passPercentage: 65,
    description: 'Civics, US history, economics, and geography.',
    colorClass: 'from-amber-900/40 to-amber-800/20',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-600/50 hover:border-amber-400',
  },
};

export const SUBJECT_ORDER: SubjectId[] = ['rla', 'math', 'science', 'social_studies'];

// ─── Scoring thresholds (%) ───────────────────────────────────────────────────
export const PASSING_THRESHOLD = 65;
export const COLLEGE_READY_THRESHOLD = 80;
export const HONORS_THRESHOLD = 90;

// ─── Warning alert when this many minutes remain ──────────────────────────────
export const TIMER_WARNING_MINUTES = 5;
