import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const emptyForm = {
    title: '',
    organization_name: '',
    description: '',
    location_type: '',
    job_type: 'EXTERNAL',
    compensation_amount: '',
    required_amount: '',
    status: 'OPEN',
    academic_term: '',
    academic_year: '',
    poster_image_url: '',
    line_group_url: '',
};

function AdminJobForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            fetch(`http://127.0.0.1:8000/api/jobs/${id}/`)
                .then((res) => res.json())
                .then((data) => {
                    setForm({
                        title: data.title || '',
                        organization_name: data.organization_name || '',
                        description: data.description || '',
                        location_type: data.location_type || '',
                        job_type: data.job_type || 'EXTERNAL',
                        compensation_amount: data.compensation_amount || '',
                        required_amount: data.required_amount || '',
                        status: data.status || 'OPEN',
                        academic_term: data.academic_term || '',
                        academic_year: data.academic_year || '',
                        poster_image_url: data.poster_image_url || '',
                        line_group_url: data.line_group_url || '',
                    });
                    setLoading(false);
                })
                .catch(() => {
                    setError('Failed to load job.');
                    setLoading(false);
                });
        }
    }, [id, isEditing]);

    // 1. Improved handleChange to handle numbers correctly
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // If it's a number input, try to store it as a number, otherwise stay as string
        const formattedValue = type === 'number' && value !== '' ? parseFloat(value) : value;
        setForm({ ...form, [name]: formattedValue });
    };

    // 2. Improved handleSubmit to show ACTUAL errors from Django
    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        try {
            const url = isEditing
                ? `http://127.0.0.1:8000/api/jobs/${id}/`
                : 'http://127.0.0.1:8000/api/jobs/';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                // This captures validation errors (e.g., "Academic Year is required")
                const errorMsg = Object.entries(data)
                    .map(([field, errors]) => `${field}: ${errors.join(' ')}`)
                    .join(' | ');
                throw new Error(errorMsg || 'Failed to save.');
            }

            navigate('/admin/jobs');
        } catch (err) {
            console.error("Save Error:", err);
            setError(err.message); // This will now show the actual field error
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: 'title', label: 'Job Title', type: 'text', full: true },
        { name: 'organization_name', label: 'Organization', type: 'text', full: true },
        { name: 'location_type', label: 'Location', type: 'text', full: true },
        { name: 'compensation_amount', label: 'Pay (฿)', type: 'number' },
        { name: 'required_amount', label: 'Required Staff', type: 'number' },
        { name: 'academic_term', label: 'Term', type: 'number' },
        { name: 'academic_year', label: 'Year', type: 'number' },
        { name: 'poster_image_url', label: 'Poster Image URL', type: 'text', full: true },
        { name: 'line_group_url', label: 'LINE Group URL', type: 'text', full: true },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="relative z-20">
                <div className="max-w-3xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/admin/jobs')}
                            className="text-white hover:underline text-sm"
                        >
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold text-white">
                            {isEditing ? 'Edit Job' : 'Add New Job'}
                        </h1>
                    </div>

                    {loading ? (
                        <p className="text-white text-center py-12">Loading...</p>
                    ) : (
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-8">

                            {error && (
                                <div className="bg-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {fields.map((field) => (
                                    <div key={field.name} className={field.full ? 'col-span-2' : 'col-span-1'}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/70"
                                        />
                                    </div>
                                ))}

                                {/* Job Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                                    <select
                                        name="job_type"
                                        value={form.job_type}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/70"
                                    >
                                        <option value="EXTERNAL">External</option>
                                        <option value="INTERNAL">Internal</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/70"
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="CLOSED">Closed</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/70 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="bg-psu-accent hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Job'}
                                </button>
                                <button
                                    onClick={() => navigate('/admin/jobs')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminJobForm;