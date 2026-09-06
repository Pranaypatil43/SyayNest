import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ListingsPage from './pages/ListingsPage';
import ShowPage from './pages/ShowPage';
import NewListingPage from './pages/NewListingPage';
import EditListingPage from './pages/EditListingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './index.css';

/**
 * HostRoute — only hosts can access this page.
 * - Not logged in  → /login
 * - Logged in as guest → /listings (with a message)
 * - Logged in as host  → render the page
 */
function HostRoute({ children }) {
  const { currentUser, loading, isHost } = useAuth();

  // Wait for session check before redirecting
  if (loading) return <div className="wl-spinner"><div className="wl-spin" /></div>;

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isHost)      return <Navigate to="/listings" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"              element={<Navigate to="/listings" replace />} />
            <Route path="/listings"      element={<ListingsPage />} />
            <Route path="/listings/:id"  element={<ShowPage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/signup"        element={<SignupPage />} />

            {/* Host-only routes */}
            <Route path="/listings/new"      element={<HostRoute><NewListingPage /></HostRoute>} />
            <Route path="/listings/:id/edit" element={<HostRoute><EditListingPage /></HostRoute>} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
