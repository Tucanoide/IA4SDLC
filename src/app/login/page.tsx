'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push(searchParams.get('from') || '/')
      router.refresh()
    } else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-[#c7c4d8] uppercase tracking-widest">
          Access Key
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          placeholder="••••••••"
          className="bg-[#100a23] border border-[#464555] rounded-lg px-4 py-3 text-[#e8ddff] font-mono text-sm placeholder:text-[#464555] focus:outline-none focus:border-[#c3c0ff] focus:ring-1 focus:ring-[#c3c0ff]/30 transition-all"
        />
      </div>

      {error && (
        <p className="text-[#ffb4ab] text-xs font-mono text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="mt-2 bg-[#5046e4] hover:bg-[#5046e4]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[#dad7ff] font-mono text-sm font-bold py-3 rounded-lg transition-all duration-200 tracking-widest uppercase"
      >
        {loading ? 'Verificando…' : 'Ingresar'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#150f28]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#5046e4]/10 blur-[120px]" />
      </div>

      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl p-8 flex flex-col gap-6"
        style={{
          background: 'rgba(34, 28, 53, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(195, 192, 255, 0.12)',
          boxShadow: 'inset 0 1px 0 0 rgba(195, 192, 255, 0.05), 0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo / title */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <div className="w-12 h-12 rounded-xl bg-[#5046e4]/20 border border-[#c3c0ff]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#c3c0ff] text-2xl">lock</span>
          </div>
          <h1 className="text-[#e8ddff] font-headline font-black text-2xl tracking-tight">
            The Vault
          </h1>
          <p className="text-[#918fa1] font-mono text-xs text-center">
            Mainframe Intelligence Platform
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
