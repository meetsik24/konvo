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
    Database
} from 'lucide-react';
import { AdminApi, Service } from '../../services/api';

const AdminServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
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
            const data = await AdminApi.getServices();
            setServices(data.services || []);
        } catch (err: any) {
            console.error('Failed to fetch services:', err);
        } finally {
            setLoading(false);
        }
    }, []);

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Services</h1>
                    <p className="text-gray-400 text-sm">Define base platform capabilities and unit pricing.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Service
                </button>
            </div>

            {isCreating && (
                <div className="bg-[#1a1a1a] border border-red-600/30 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Add System Service</h2>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Service Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                                    placeholder="e.g. Transactional SMS"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Unit Cost ($)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                                    value={formData.unit_cost}
                                    onChange={e => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Min Purchase Units</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                                    value={formData.minimum_purchase}
                                    onChange={e => setFormData({ ...formData, minimum_purchase: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                                <textarea
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 h-32"
                                    placeholder="Internal notes about this service capability..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
                                <input
                                    type="checkbox"
                                    id="unitBased"
                                    checked={formData.is_unit_based}
                                    onChange={e => setFormData({ ...formData, is_unit_based: e.target.checked })}
                                />
                                <label htmlFor="unitBased" className="text-sm font-medium text-white cursor-pointer selections-none">Unit Based Usage (Credits)</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <button onClick={() => setIsCreating(false)} className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:text-white transition-all">Discard</button>
                        <button
                            onClick={handleCreate}
                            className="bg-red-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                            Save Service
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl animate-pulse"></div>)
                ) : (
                    services.map(svc => (
                        <div key={svc.service_id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-600/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-red-600/10 rounded-lg">
                                    <Database className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-white">${svc.unit_cost}</span>
                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Per Unit</span>
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-white mb-1">{svc.name}</h3>
                            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{svc.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Min: {svc.minimum_purchase}</span>
                                <div className="flex items-center gap-2">
                                    <button className="hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button className="hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminServices;
