import React, { useEffect, useState, useCallback } from 'react';
import {
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Activity,
    DollarSign,
    Settings,
    Database,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { AdminApi, Service } from '../../services/admin-api';

const AdminServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unit_cost: 0,
        is_unit_based: true,
        minimum_purchase: 100
    });

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminApi.getServices(limit, page * limit);
            console.log('Services data:', data);
            // Handle both array and object with services property
            const servicesList = Array.isArray(data) ? data : (data.services || []);
            setAllServices(servicesList);
            setServices(servicesList);
        } catch (err: any) {
            console.error('Failed to fetch services:', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleCreate = async () => {
        try {
            if (!formData.name || formData.unit_cost < 0) {
                alert('Please provide a name and a valid unit cost.');
                return;
            }
            await AdminApi.createService(formData);
            setIsCreating(false);
            setFormData({ name: '', description: '', unit_cost: 0, is_unit_based: true, minimum_purchase: 100 });
            fetchServices();
        } catch (err: any) {
            alert('Failed to create service: ' + err.message);
        }
    };

    // Filter services by search
    const filteredServices = allServices.filter((svc: any) =>
        svc.name?.toLowerCase().includes(search.toLowerCase()) ||
        svc.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredServices.length / limit);
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Services</h1>
                    <p className="text-gray-500 text-sm">Define base platform capabilities and unit pricing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            className="bg-white border border-gray-200 text-[#00333e] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#00333e]/50"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-[#00333e] hover:bg-[#00333e]/90 text-white px-4 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Service
                    </button>
                </div>
            </div>

            {isCreating && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#00333e]">Add System Service</h2>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-[#00333e]"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Service Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10"
                                    placeholder="e.g. Transactional SMS"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Unit Cost (TShs)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10"
                                    value={formData.unit_cost}
                                    onChange={e => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Min Purchase Units</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10"
                                    value={formData.minimum_purchase}
                                    onChange={e => setFormData({ ...formData, minimum_purchase: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Description</label>
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10 h-32"
                                    placeholder="Internal notes about this service capability..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="unitBased"
                                    checked={formData.is_unit_based}
                                    onChange={e => setFormData({ ...formData, is_unit_based: e.target.checked })}
                                />
                                <label htmlFor="unitBased" className="text-sm font-medium text-[#00333e] cursor-pointer">Unit Based Usage (Credits)</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => setIsCreating(false)} className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:text-[#00333e] transition-all">Discard</button>
                        <button
                            onClick={handleCreate}
                            className="bg-[#00333e] text-white px-8 py-2 rounded-xl font-bold hover:bg-[#00333e]/90 transition-all shadow-sm"
                        >
                            Save Service
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-100 border border-gray-200 rounded-xl animate-pulse"></div>)
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No services found.</p>
                    </div>
                ) : (
                    paginatedServices.map(svc => (
                        <div key={svc.service_id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#00333e]/30 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-[#00333e]/5 rounded-lg">
                                    <Database className="w-5 h-5 text-[#00333e]" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-[#00333e]">TShs {svc.unit_cost}</span>
                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Per Unit</span>
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-[#00333e] mb-1">{svc.name}</h3>
                            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{svc.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Min: {svc.minimum_purchase}</span>
                                <div className="flex items-center gap-2">
                                    <button className="hover:text-[#00333e]"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button className="hover:text-[#c84b31]"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredServices.length > 0 && (
                <div className="px-6 py-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing <span className="text-[#00333e]">{startIndex + 1}</span>-<span className="text-[#00333e]">{Math.min(endIndex, filteredServices.length)}</span> of <span className="text-[#00333e]">{filteredServices.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 transition-all bg-white shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-[#00333e] px-2">Page {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={paginatedServices.length < limit || loading}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 transition-all bg-white shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
