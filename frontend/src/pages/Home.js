import { Link } from 'react-router-dom';
import bgImage from '../assets/home-bg-1.jpg';

function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 1. Background Image Layer */}
      <div
        className="absolute inset-0 z-0 blur-lg scale-105" 
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 2. Dark Overlay Layer */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* 3. Hero Content Layer */}
      <div className="relative z-20 text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-2xl">
          Find Jobs at PSU Phuket
        </h1>
        <p className="text-xl mb-10 text-white/90 drop-shadow-md">
          A hub for part-time jobs and social activities for all PSU students
        </p>
        <Link
          to="/jobs"
          className="bg-psu-accent hover:bg-blue-700 text-white text-xl font-semibold px-12 py-4 rounded-lg transition shadow-xl"
        >
          Search Jobs
        </Link>
      </div>
    </div>
  );
}

export default Home;