import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../consts'
import HomeChrome from '../pages/Home/Chrome'
import HomeDesktop from '../pages/Home/Desktop'
import HomeWeb from '../pages/Home/Web'
import LandingPageChrome from '../pages/LandingPage/Chrome'
import LandingPageDesktop from '../pages/LandingPage/Desktop'
import LandingPageHome from '../pages/LandingPage/Web'
import Settings from '../pages/Settings'
import useGlobalStore from '../store'

const TermsOfService = lazy(async () => await import('../pages/TermsOfService'))
const PrivacyPolicy = lazy(async () => await import('../pages/PrivacyPolicy'))
const ReleaseNotes = lazy(async () => await import('../pages/ReleaseNotes'))
const Feedback = lazy(async () => await import('../pages/Feedback'))
const Login = lazy(async () => await import('../pages/Login'))
const Error500 = lazy(async () => await import('../pages/Error500'))
const Error404 = lazy(async () => await import('../pages/Error404'))
const Signup = lazy(async () => await import('../pages/Signup'))
const Logout = lazy(async () => await import('../pages/Logout'))
const PasswordReset = lazy(async () => await import('../pages/PasswordReset'))

import {
  createUploader,
  RecorderDatabase,
  RecorderService,
  UploadManager,
} from '@just-recordings/recorder'
import { useMemo } from 'react'
import FloatingControls from '../pages/FloatingControls'
import RecordingViewer from '../pages/RecordingViewer'
import SharedRecordingViewer from '../pages/SharedRecordingViewer'
import UploadQueue from '../pages/UploadQueue'
import { createTokenGetter } from '../utils/createTokenGetter'

const AnonymousRoute = () => {
  const appUser = useGlobalStore((state) => state.appUser)
  return !appUser ? <Outlet /> : <Navigate to="/" />
}

const MemberRoute = () => {
  const appUser = useGlobalStore((state) => state.appUser)
  return appUser ? <Outlet /> : <Navigate to="/login" />
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface HomeRouteProps {
  recorderService: RecorderService
  uploadManager: UploadManager
  isElectron: boolean
  isChromeExtension: boolean
}

const HomeRoute = ({ recorderService, uploadManager, isElectron, isChromeExtension }: HomeRouteProps) => {
  const appUser = useGlobalStore((state) => state.appUser)

  if (isChromeExtension) {
    return appUser ? (
      <HomeChrome recorderService={recorderService} uploadManager={uploadManager} />
    ) : (
      <LandingPageChrome />
    )
  }

  if (isElectron) {
    return appUser ? (
      <HomeDesktop recorderService={recorderService} uploadManager={uploadManager} />
    ) : (
      <LandingPageDesktop />
    )
  }

  return appUser ? (
    <HomeWeb recorderService={recorderService} uploadManager={uploadManager} />
  ) : (
    <LandingPageHome />
  )
}

const Router = ({ isElectron, isChromeExtension }: { isElectron: boolean; isChromeExtension: boolean }) => {
  const db = useMemo(() => new RecorderDatabase(), [])
  const recorderService = useMemo(() => new RecorderService(db), [db])
  const tokenGetter = useMemo(() => createTokenGetter(), [])
  const uploader = useMemo(() => createUploader(API_BASE_URL, tokenGetter), [tokenGetter])
  const uploadManager = useMemo(() => new UploadManager(db, uploader), [db, uploader])
  // Initialize upload manager on app load to resume any pending uploads
  useEffect(() => {
    uploadManager.initialize()
  }, [uploadManager])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route
          path={ROUTES.home.href()}
          element={
            <HomeRoute
              isElectron={isElectron}
              isChromeExtension={isChromeExtension}
              recorderService={recorderService}
              uploadManager={uploadManager}
            />
          }
        />
        <Route path={ROUTES.recordingViewer.href()} element={<RecordingViewer />} />
        <Route
          path={ROUTES.uploadQueue.href()}
          element={<UploadQueue uploadManager={uploadManager} />}
        />
        <Route path={ROUTES.floatingControls.href()} element={<FloatingControls />} />
        <Route path={ROUTES.sharedRecording.href()} element={<SharedRecordingViewer />} />

        <Route path={ROUTES.tos.href()} element={<TermsOfService />} />
        <Route path={ROUTES.privacy.href()} element={<PrivacyPolicy />} />
        <Route path={ROUTES.releaseNotes.href()} element={<ReleaseNotes />} />
        <Route path={ROUTES.feedback.href()} element={<Feedback />} />

        <Route path={ROUTES.passwordReset.href()} element={<PasswordReset />} />

        {/* Protected routes */}
        <Route element={<MemberRoute />}>
          <Route path={ROUTES.logout.href()} element={<Logout />} />
          <Route path={ROUTES.settings.href()} element={<Settings />} />
        </Route>

        {/* Public only Routes */}
        <Route element={<AnonymousRoute />}>
          <Route path={ROUTES.login.href()} element={<Login />} />
          <Route path={ROUTES.signup.href()} element={<Signup />} />
        </Route>

        <Route path={ROUTES.error500.href()} element={<Error500 />} />
        <Route path={ROUTES.error404.href()} element={<Error404 />} />
        <Route path="*" element={<Navigate to={ROUTES.error404.href()} />} />
      </Routes>
    </Suspense>
  )
}

export default Router
