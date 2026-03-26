import { useNavigate } from 'react-router-dom';

function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      {/* Job Image */}
      <div className="h-44 bg-gray-200 overflow-hidden">
        {job.image ? (
          <img
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="text-gray-800 font-semibold text-base mb-3 leading-snug">
          {job.title}
        </h3>
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p>💵 ฿{job.pay}</p>
          <p>📅 {job.date}</p>
          <p>📍 {job.location}</p>
        </div>
        {/* Status Badge at bottom */}
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            job.isOpen
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {job.isOpen ? '🟢 Open' : '⚫ Closed'}
        </span>
      </div>
    </div>
  );
}

export default JobCard;