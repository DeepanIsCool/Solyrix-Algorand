import { SnackbarProvider } from 'notistack'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/common/Layout'
import Home from './pages/Home'
import MarketplaceUnified from './pages/MarketplaceUnified';
import CreateContext from './pages/CreateContext'
import Profile from './pages/Profile'
import Governance from './pages/Governance'


export default function App() {

  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<MarketplaceUnified />} />
            <Route path="/create-context" element={<CreateContext />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/governance" element={<Governance />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </SnackbarProvider>
  )
}
