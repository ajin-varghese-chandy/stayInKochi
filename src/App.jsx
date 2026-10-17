import useAuthListener from './hooks/useAuthListener'
import AppRoutes from './routes/AppRoutes'

function App() {
  // Sync Firebase auth state into Redux once at app start.
  useAuthListener()

  return <AppRoutes />
}

export default App
