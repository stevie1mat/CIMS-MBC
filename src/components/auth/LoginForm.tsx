'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import styles from '@/app/page.module.css'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form className={styles.form} action={formAction}>
      {state?.error && (
        <div className={styles.errorAlert}>
          {state.error}
        </div>
      )}

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>EMAIL</label>
        <input 
          type="email" 
          name="email"
          placeholder="hello@example.com" 
          className={styles.input} 
          required 
          disabled={isPending}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            name="password"
            placeholder="••••••••" 
            className={styles.input} 
            required 
            disabled={isPending}
          />
          <button 
            type="button" 
            onClick={togglePasswordVisibility} 
            className={styles.eyeButton}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
