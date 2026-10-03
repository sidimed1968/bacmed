import type { Chapter, Exercise, Localized, Subject } from './bac-data'
import type { Locale } from './i18n'
import { pick } from './i18n'

type RawLocalized = string | { fr?: string; ar?: string }

function toLocalized(v: RawLocalized): Localized {
  if (typeof v === 'string') return { fr: v, ar: v }
  return { fr: v.fr || v.ar || '', ar: v.ar || v.fr || '' }
}

function toLocalizedArray(v: unknown): Localized[] {
  if (!Array.isArray(v)) return []
  return v.map((item) =>
    toLocalized(
      typeof item === 'object' && item !== null ? (item as RawLocalized) : String(item),
    ),
  )
}

function toExercise(raw: Record<string, unknown>, index: number): Exercise {
  return {
    id: (raw.id as string) || `imp-ex-${Date.now()}-${index}`,
    difficulty: (raw.difficulty as 1 | 2 | 3) || 1,
    duration: (raw.duration as number) || 10,
    question: toLocalized((raw.question as RawLocalized) || ''),
    hint: toLocalized((raw.hint as RawLocalized) || ''),
    answer: toLocalized((raw.answer as RawLocalized) || ''),
    correction: toLocalized((raw.correction as RawLocalized) || ''),
  }
}

export function normalizeImport(data: unknown): Chapter[] {
  if (!data || typeof data !== 'object') throw new Error('Invalid format')
  const raw = data as Record<string, unknown>
  const chapters = (Array.isArray(data) ? data : raw.chapters) as Record<string, unknown>[]
  if (!Array.isArray(chapters)) throw new Error('No chapters array found')
  return chapters.map((c, i) => ({
    id: (c.id as string) || `imp-ch-${Date.now()}-${i}`,
    title: toLocalized((c.title as RawLocalized) || 'Sans titre'),
    duration: (c.duration as number) || 40,
    summary: toLocalized((c.summary as RawLocalized) || ''),
    prerequisites: toLocalizedArray(c.prerequisites),
    objectives: toLocalizedArray(c.objectives),
    essentials: toLocalizedArray(c.essentials),
    method: toLocalizedArray(c.method),
    example: toLocalized((c.example as RawLocalized) || ''),
    mistakes: toLocalizedArray(c.mistakes),
    recap: toLocalized((c.recap as RawLocalized) || ''),
    exercises: Array.isArray(c.exercises)
      ? c.exercises.map((e, j) => toExercise(e as Record<string, unknown>, j))
      : [],
  }))
}

export function exportSubject(s: Subject, locale: Locale): string {
  return JSON.stringify(
    {
      subjectName: pick(s.name, locale),
      chapters: s.chapters.map((c) => ({
        title: pick(c.title, locale),
        summary: pick(c.summary, locale),
        essentials: c.essentials.map((e) => pick(e, locale)),
        method: c.method.map((m) => pick(m, locale)),
        recap: pick(c.recap, locale),
        exercises: c.exercises.map((e) => ({
          question: pick(e.question, locale),
          hint: pick(e.hint, locale),
          answer: pick(e.answer, locale),
          correction: pick(e.correction, locale),
        })),
      })),
    },
    null,
    2,
  )
}

export function importTemplate(locale: Locale): string {
  const fr = `{
  "subjectName": "Ma matière",
  "chapters": [
    {
      "title": "Titre du chapitre",
      "summary": "Résumé du chapitre",
      "essentials": ["Notion essentielle 1", "Notion essentielle 2"],
      "method": ["Étape 1", "Étape 2"],
      "recap": "Résumé express",
      "exercises": [
        {
          "question": "Question de l'exercice",
          "hint": "Indice",
          "answer": "Réponse attendue",
          "correction": "Correction détaillée"
        }
      ]
    }
  ]
}`
  const ar = `{
  "subjectName": "مادتي",
  "chapters": [
    {
      "title": "عنوان الفصل",
      "summary": "ملخص الفصل",
      "essentials": ["مفهوم أساسي 1", "مفهوم أساسي 2"],
      "method": ["الخطوة 1", "الخطوة 2"],
      "recap": "خلاصة سريعة",
      "exercises": [
        {
          "question": "سؤال التمرين",
          "hint": "تلميح",
          "answer": "الإجابة المتوقعة",
          "correction": "التصحيح المفصل"
        }
      ]
    }
  ]
}`
  return locale === 'ar' ? ar : fr
}

export function downloadJSON(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function buildImportedSubject(chapters: Chapter[]): Subject {
  return {
    id: 'imported',
    name: { fr: 'Mes cours importés', ar: 'دروسي المستوردة' },
    short: 'IMP',
    coefficient: 0,
    chapters,
  }
}
