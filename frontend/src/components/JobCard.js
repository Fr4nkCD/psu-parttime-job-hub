import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import placeholder from '../assets/placeholder-image.jpg';

function JobCard({ job }) {
  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.src = placeholder;
  };

  return (
    <motion.div
      onClick={() => navigate(`/jobs/${job.id}`)}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden cursor-pointer flex flex-col h-full"
    >
      <div className="h-44 bg-gray-200 overflow-hidden relative">
        <img
          // Use job.poster_image_url if that's your Django field name, or job.image
          src={job.image || placeholder} 
          alt={job.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-gray-800 font-bold text-lg mb-3 line-clamp-2 group-hover:text-psu-blue">
          {job.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p className="flex items-center gap-2">💵 <b>฿{job.pay}</b></p>
          <p className="flex items-center gap-2">🗓️ {job.date}</p>
          <p className="flex items-center gap-2 line-clamp-1">📍 {job.location}</p>
        </div>

        <div className="mt-auto">
          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${
            job.isOpen ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {job.isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
export default JobCard;