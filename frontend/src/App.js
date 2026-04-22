import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import Footer from './components/Footer';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobForm from './pages/admin/AdminJobForm';
import AdminApplicants from './pages/admin/AdminApplicants';
import AdminEvaluate from './pages/admin/AdminEvaluate';

// This component handles the animation logic
function AnimatedRoutes() {
  const location = useLocation();

  return (
    /* mode="wait" ensures the old page finishes exiting before the new one enters */
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/jobs/new" element={<AdminJobForm />} />
        <Route path="/admin/jobs/:id/edit" element={<AdminJobForm />} />
        <Route path="/admin/jobs/:id/applicants" element={<AdminApplicants />} />
        <Route path="/admin/applications/:applicationId/evaluate" element={<AdminEvaluate />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className='flex flex-col min-h-screen'>
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