import { Box } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import Router from './components/Router'
import ScrollToTop from './components/ScrollToTop'
import useHealthCheck from './hooks/useHealthCheck'
import useLoadUserIntoState from './hooks/useLoadUserIntoState'
import { log } from '@just-recordings/shared'
import Loading from './sharedComponents/Loading'
import Message from './sharedComponents/Message'
import RenderModal from './sharedComponents/Modal'
import useGlobalStore from './store'
import { Z_INDICES } from './styles/styleConsts'
import AppThemeProvider from './styles/Theme'
import { isChromeExtensionCheck } from './utils/chromeExtension'
import { isElectronCheck } from './utils/electron'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

function App() {
  useLoadUserIntoState()
  const { isLoading, isHealthy } = useHealthCheck()
  const loadingUser = useGlobalStore((state) => state.loadingUser)

  if (!isHealthy) {
    log.error('Backend is unhealthy')

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

  // Hide header/footer in desktop app and chrome extension to save vertical space
  const isElectron = isElectronCheck()
  const isChromeExtension = isChromeExtensionCheck()
  const showChrome = !isElectron && !isChromeExtension

  return (
    <>
      {showChrome && <Header />}
      <Router isElectron={isElectron} isChromeExtension={isChromeExtension} />
      {showChrome && <Footer />}
      <RenderModal />
    </>
  )
}

interface WrappedAppProps {
  RouterComponent?: React.ComponentType<{ children: React.ReactNode }>
}

const WrappedApp = ({ RouterComponent }: WrappedAppProps) => {
  const RouterProvider = RouterComponent ?? (({ children }: { children: React.ReactNode }) => (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {children}
    </BrowserRouter>
  ))

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <AppThemeProvider>
          <App />
          <ScrollToTop />
        </AppThemeProvider>
      </RouterProvider>
    </QueryClientProvider>
  )
}

export { App }
export default WrappedApp
