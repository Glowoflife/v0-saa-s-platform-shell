export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('tf_access_token')
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    }
  })

  if (response.status === 401) {
    // Try to refresh
    const refreshToken = localStorage.getItem('tf_refresh_token')
    if (!refreshToken) {
      window.location.href = 'https://theformulator.ai'
      return response
    }

    const refreshResponse = await fetch('https://api.theformulator.ai/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!refreshResponse.ok) {
      localStorage.removeItem('tf_access_token')
      localStorage.removeItem('tf_refresh_token')
      localStorage.removeItem('tf_user')
      window.location.href = 'https://theformulator.ai'
      return response
    }

    const data = await refreshResponse.json()
    localStorage.setItem('tf_access_token', data.access_token)
    localStorage.setItem('tf_refresh_token', data.refresh_token)

    // Retry original request with new token
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`,
        ...options.headers,
      }
    })
  }

  return response
}
