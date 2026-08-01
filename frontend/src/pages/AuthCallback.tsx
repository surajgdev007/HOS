import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store'
import { LoadingScreen } from '../components/ui/LoadingScreen'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { checkAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=oauth_failed')
      return
    }

    if (token) {
      localStorage.setItem('accessToken', token)
      checkAuth().then(() => {
        navigate('/dashboard')
      }).catch(() => {
        navigate('/login?error=auth_failed')
      })
    } else {
      navigate('/login')
    }
  }, [searchParams, checkAuth, navigate])

  return <LoadingScreen />
}
