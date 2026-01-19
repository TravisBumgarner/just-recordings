import Router from './components/Router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Footer from './components/Footer';
import RenderModal from './sharedComponents/Modal';
import { BrowserRouter } from 'react-router-dom';
import AppThemeProvider from './styles/Theme';
import ScrollToTop from './components/ScrollToTop';

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Router />
      <Footer />
      <RenderModal />
    </QueryClientProvider>
  );
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


export default WrappedApp;
