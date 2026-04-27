import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import useSmoothScroll from './hooks/useSmoothScroll';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobForm from './pages/admin/AdminJobForm';
import AdminApplicants from './pages/admin/AdminApplicants';
import AdminEvaluate from './pages/admin/AdminEvaluate';

import { RedirectIfLoggedIn, RequireAuth, RequireAdmin } from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import Register from './pages/Register';

// This component handles the animation logic
function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => {
        window.lenis?.resize();
      });
    }
  }, [location.pathname]);

  const routeKey = location.pathname.startsWith('/admin')
    ? 'admin-root'
    : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey} >
        {/* User routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Authorized Routes */}
        <Route path="/register" element={
          <RedirectIfLoggedIn>
            <Register />
          </RedirectIfLoggedIn>
        } />

        <Route path="/signin" element={
          <RedirectIfLoggedIn>
            <SignIn />
          </RedirectIfLoggedIn>
        } />

        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/new" element={<AdminJobForm />} />
          <Route path="jobs/:id/edit" element={<AdminJobForm />} />
          <Route path="jobs/:id/applicants" element={<AdminApplicants />} />
          <Route path="applications/:applicationId/evaluate" element={<AdminEvaluate />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  useSmoothScroll();

  return (
    <Router>
      <div className='flex flex-col min-h-screen'>
        <ScrollToTop />
        <Navbar />
        <main className='flex-1'>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;