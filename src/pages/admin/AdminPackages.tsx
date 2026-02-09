import React, { useEffect, useState, useCallback } from 'react';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Check,
    X,
    Layers,
    DollarSign,
    Info
} from 'lucide-react';
import { AdminApi, Service } from '../../services/api';

const AdminPackages: React.FC = () => {
    const [packages, setPackages] = useState<any[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPackage, setNewPackage] = useState({
        name: '',
        description: '',
        total_price: 0,
        services: [] as any[]
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [pkgsData, svcsData] = await Promise.all([
                AdminApi.getPackages(),
                AdminApi.getServices()
            ]);
            setPackages(pkgsData.packages || []);
            setServices(svcsData.services || []);
        } catch (err: any) {
            console.error('Failed to fetch packages/services:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreatePackage = async () => {
        try {
            if (!newPackage.name || newPackage.total_price <= 0) {
                alert('Please provide a name and a valid price.');
                return;
            }
            await AdminApi.createPackage(newPackage);
            setIsCreating(false);
            setNewPackage({ name: '', description: '', total_price: 0, services: [] });
            fetchData();
        } catch (err: any) {
            alert('Failed to create package: ' + err.message);
        }
    };

    const toggleService = (serviceId: string) => {
        setNewPackage(prev => {
            const exists = prev.services.find(s => s.service_id === serviceId);
            if (exists) {
                return { ...prev, services: prev.services.filter(s => s.service_id !== serviceId) };
            } else {
                const svc = services.find(s => s.service_id === serviceId);
                return {
                    ...prev,
                    services: [...prev.services, {
                        service_id: serviceId,
                        units_allocated: svc?.minimum_purchase || 100,
                        unit_cost_at_purchase: svc?.unit_cost || 0.1
                    }]
                };
            }
        });
    };

    const updateServiceAllocation = (serviceId: string, field: string, value: number) => {
        setNewPackage(prev => ({
            ...prev,
            services: prev.services.map(s => s.service_id === serviceId ? { ...s, [field]: value } : s)
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Packages</h1>
                    <p className="text-gray-400 text-sm">Configure subscription and credit bundles.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Package
                </button>
            </div>

            {isCreating && (
                <div className="bg-[#1a1a1a] border border-red-600/30 rounded-2xl p-6 space-y-6 slide-in-from-top duration-300">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Create New Package</h2>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Package Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                    placeholder="e.g. Professional SMS Bundle"
                                    value={newPackage.name}
                                    onChange={e => setNewPackage({ ...newPackage, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                                <textarea
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 h-24"
                                    placeholder="What's included in this package?"
                                    value={newPackage.description}
                                    onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Total Price ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                    value={newPackage.total_price}
                                    onChange={e => setNewPackage({ ...newPackage, total_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Include Services</label>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {services.map(svc => (
                                    <div key={svc.service_id} className={`p-4 rounded-xl border transition-all ${newPackage.services.find(s => s.service_id === svc.service_id)
                                            ? 'bg-red-600/10 border-red-600/50'
                                            : 'bg-[#2a2a2a] border-[#3a3a3a]'
                                        }`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!newPackage.services.find(s => s.service_id === svc.service_id)}
                                                    onChange={() => toggleService(svc.service_id)}
                                                />
                                                <span className="text-white text-sm font-bold">{svc.name}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 uppercase">${svc.unit_cost}/unit</span>
                                        </div>
                                        {newPackage.services.find(s => s.service_id === svc.service_id) && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">Units</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-2 py-1 text-xs text-white"
                                                        value={newPackage.services.find(s => s.service_id === svc.service_id).units_allocated}
                                                        onChange={e => updateServiceAllocation(svc.service_id, 'units_allocated', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">Unit Cost ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-2 py-1 text-xs text-white"
                                                        value={newPackage.services.find(s => s.service_id === svc.service_id).unit_cost_at_purchase}
                                                        onChange={e => updateServiceAllocation(svc.service_id, 'unit_cost_at_purchase', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 rounded-xl text-gray-400 font-bold hover:text-white transition-all">Cancel</button>
                        <button
                            onClick={handleCreatePackage}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                            Confirm and Save
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl animate-pulse"></div>)
                ) : packages.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No packages configured yet.</p>
                    </div>
                ) : (
                    packages.map(pkg => (
                        <div key={pkg.package_id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-red-600/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-600/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white">${pkg.total_price}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Global Pack</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">{pkg.description}</p>

                            <div className="space-y-3 mb-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Included Services</p>
                                {pkg.services.map((ps: any) => (
                                    <div key={ps.package_service_id} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-300">{services.find(s => s.service_id === ps.service_id)?.name || 'Service'}</span>
                                        <span className="text-white font-bold">{ps.units_allocated.toLocaleString()} units</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
                                <button className="text-gray-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                <button className="text-gray-500 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminPackages;
