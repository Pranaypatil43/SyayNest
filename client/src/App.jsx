import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ListingsPage from './pages/ListingsPage';
import ShowPage from './pages/ShowPage';
import NewListingPage from './pages/NewListingPage';
import EditListingPage from './pages/EditListingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/listings" replace />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/new" element={<NewListingPage />} />
            <Route path="/listings/:id" element={<ShowPage />} />
            <Route path="/listings/:id/edit" element={<EditListingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
