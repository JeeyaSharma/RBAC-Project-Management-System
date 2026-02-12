'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validation
    if (name.length < 2) {
      setIsError(true)
      setMessage('Name must be at least 2 characters')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setIsError(true)
      setMessage('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsError(false)
        setMessage('Account created successfully! Redirecting to login...')
        setName('')
        setEmail('')
        setPassword('')
        // Redirect to login after signup
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        setIsError(true)
        setMessage(data.message || 'Signup failed. Please try again.')
      }
    } catch (error) {
      setIsError(true)
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={styles.container} className="auth-shell">
      <div style={styles.content}>
        <div style={styles.left}>
          <Image
            src="/images/8.png"
            alt="Sign Up"
            width={350}
            height={350}
            style={{ width: '100%', height: 'auto', maxWidth: '350px' }}
            className="auth-graphic"
          />
        </div>

        <div style={styles.right}>
          <div style={styles.formWrapper} className="auth-card">
            <Link href="/" style={styles.backLink}>
              ← Back
            </Link>

            <h1 style={styles.title}>Join Us</h1>
            <p style={styles.subtitle}>Create your SprintOps account</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  style={styles.input}
                  className="auth-input"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={styles.input}
                  className="auth-input"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={styles.input}
                  className="auth-input"
                  required
                />
              </div>

              {message && (
                <div
                  style={{
                    ...styles.message,
                    color: isError ? '#ff6b6b' : '#51cf66',
                    backgroundColor: isError ? '#ffe0e0' : '#e7f5ee',
                    borderColor: isError ? '#ff6b6b' : '#51cf66',
                  }}
                >
                  {message}
                </div>
              )}

              <button type="submit" style={styles.submitBtn} className="auth-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p style={styles.switchText}>
              Already have an account?{' '}
              <Link href="/login" style={styles.switchLink}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .auth-shell {
          position: relative;
          overflow: hidden;
        }

        .auth-shell::before {
          content: '';
          position: absolute;
          inset: -20% -10% auto -10%;
          height: 60vh;
          background: radial-gradient(60% 60% at 30% 30%, rgba(255, 255, 255, 0.22), transparent 70%);
          opacity: 0.8;
          pointer-events: none;
        }

        .auth-card {
          background: var(--auth-card);
          border: 1px solid var(--auth-border);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          animation: floatIn 700ms ease-out both;
        }

        .auth-graphic {
          animation: drift 6s ease-in-out infinite;
          filter: drop-shadow(0 18px 35px rgba(0, 0, 0, 0.25));
        }

        .auth-input {
          transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }

        .auth-input:focus {
          border-color: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }

        .auth-submit {
          transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
        }

        .auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .auth-submit:active {
          transform: translateY(0);
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes drift {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
  )
}

const styles = {
  container: {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    backgroundColor: 'var(--auth-bg)',
    overflowX: 'hidden' as const,
  } as React.CSSProperties,

  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    padding: '80px 40px',
    alignItems: 'center',
    minHeight: '100vh',
  } as React.CSSProperties,

  left: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  formWrapper: {
    width: '100%',
    maxWidth: '400px',
  } as React.CSSProperties,

  backLink: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '0.95rem',
    color: 'var(--auth-text)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '20px',
    transition: 'opacity 0.3s ease',
  } as React.CSSProperties,

  title: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '3rem',
    fontWeight: '400',
    margin: '0 0 10px 0',
    color: 'var(--auth-text)',
  } as React.CSSProperties,

  subtitle: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1rem',
    color: 'var(--auth-text)',
    margin: '0 0 30px 0',
    opacity: 0.9,
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginBottom: '20px',
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,

  label: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'var(--auth-text)',
  } as React.CSSProperties,

  input: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid var(--auth-input-border)',
    borderRadius: '8px',
    backgroundColor: 'var(--auth-input-bg)',
    color: 'var(--auth-text)',
    outline: 'none',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '1px solid',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  submitBtn: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#0b3b8f',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  switchText: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '0.9rem',
    color: 'var(--auth-text)',
    textAlign: 'center' as const,
    margin: '0',
  } as React.CSSProperties,

  switchLink: {
    color: 'var(--auth-text)',
    textDecoration: 'underline',
    fontWeight: 'bold',
  } as React.CSSProperties,
}
