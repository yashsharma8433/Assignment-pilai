import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/Layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Students from '@/pages/Students'
import Analytics from '@/pages/Analytics'
import Logs from '@/pages/Logs'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="logs" element={<Logs />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181b2e',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
