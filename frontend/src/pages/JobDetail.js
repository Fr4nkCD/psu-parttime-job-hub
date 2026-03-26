import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import bgImage from '../assets/home-bg-2.jpg';
import dummyJobs from '../components/dummyJobs';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applied, setApplied] = useState(false);

    const job = dummyJobs.find((j) => j.id === parseInt(id));

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Job not found.</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pt-24 pb-16 px-8 overflow-hidden">

            {/* Blurred Background */}
            <div
                className="absolute inset-0 scale-110"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(6px)',
                }}
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/jobs')}
                    className="text-white mb-4 flex items-center gap-2 hover:underline"
                >
                    ← Back to Jobs
                </button>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-8 flex gap-8">

                    {/* Left — Job Info */}
                    <div className="flex-1">

                        {/* Status Badge */}
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            job.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {job.isOpen ? '🟢 Open' : '⚫ Closed'}
                        </span>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-4">{job.title}</h1>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
                            <p>💵 Pay: ฿{job.pay}</p>
                            <p>📅 Date: {job.date}</p>
                            <p>📍 Location: {job.location}</p>
                            <p>🕛 Hours: {job.hours}</p>
                        </div>

                        {/* Description */}
                        <h2 className="font-semibold text-gray-800 mb-2">Job Description</h2>
                        <p className="text-sm text-gray-600 mb-6">{job.description}</p>

                        {/* Schedule */}
                        <h2 className="font-semibold text-gray-800 mb-2">Work Schedule</h2>
                        <ul className="text-sm text-gray-600 space-y-1 mb-6">
                            {job.schedule.map((s, i) => (
                                <li key={i}>• {s}</li>
                            ))}
                        </ul>

                    </div>{/* End Left */}

                    {/* Right Sidebar */}
                    <div className="w-72 flex-shrink-0 bg-white/60 backdrop-blur-sm rounded-xl p-2">

                        {/* Job Image */}
                        <div className="h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                            {job.image ? (
                                <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                </div>
                            )}
                        </div>

                        {/* Posted By */}
                        <p className="text-xs text-gray-500 mb-1">{job.postedDate}</p>
                        <p className="text-xs text-gray-500 mb-4">Posted by: {job.postedBy}</p>

                        {/* Applicant Count */}
                        <p className="text-center font-semibold text-gray-700 mb-3">
                            {job.applicants}/{job.capacity} Applied
                        </p>

                        {/* Apply Button */}
                        {job.isOpen ? (
                            <button
                                onClick={() => setApplied(!applied)}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                                    applied ? 'bg-gray-400 cursor-default' : 'bg-psu-accent hover:bg-blue-700'
                                }`}
                            >
                                {applied ? '✓ Applied' : 'Apply Now'}
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full py-3 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed"
                            >
                                Closed
                            </button>
                        )}

                        {applied && (
                            <p className="text-xs text-center text-gray-500 mt-2">
                                To cancel, please contact staff directly.
                            </p>
                        )}

                    </div>{/* End Right Sidebar */}

                </div>{/* End flex container */}

            </div>{/* End Content */}

        </div>/* End outer */
    );
}

export default JobDetail;