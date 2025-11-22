import React, { useState } from 'react';
import { Sparkles, Loader, AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { auditJobPost, AuditResult } from '../services/gemini';

interface Props {
    onAuditComplete: (result: AuditResult, jobData: any) => void;
}

const AuditForm: React.FC<Props> = ({ onAuditComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        requirements: '',
        location: '',
        type: 'Full-time',
        industry: 'Technology'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.requirements) {
            setError("Job Title and Requirements are mandatory.");
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const result = await auditJobPost(
                formData.title,
                formData.company,
                formData.requirements,
                formData.location,
                formData.type,
                formData.industry
            );
            onAuditComplete(result, formData);
        } catch (err: any) {
            setError(err.message || "Failed to audit job post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-white p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold flex items-center text-gray-900">
                    <div className="p-3 bg-indigo-50 rounded-xl mr-4">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    New Job Audit
                </h2>
                <p className="text-gray-500 mt-2 ml-1">
                    Paste job details below to uncover hidden red flags and calculate the Ghost Score.
                </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                    <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-lg flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:bg-white outline-none"
                            placeholder="e.g. Senior Product Manager"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:bg-white outline-none"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description / Requirements <span className="text-rose-500">*</span></label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows={8}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none focus:bg-white outline-none"
                        placeholder="Paste the full job description here including responsibilities and qualifications..."
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Info className="w-3 h-3 mr-1" /> The more detail you provide, the more accurate the Ghost Score.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:bg-white outline-none"
                            placeholder="e.g. Remote, New York"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:bg-white outline-none"
                        >
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Freelance</option>
                            <option>Internship</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:bg-white outline-none"
                        >
                            <option>Technology</option>
                            <option>Finance</option>
                            <option>Healthcare</option>
                            <option>Education</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-[0.99] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {isLoading ? (
                        <>
                            <Loader className="w-6 h-6 mr-2 animate-spin" /> Analyzing Pattern Matches...
                        </>
                    ) : (
                        <>
                            Analyze Job Posting
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AuditForm;