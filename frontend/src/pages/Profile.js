import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';
import placeholder from '../assets/placeholder-image.jpg'
import { useAuth } from '../context/AuthContext';

function Profile() {
    const navigate = useNavigate();
    const { student, getToken } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [currentJob, setCurrentJob] = useState(null);
    const [workHistory, setWorkHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = getToken();

            // Fetch student profile
            const res = await fetch(
                `http://127.0.0.1:8000/api/students/?student_id=${student?.student_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            const profile = Array.isArray(data) ? data[0] : data;
            setProfileData(profile);
            setFormData(profile);

            // Fetch applications to find current job
            const appRes = await fetch(
                'http://127.0.0.1:8000/api/applications/',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const apps = await appRes.json();

            // Current job = approved application
            const activeApp = apps.find((a) => a.status === 'APPROVED');
            if (activeApp) {
                const jobRes = await fetch(
                    `http://127.0.0.1:8000/api/jobs/${activeApp.job}/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const jobData = await jobRes.json();
                setCurrentJob(jobData);
            }

            // Work history = completed applications
            const completed = apps.filter((a) => a.status === 'APPROVED');
            setWorkHistory(completed);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const token = getToken();
            const res = await fetch(
                `http://127.0.0.1:8000/api/students/${profileData.id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        religion: formData.religion,
                        allergies: formData.allergies,
                    }),
                }
            );
            if (!res.ok) throw new Error('Failed to save.');
            const updated = await res.json();
            setProfileData(updated);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profileData);
        setIsEditing(false);
        setError(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white text-lg">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-0 scale-110 blur-[6px]"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 bg-black/30 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 max-w-5xl mx-auto flex flex-col gap-6">

                    {/* Profile Card */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                            {/* Avatar */}
                            <div className="w-40 h-40 rounded-full bg-psu-blue overflow-hidden flex items-center justify-center border-4 border-white shadow-lg flex-shrink-0">
                                <svg className="w-24 h-24 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-sm font-bold text-psu-accent hover:underline"
                                        >
                                            Edit Info
                                        </button>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">

                                    {/* Left — Fixed info */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Student ID</span>
                                            <span className="font-bold text-gray-800">{profileData?.student_id}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Full Name</span>
                                            <span className="text-gray-800">{profileData?.first_name} {profileData?.last_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Faculty</span>
                                            <span className="text-gray-800">{profileData?.faculty}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Major</span>
                                            <span className="text-gray-800">{profileData?.major}</span>
                                        </div>
                                    </div>

                                    {/* Right — Editable info */}
                                    <div className="space-y-3">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-gray-400 uppercase font-bold text-[10px] block mb-1">Religion</label>
                                                    <input
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent"
                                                        value={formData.religion || ''}
                                                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                                        placeholder="Religion"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 uppercase font-bold text-[10px] block mb-1">Allergies</label>
                                                    <input
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent"
                                                        value={formData.allergies || ''}
                                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                                        placeholder="Allergies"
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={saving}
                                                        className="bg-psu-blue text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md disabled:opacity-50"
                                                    >
                                                        {saving ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <span className="text-gray-400 uppercase font-bold text-[10px]">Email</span>
                                                    <span className="text-gray-800">{profileData?.user ? student?.email || '-' : '-'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <span className="text-gray-400 uppercase font-bold text-[10px]">Religion</span>
                                                    <span className="text-gray-800">{profileData?.religion || '-'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <span className="text-gray-400 uppercase font-bold text-[10px]">Allergies</span>
                                                    <span className="text-gray-800">{profileData?.allergies || '-'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Job Card */}
                    {currentJob && (
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 border-l-8 border-psu-blue">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                                Current Employment
                            </h2>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-48 h-32 rounded-xl overflow-hidden bg-gray-200 shadow-sm flex-shrink-0">
                                    {currentJob.poster_image_url ? (
                                        <img
                                            src={currentJob.poster_image_url}
                                            alt={currentJob.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={placeholder}
                                            alt={currentJob.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-gray-800 text-lg mb-2">{currentJob.title}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                            In Progress
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 justify-center md:justify-start">
                                        <p>💵 ฿{currentJob.compensation_amount}</p>
                                        <p>📍 {currentJob.location_type}</p>
                                        <p>📅 {currentJob.academic_term}/{currentJob.academic_year}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/jobs/${currentJob.id}`)}
                                    className="bg-white border-2 border-psu-blue text-psu-blue px-6 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Work History */}
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                            Work History
                        </h2>
                        {workHistory.length === 0 ? (
                            <p className="text-sm text-gray-400">No work history yet.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {workHistory.map((app) => (
                                    <div
                                        key={app.id}
                                        className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800">{app.job_title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Status: {app.status}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default Profile;