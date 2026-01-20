import { createUploader, RecorderService } from '@just-recordings/recorder'
import { CssBaseline } from '@mui/material'
import { useMemo } from 'react'
import { Route, Routes } from 'react-router-dom'
import Recording from './pages/Recording'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function App() {
  const recorderService = useMemo(() => new RecorderService(), [])
  const uploader = useMemo(() => createUploader(API_BASE_URL, true), [])

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Recording recorderService={recorderService} uploader={uploader} />} />
      </Routes>
    </>
  )
}

export default App
