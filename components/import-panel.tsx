'use client'
import { useRef, useState } from 'react'
import { Download, Upload, FileJson, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { pick, ui, type Locale } from '@/lib/i18n'
import type { Chapter, Subject } from '@/lib/bac-data'
import { normalizeImport, exportSubject, downloadJSON, importTemplate } from '@/lib/import'

export function ImportPanel({
  locale,
  subjects,
  importedChapters,
  onImport,
  onDelete,
}: {
  locale: Locale
  subjects: Subject[]
  importedChapters: Chapter[]
  onImport: (chapters: Chapter[]) => void
  onDelete: (id: string) => void
}) {
  const t = ui[locale]
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        const chapters = normalizeImport(data)
        if (!chapters.length) throw new Error('empty')
        onImport(chapters)
        setStatus({ ok: true, msg: t.importSuccess })
      } catch {
        setStatus({ ok: false, msg: t.importError })
      }
    }
    reader.onerror = () => setStatus({ ok: false, msg: t.importError })
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t.importExport}</CardTitle>
          <CardDescription>{t.importText}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileRef.current?.click()}>
              <Upload data-icon="inline-start" />
              {t.importFile}
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadJSON('modele-import.json', importTemplate(locale))}
            >
              <FileJson data-icon="inline-start" />
              {t.downloadTemplate}
            </Button>
          </div>
          {status && (
            <Alert variant={status.ok ? 'default' : 'destructive'}>
              <AlertDescription>{status.msg}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.exportSubject}</CardTitle>
          <CardDescription>{t.exportText}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              size="sm"
              onClick={() => downloadJSON(`${s.id}.json`, exportSubject(s, locale))}
            >
              <Download data-icon="inline-start" />
              {pick(s.name, locale)}
            </Button>
          ))}
        </CardContent>
      </Card>

      {importedChapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.importedChapters}</CardTitle>
            <CardDescription>
              {importedChapters.length} {t.chapters} · {importedChapters.reduce((n, c) => n + c.exercises.length, 0)} {t.exercises}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {importedChapters.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-semibold">{pick(c.title, locale)}</p>
                  <small className="text-muted-foreground">
                    {c.exercises.length} {t.exercises}
                  </small>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(c.id)}
                  aria-label={t.delete}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
