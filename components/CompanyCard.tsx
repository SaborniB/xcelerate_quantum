import React from 'react';
import { MapPin, Users, ExternalLink, Briefcase, Clock, DollarSign, AlertTriangle, CheckCircle, XCircle, TrendingDown, ArrowUpRight } from 'lucide-react';
import SparklineChart from './SparklineChart';

export interface CompanyData {
    id: number;
    name: string;
    logoColor: string;
    location: string;
    employees: string;
    website: string;
    ghostRisk: number;
    metrics: {
        jobsCount: number;
        remotePercent: number;
        avgAgeDays: number;
        salaryMin: string;
        salaryMax: string;
        trend: number;
        sources: { name: string; value: number }[];
        sparkline: number[];
    };
}

interface Props {
    company: CompanyData;
}

const getRiskConfig = (score: number) => {
    if (score < 0.3) return { color: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-200', label: 'Low Risk', icon: CheckCircle };
    if (score < 0.6) return { color: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-200', label: 'Moderate Risk', icon: TrendingDown };
    return { color: 'text-rose-600', bg: 'bg-rose-600', border: 'border-rose-200', label: 'High Risk', icon: XCircle };
};

const MetricBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const CompanyCard: React.FC<Props> = ({ company }) => {
    const risk = getRiskConfig(company.ghostRisk);
    const RiskIcon = risk.icon;

    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Identity */}
                <div className="lg:col-span-4 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold ${company.logoColor} shadow-md`}>
                            {company.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{company.name}</h3>
                            <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center mt-1">
                                {company.website} <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {company.location}</div>
                        <div className="flex items-center"><Users className="w-4 h-4 mr-2 text-gray-400" /> {company.employees} Employees</div>
                    </div>

                    <div className={`mt-auto p-4 rounded-lg bg-gray-50 border ${risk.border} border-opacity-60`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ghost Risk Score</span>
                            <RiskIcon className={`w-5 h-5 ${risk.color}`} />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-4xl font-black ${risk.color}`}>{(company.ghostRisk * 100).toFixed(0)}%</span>
                            <span className={`text-sm font-medium ${risk.color}`}>{risk.label}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Stats */}
                <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                                <Briefcase className="w-4 h-4 mr-2 text-blue-500" /> Active Posts
                            </div>
                            <span className="text-gray-900 font-semibold">{company.metrics.jobsCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-amber-500" /> Avg. Post Age
                            </div>
                            <span className="text-gray-900 font-semibold">{company.metrics.avgAgeDays} days</span>
                        </div>
                         <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2 text-emerald-500" /> Salary Range
                            </div>
                            <span className="text-gray-900 font-semibold">{company.metrics.salaryMin} - {company.metrics.salaryMax}</span>
                        </div>
                     </div>
                     <div className="mt-6">
                         <SparklineChart data={company.metrics.sparkline} trend={company.metrics.trend} />
                     </div>
                </div>

                {/* Right: Sources */}
                <div className="lg:col-span-4 flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                         <ArrowUpRight className="w-3 h-3 mr-1" /> Primary Sources
                    </h4>
                    {company.metrics.sources.map((source, idx) => (
                        <MetricBar 
                            key={idx}
                            label={source.name}
                            value={source.value}
                            colorClass={idx === 0 ? 'bg-blue-500' : 'bg-purple-500'}
                        />
                    ))}
                    <button className="mt-4 w-full py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors border border-gray-200">
                        View Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyCard;