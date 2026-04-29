import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/jobs/${job.id}`)}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer flex flex-col h-full"
    >
      <div className="h-44 bg-gray-200 overflow-hidden relative">
        {job.image ? (
          <img
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-gray-800 font-bold text-lg mb-3 leading-tight group-hover:text-[#002B5B] transition-colors line-clamp-2">
          {job.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p className="flex items-center gap-2">💵 <span className="font-medium text-gray-800">฿{job.pay}</span></p>
          <p className="flex items-center gap-2">🗓️ {job.date}</p>
          <p className="flex items-center gap-2 line-clamp-1">📍 {job.location}</p>
        </div>

        <div className="mt-auto">
          <span
            className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-full tracking-wider shadow-sm ${
              job.isOpen
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {job.isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default JobCard;