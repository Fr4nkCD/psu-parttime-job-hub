import { useState } from 'react';
import bgImage from '../assets/home-bg-1.jpg';
import JobCard from '../components/JobCard';

import dummyJobs from '../components/dummyJobs';

function Jobs() {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredJobs = dummyJobs.filter((job) => {
        const matchesType = filter === 'all' || job.type === filter;
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="relative min-h-screen pt-24 pb-16 px-8 overflow-hidden">

            {/* Blurred Background */}
            <div
                className="absolute inset-0 z-0 blur-lg scale-105"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Single Container for everything */}
            <div className="relative z-10 max-w-6xl mx-auto bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6">

                {/* Search Title */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Jobs</h2>

                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search job title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent mb-4"
                />

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {['all', 'internal', 'external'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition ${filter === type
                                    ? 'bg-psu-accent text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {type === 'all' ? 'All' : type === 'internal' ? 'Internal' : 'External'}
                        </button>
                    ))}
                </div>

                {/* Job Grid */}
                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-20">
                        No jobs found.
                    </div>
                )}

            </div>
        </div>
    );
}

export default Jobs;