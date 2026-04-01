import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout      from './components/Layout'
import FilesPage   from './pages/FilesPage'
import FileDetailPage from './pages/FileDetailPage'
import UploadPage  from './pages/UploadPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"             element={<Navigate to="/files" replace />} />
          <Route path="/files"        element={<FilesPage />} />
          <Route path="/files/:id"    element={<FileDetailPage />} />
          <Route path="/upload"       element={<UploadPage />} />
          <Route path="/contact"      element={<ContactPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
