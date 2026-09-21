'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'zviripo:saved';

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function SaveButton({ id, label }: { id: string; label: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(id));
  }, [id]);

  const toggle = () => {
    const current = readSaved();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or blocked — keep the in-memory toggle.
    }
    setSaved(next.includes(id));
  };

  return (
    <button
      aria-label={`${saved ? 'Remove' : 'Save'} ${label}`}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
      type="button"
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}
