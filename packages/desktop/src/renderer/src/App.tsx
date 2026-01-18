import { CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recording from './pages/Recording';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recording" element={<Recording recorderService={undefined as any} uploader={undefined as any} />} />
      </Routes>
    </>
  );
}

export default App;
