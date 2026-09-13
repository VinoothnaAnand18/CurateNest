import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyLibrary from './pages/MyLibrary';
import BookDetails from './pages/BookDetails';
import BookForm from './pages/BookForm';
import CurrentlyReading from './pages/CurrentlyReading';
import Wishlist from './pages/Wishlist';
import AiAssistant from './pages/AiAssistant';
import RagChat from './pages/RagChat';
import Recommendations from './pages/Recommendations';
import ReadingInsights from './pages/ReadingInsights';
import ReadingGoals from './pages/ReadingGoals';
import NotesReviews from './pages/NotesReviews';
import Settings from './pages/Settings';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Guard (Redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected App Pages */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/library" element={<MyLibrary />} />
                <Route path="/books/new" element={<BookForm />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/books/:id/edit" element={<BookForm />} />
                <Route path="/currently-reading" element={<CurrentlyReading />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/ai-assistant" element={<AiAssistant />} />
                <Route path="/rag-chat" element={<RagChat />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/insights" element={<ReadingInsights />} />
                <Route path="/goals" element={<ReadingGoals />} />
                <Route path="/notes" element={<NotesReviews />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
