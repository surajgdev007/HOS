import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0d0d0d',
              color: '#e8e8e8',
              border: '1px solid #222',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#3cff83', secondary: '#030303' },
            },
            error: {
              iconTheme: { primary: '#ff3b5b', secondary: '#030303' },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
