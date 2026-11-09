import { useCallback, useEffect, useRef, useState } from 'react'
import type { CustomSetlist, SetlistType } from '../../shared/custom-setlists'
import { api, LIBRARY_REQUEST_TIMEOUT_MS } from './api'

export type SetlistDraft = CustomSetlist & {
  type: SetlistType
  eventDate: string | null
  status: 'draft' | 'ready'
}
type Session = { value: SetlistDraft; saved: string; persisted: boolean }

// Scope recovery to the session without putting the access token in storage.
function recoveryKey(token: string) {
  let first = 2166136261
  let second = 5381
  for (const character of token) {
    first = Math.imul(first ^ character.charCodeAt(0), 16777619)
    second = Math.imul(second, 33) ^ character.charCodeAt(0)
  }
  return `ml:setlist-draft:${first >>> 0}:${second >>> 0}`
}

export function useSetlistDraft(token: string, onSaved: (saved: CustomSetlist) => void) {
  const key = recoveryKey(token)
  const [initialSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const recovered = JSON.parse(raw) as Session
        if (recovered.value?.id && Array.isArray(recovered.value.songs)) return recovered
      }
    } catch {
      /* Ignore an invalid browser backup. */
    }
    return null
  })
  const [draft, renderDraft] = useState<SetlistDraft | null>(initialSession?.value ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(
    Boolean(initialSession && initialSession.saved !== JSON.stringify(initialSession.value)),
  )
  const [persisted, setPersisted] = useState(initialSession?.persisted ?? false)
  const session = useRef<Session | null>(initialSession)
  const pending = useRef<Promise<boolean> | null>(null)
  const savedCallback = useRef(onSaved)
  useEffect(() => {
    savedCallback.current = onSaved
  }, [onSaved])

  const backup = useCallback(
    (current: Session) => {
      try {
        localStorage.setItem(key, JSON.stringify(current))
      } catch {
        /* Account saving still works when storage is unavailable. */
      }
    },
    [key],
  )

  function edit(existing?: CustomSetlist) {
    const value: SetlistDraft = {
      id: existing?.id ?? crypto.randomUUID(),
      title: existing?.title ?? '',
      songs: [...(existing?.songs ?? [])],
      type: existing?.type ?? 'personal',
      eventDate: existing?.eventDate ?? null,
      status: existing?.status ?? (existing ? 'ready' : 'draft'),
    }
    session.current = {
      value,
      saved: JSON.stringify(value),
      persisted: Boolean(existing),
    }
    renderDraft(value)
    setDirty(false)
    setPersisted(Boolean(existing))
    setError('')
  }

  function change(value: SetlistDraft) {
    if (!session.current) return
    const next = { ...value, status: 'draft' as const }
    session.current.value = next
    backup(session.current)
    renderDraft(next)
    setDirty(true)
    setError('')
  }

  const flush = useCallback(async (): Promise<boolean> => {
    if (pending.current) return pending.current
    const current = session.current
    if (!current || current.saved === JSON.stringify(current.value)) {
      setDirty(false)
      return true
    }
    setSaving(true)
    setError('')
    const operation = (async () => {
      try {
        // Keep one request in flight and save edits made while it was running next.
        while (current.saved !== JSON.stringify(current.value)) {
          const snapshot = current.value
          const saved = await api<CustomSetlist>(
            `/library/setlists${current.persisted ? `/${snapshot.id}` : ''}`,
            {
              method: current.persisted ? 'PUT' : 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(snapshot),
            },
            LIBRARY_REQUEST_TIMEOUT_MS,
          )
          current.persisted = true
          setPersisted(true)
          current.saved = JSON.stringify(snapshot)
          savedCallback.current(saved)
          backup(current)
        }
        if (session.current === current) setDirty(false)
        return true
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o setlist.')
        return false
      } finally {
        setSaving(false)
        pending.current = null
      }
    })()
    pending.current = operation
    return operation
  }, [token, backup])

  useEffect(() => {
    if (!draft || !dirty) return
    const timeout = window.setTimeout(() => {
      void flush()
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [draft, dirty, flush])

  useEffect(() => {
    const saveWhenHidden = () => {
      if (document.visibilityState === 'hidden') void flush()
    }
    document.addEventListener('visibilitychange', saveWhenHidden)
    return () => {
      document.removeEventListener('visibilitychange', saveWhenHidden)
      void flush()
    }
  }, [flush])

  async function close(finalize = false) {
    const current = session.current
    if (!current) return true
    if (finalize) {
      current.value = { ...current.value, title: current.value.title.trim(), status: 'ready' }
      backup(current)
      renderDraft(current.value)
    }
    if (!(await flush())) return false
    session.current = null
    renderDraft(null)
    setDirty(false)
    try {
      localStorage.removeItem(key)
    } catch {
      /* Best effort cleanup. */
    }
    return true
  }

  return { draft, edit, change, close, retry: flush, saving, dirty, error, persisted }
}
