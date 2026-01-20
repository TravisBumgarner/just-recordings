import { useMemo } from 'react'
import { CssBaseline } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import { RecorderService, createUploader } from '@just-recordings/recorder'
import Home from './pages/Home'
import Recording from './pages/Recording'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function App() {
  const recorderService = useMemo(() => new RecorderService(), [])
  const uploader = useMemo(() => createUploader(API_BASE_URL, true), [])

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/recording"
          element={<Recording recorderService={recorderService} uploader={uploader} />}
        />
      </Routes>
    </>
  )
}

export default App
