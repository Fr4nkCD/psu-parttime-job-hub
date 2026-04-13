import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-psu-blue">
      {/* 1. Static Background Layer - Outside PageTransition to avoid the 'y' slide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-0 blur-lg scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 2. Fixed Overlay - Stays put with the background */}
      <div className="fixed inset-0 bg-black/40 z-10" />

      {/* 3. Animated Content Layer - This handles the sliding effect */}
      <PageTransition>
        <div className="relative z-20 min-h-screen flex items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-2xl">
              Find Jobs in the Phuket Campus
            </h1>
            <p className="text-xl mb-10 text-white/90 drop-shadow-md">
              A hub for part-time jobs and social activities for all PSU Phuket students
            </p>
            <Link
              to="/jobs"
              className="bg-psu-accent hover:bg-psu-blue-light text-white text-xl font-semibold px-12 py-4 rounded-xl transition shadow-xl inline-block"
            >
              Search Jobs
            </Link>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}

export default Home;