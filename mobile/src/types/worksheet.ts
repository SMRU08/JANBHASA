/**
 * Bilingual Worksheet & PDF Generator Contract
 * Phase 7: UI & Service abstraction only. Native compilation handled in future phases.
 */

export interface WorksheetExerciseItem {
  id: string;
  category: 'vocabulary' | 'number' | 'sentence' | 'tracing';
  sourceText: string;        // e.g. Hindi
  targetText: string;        // e.g. Santali (Ol Chiki)
  phoneticGuide?: string;
  tracingDotsText?: string;
}

export interface WorksheetMetadata {
  lessonId: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  sourceLanguage: string;
  targetLanguage: string;
  teacherNameField: boolean;
  studentNameField: boolean;
  includeTracingExercises: boolean;
  includeStampArea: boolean;
  items: WorksheetExerciseItem[];
}

export interface WorksheetOutput {
  pdfFileUri: string;
  pageCount: number;
  byteSize: number;
  isCompiledLocally: boolean;
}
