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
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          className={styles.input} 
          required 
          disabled={isPending}
        />
      </div>
      <div className={styles.inputGroup}>
        <input 
          type={showPassword ? "text" : "password"} 
          name="password"
          placeholder="Password" 
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
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className={styles.rememberMeGroup}>
        <label className={styles.toggleSwitch}>
          <input type="checkbox" className={styles.toggleInput} name="remember" />
          <span className={styles.toggleSlider}></span>
        </label>
        <span className={styles.rememberMeText}>Remember me</span>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'SIGNING IN...' : 'SIGN IN'}
      </button>
    </form>
  )
}
