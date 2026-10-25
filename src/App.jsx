import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(
    () => Boolean(sessionStorage.getItem('authToken')),
  )

  useEffect(() => {
    const token = sessionStorage.getItem('authToken')
    if (!token) return

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not restore your session.')
        setUser(data.user)
      })
      .catch((sessionError) => {
        sessionStorage.removeItem('authToken')
        setError(sessionError.message)
      })
      .finally(() => setCheckingSession(false))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Unable to continue.')

      sessionStorage.setItem('authToken', data.token)
      setUser(data.user)
      setPassword('')
    } catch (submitError) {
      setError(submitError.message || 'Unable to connect. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  function signOut() {
    sessionStorage.removeItem('authToken')
    setUser(null)
    setMode('login')
    setError('')
  }

  if (checkingSession) {
    return <main className="page"><p className="loading">Checking your session...</p></main>
  }

  return (
    <main className="page">
      <section className="auth-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">M</div>
        {user ? (
          <div className="welcome">
            <p className="eyebrow">YOU'RE SIGNED IN</p>
            <h1 id="page-title">Welcome, {user.name}</h1>
            <p className="subtitle">{user.email}</p>
            <button className="submit-button" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">MIYEON</p>
            <h1 id="page-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="subtitle">
              {mode === 'login'
                ? 'Sign in to continue to your account.'
                : 'Sign up to get started.'}
            </p>

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label>
                  Your name
                  <input
                    autoComplete="name"
                    maxLength={100}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                    required
                    value={name}
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type="password"
                  value={password}
                />
              </label>

              {error && <p className="error-message" role="alert">{error}</p>}

              <button className="submit-button" disabled={loading} type="submit">
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </form>

            <p className="mode-switch">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setError('')
                }}
                type="button"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </section>
      <p className="footer-note">Your account details are kept secure.</p>
    </main>
  )
}

export default App
