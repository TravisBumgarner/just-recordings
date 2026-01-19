import { useMemo, useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { RecorderService, RecorderDatabase, UploadManager, createUploader } from '@just-recordings/recorder';
import Home from './pages/Home';
import Recording from './pages/Recording';
import RecordingsList from './pages/RecordingsList';
import RecordingViewer from './pages/RecordingViewer';
import UploadQueue from './pages/UploadQueue';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const db = useMemo(() => new RecorderDatabase(), []);
  const recorderService = useMemo(() => new RecorderService(db), [db]);
  const uploader = useMemo(() => createUploader(API_BASE_URL, true), []);
  const uploadManager = useMemo(() => new UploadManager(db, uploader), [db, uploader]);

  // Initialize upload manager on app load to resume any pending uploads
  useEffect(() => {
    uploadManager.initialize();
  }, [uploadManager]);

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home uploadManager={uploadManager} />} />
        <Route path="/recording" element={<Recording recorderService={recorderService} uploadManager={uploadManager} />} />
        <Route path="/recordings" element={<RecordingsList />} />
        <Route path="/recordings/:id" element={<RecordingViewer />} />
        <Route path="/uploads" element={<UploadQueue uploadManager={uploadManager} />} />
      </Routes>
    </>
  );
}

export default App;
