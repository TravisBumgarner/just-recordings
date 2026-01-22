import { Box } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import Router from './components/Router'
import ScrollToTop from './components/ScrollToTop'
import useHealthCheck from './hooks/useHealthCheck'
import useLoadUserIntoState from './hooks/useLoadUserIntoState'
import { logger } from './services/logging'
import Loading from './sharedComponents/Loading'
import Message from './sharedComponents/Message'
import RenderModal from './sharedComponents/Modal'
import useGlobalStore from './store'
import { isElectron } from './utils/electron'
import { AppThemeProvider, Z_INDICES } from '@just-recordings/shared/styles'

const queryClient = new QueryClient()

function App() {
  useLoadUserIntoState()
  const { isLoading, isHealthy } = useHealthCheck()
  const loadingUser = useGlobalStore((state) => state.loadingUser)

  if (!isHealthy) {
    logger.error('Backend is unhealthy')

    return (
      <Message
        color="error"
        message="The backend is currently unavailable."
        callback={() => window.location.reload()}
        callbackText="Retry"
      />
    )
  }

  if (loadingUser || isLoading) {
    return (
      <Box
        sx={{
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          position: 'fixed',
          zIndex: Z_INDICES.APP_LOADING,
          backgroundColor: 'background.paper',
        }}
      >
        <Loading />
      </Box>
    )
  }

  // Hide footer in desktop app to save vertical space in the smaller window
  const showFooter = !isElectron()

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Router />
      {showFooter && <Footer />}
      <RenderModal />
    </QueryClientProvider>
  )
}

const WrappedApp = () => {
  return (
    <BrowserRouter>
      <AppThemeProvider>
        <App />
        <ScrollToTop />
      </AppThemeProvider>
    </BrowserRouter>
  )
}

export { App }
export default WrappedApp
