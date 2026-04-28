import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';
import placeholder from '../assets/placeholder-image.jpg';
import psuEmblem from '../assets/PSU_Emblem.png';
import jsPDF from 'jspdf';

function StarDisplay({ value }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-sm ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}>
                    ★
                </span>
            ))}
        </div>
    );
}

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
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch student profile details
            const res = await fetch(
                `http://127.0.0.1:8000/api/students/?student_id=${student?.student_id}`,
                { headers }
            );
            const data = await res.json();
            const profile = Array.isArray(data) ? data[0] : data;
            setProfileData(profile);
            setFormData(profile);

            // 2. Fetch applications (includes nested evaluations from your ApplicationSerializer)
            const appRes = await fetch('http://127.0.0.1:8000/api/applications/', { headers });
            const apps = await appRes.json();
            const appsList = Array.isArray(apps) ? apps : (apps.results || []);
            setWorkHistory(appsList);

            // 3. Find current active job (Approved but not yet evaluated)
            const activeApp = appsList.find((a) => a.status === 'APPROVED' && !a.evaluation);
            if (activeApp) {
                const jobRes = await fetch(`http://127.0.0.1:8000/api/jobs/${activeApp.job}/`, { headers });
                const jobData = await jobRes.json();
                setCurrentJob({ ...jobData, applicationId: activeApp.id });
            }

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
            const res = await fetch(`http://127.0.0.1:8000/api/students/${profileData.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    religion: formData.religion,
                    allergies: formData.allergies,
                }),
            });
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

    const avgRating = (evaluation) => {
        if (!evaluation) return null;
        const total = evaluation.punctuality_rating + evaluation.responsibility_rating +
            evaluation.grooming_rating + evaluation.quality_rating;
        return (total / 4).toFixed(1);
    };

    const handleDownloadCertificate = (app) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 297;
        const pageHeight = 210;

        // --- Formal Theme Color (#1a3a6b) ---
        const psuBlue = [26, 58, 107];

        // --- 1. FORMAL BORDERS ---
        doc.setLineWidth(1.5);
        doc.setDrawColor(psuBlue[0], psuBlue[1], psuBlue[2]);
        doc.rect(10, 10, 277, 190); // Formal outer frame (Bottom at 200mm)

        doc.setLineWidth(0.2);
        doc.rect(12, 12, 273, 186); // Inner thin frame

        // --- 2. UNIVERSITY EMBLEM ---
        // Calculated for 662x888 (Aspect Ratio ~0.745)
        // Height: 24mm, Width: 17.88mm
        if (typeof psuEmblem !== 'undefined') {
            doc.addImage(psuEmblem, 'PNG', 139.56, 18, 17.88, 24);
        }

        // --- 3. HEADER TEXT ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(psuBlue[0], psuBlue[1], psuBlue[2]);
        doc.text("PRINCE OF SONGKLA UNIVERSITY", 148.5, 50, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("PHUKET CAMPUS | DIVISION OF STUDENT DEVELOPMENT", 148.5, 56, { align: 'center' });

        // --- 4. REDUCED MAIN TITLE ---
        doc.setFontSize(28); // Reduced from 36 for better vertical flow
        doc.setTextColor(psuBlue[0], psuBlue[1], psuBlue[2]);
        doc.text("CERTIFICATE OF COMPLETION", 148.5, 80, { align: 'center' });

        doc.setLineWidth(0.8);
        doc.line(80, 86, 217, 86);

        // --- 5. RECIPIENT INFO ---
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(16);
        doc.text("This is to certify that", 148.5, 105, { align: 'center' });

        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`${profileData.first_name} ${profileData.last_name}`, 148.5, 118, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`Student ID: ${profileData.student_id} | Faculty: ${profileData.faculty}`, 148.5, 126, { align: 'center' });

        // --- 6. ACHIEVEMENT & RATING ---
        doc.setFontSize(14);
        doc.text("has successfully completed the part-time work assignment for", 148.5, 142, { align: 'center' });

        doc.setFont("helvetica", "bold");
        doc.setTextColor(psuBlue[0], psuBlue[1], psuBlue[2]);
        doc.text(`"${app.job_title}"`, 148.5, 152, { align: 'center' });

        const avg = ((app.evaluation.punctuality_rating + app.evaluation.responsibility_rating +
            app.evaluation.quality_rating + app.evaluation.grooming_rating) / 4).toFixed(1);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Performance Appraisal Score: ${avg} / 5.0 (${app.evaluation.result_status})`, 148.5, 162, { align: 'center' });

        // --- 7. SIGNATURE BLOCK ---
        doc.setTextColor(30, 41, 59);
        doc.setLineWidth(0.5);
        doc.line(103.5, 180, 193.5, 180);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("(Mr. Sarawut Japrang)", 148.5, 185, { align: 'center' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Acting Head of Student Development & Alumni Relations", 148.5, 190, { align: 'center' });

        // --- 8. FIXED VALIDATION FOOTER ---
        // Moved to 196mm so it sits neatly INSIDE the 200mm border bottom edge
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`VALIDATED ELECTRONICALLY ON: ${new Date().toLocaleDateString('en-GB')} BY PSU PART-TIME JOB HUB`, 148.5, 196, { align: 'center' });

        doc.save(`PSU_Certificate_${profileData.student_id}.pdf`);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-white font-bold tracking-widest animate-pulse uppercase">Syncing Profile...</p>
        </div>
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="fixed inset-0 z-0 scale-110 blur-[8px]" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="fixed inset-0 bg-slate-900/20 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 max-w-5xl mx-auto flex flex-col gap-6 font-sans">

                    {/* Top Profile Card */}
                    <div className="bg-white/85 backdrop-blur-lg rounded-[2rem] shadow-2xl p-8 border border-white/40">
                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                            <div className="w-40 h-40 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                                <span className="text-6xl">👤</span>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Profile</h2>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Official University Record</p>
                                    </div>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition shadow-sm border border-blue-100">
                                            Edit Info
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 text-sm">
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Student ID</span>
                                            <span className="font-black text-slate-800">{profileData?.student_id}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Full Name</span>
                                            <span className="font-bold text-slate-700">{profileData?.first_name} {profileData?.last_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Faculty</span>
                                            <span className="font-bold text-slate-700">{profileData?.faculty}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Email</span>
                                            <span className="font-bold text-slate-700 truncate ml-4">{profileData?.email || student?.email}</span>
                                        </div>
                                        {isEditing ? (
                                            <div className="space-y-3 pt-1">
                                                <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-200 outline-none" value={formData.religion || ''} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} placeholder="Religion" />
                                                <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-200 outline-none" value={formData.allergies || ''} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="Allergies" />
                                                <div className="flex gap-2">
                                                    <button onClick={handleSave} className="bg-psu-blue text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Save</button>
                                                    <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Religion</span>
                                                    <span className="font-bold text-slate-700">{profileData?.religion || '-'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Allergies</span>
                                                    <span className="font-bold text-slate-700">{profileData?.allergies || '-'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Employment Card */}
                    {currentJob && (
                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-6 border-l-[12px] border-psu-blue overflow-hidden">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Employment</h2>
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-52 h-36 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                                    <img src={currentJob.poster_image_url || placeholder} alt="Job poster" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800 mb-2">{currentJob.title}</h3>
                                    <div className="flex gap-2 mb-4">
                                        <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">In Progress</span>
                                        <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">฿{currentJob.compensation_amount}</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {currentJob.schedules?.slice(0, 2).map((shift, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white/40 p-3 rounded-xl text-xs font-bold text-slate-600 border border-white/50">
                                                <span>📅 {new Date(shift.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                <span className="ml-auto text-slate-400 font-medium tracking-tight">{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/jobs/${currentJob.id}`)} className="bg-white border-2 border-slate-100 text-slate-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-psu-blue hover:text-psu-blue transition self-center md:self-start shadow-sm">Details</button>
                            </div>
                        </div>
                    )}

                    {/* Work History Section - FIXED: Removed redundant inner loop */}
                    <div className="bg-white/75 backdrop-blur-md rounded-[2rem] shadow-xl p-8 border border-white/40">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Work History & Professional Evaluations</h2>
                        {workHistory.length === 0 ? (
                            <p className="text-sm text-slate-400 font-medium italic">No employment records found in the transcript database.</p>
                        ) : (
                            <div className="space-y-4">
                                {workHistory.map((app) => {
                                    // Evaluation is nested directly inside the application object from backend
                                    const evaluation = app.evaluation;
                                    const avg = avgRating(evaluation);

                                    return (
                                        <div key={app.id} className="bg-white/50 border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-md hover:bg-white/70">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-base font-black text-slate-800 leading-tight">{app.job_title}</p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Application Date: {new Date(app.application_date).toLocaleDateString('en-GB')}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{app.status}</span>
                                            </div>

                                            {evaluation ? (
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <StarDisplay value={Math.round(avg)} />
                                                            <span className="text-xs font-black text-slate-700">{avg} / 5.0</span>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${evaluation.result_status === 'PASS' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>✓ {evaluation.result_status}</span>
                                                    </div>
                                                    <p className="text-xs italic text-slate-500 font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100 leading-relaxed">"{evaluation.comment}"</p>

                                                    {evaluation.result_status === 'PASS' && (
                                                        <button
                                                            onClick={() => handleDownloadCertificate(app)} // Pass the whole application object
                                                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                                        >
                                                            📄 Download Work Certificate
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2 italic">Performance Appraisal Pending</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PageTransition>
        </div>
    );
}

export default Profile;