import Router from './components/Router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/Header'
import Footer from './components/Footer'
import RenderModal from './sharedComponents/Modal'
import { BrowserRouter } from 'react-router-dom'
import AppThemeProvider from './styles/Theme'
import ScrollToTop from './components/ScrollToTop'
import useLoadUserIntoState from './hooks/useLoadUserIntoState'
import useHealthCheck from './hooks/useHealthCheck'
import { logger } from './services/logging'
import Message from './sharedComponents/Message'
import useGlobalStore from './store'
import { Box } from '@mui/material'
import { Z_INDICES } from './styles/styleConsts'
import Loading from './sharedComponents/Loading'

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

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Router />
      <Footer />
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

export default WrappedApp
