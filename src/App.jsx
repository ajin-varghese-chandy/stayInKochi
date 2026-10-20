import useAuthListener from './hooks/useAuthListener'
import AppRoutes from './routes/AppRoutes'
import PaymentSheet from './components/common/PaymentSheet'

function App() {
  // Sync Firebase auth state into Redux once at app start.
  useAuthListener()

  return (
    <>
      <AppRoutes />
      {/* Checkout sheet, opened by services/paymentGateway */}
      <PaymentSheet />
    </>
  )
}

export default App
