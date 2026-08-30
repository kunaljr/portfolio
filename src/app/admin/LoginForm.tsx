'use client'

import { useState } from 'react'
import { login } from './actions'

export function LoginForm({ error }: { error?: boolean }) {
  const [show, setShow] = useState(false)

  return (
    <div style={{
      width: '100%',
      maxWidth: 360,
      padding: '2rem',
      background: 'var(--surf)',
      border: '0.5px solid var(--bdr)',
      borderRadius: 'var(--r)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h1 style={{
        fontFamily: 'var(--fh)',
        fontSize: '1.2rem',
        fontWeight: 800,
        color: 'var(--tx)',
        margin: 0,
      }}>
        Admin
      </h1>
      {error && (
        <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: 0 }}>
          Incorrect password.
        </p>
      )}
      <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
            autoFocus
            style={{
              padding: '0.6rem 2.4rem 0.6rem 0.75rem',
              border: '0.5px solid var(--bdr)',
              borderRadius: 'var(--r2)',
              background: 'var(--bg)',
              color: 'var(--tx)',
              fontFamily: 'var(--fb)',
              fontSize: '0.9rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--tx3)',
            }}
          >
            {show ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <button
          type="submit"
          style={{
            padding: '0.6rem',
            background: 'var(--acc)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r2)',
            fontFamily: 'var(--fb)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </form>
    </div>
  )
}
