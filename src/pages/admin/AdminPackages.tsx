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
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Packages</h1>
                    <p className="text-gray-500 text-sm">Configure subscription and credit bundles.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-[#00333e] hover:bg-[#00333e]/90 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Create Package
                </button>
            </div>

            {isCreating && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#00333e]">Create New Package</h2>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-[#00333e]"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Package Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10"
                                    placeholder="e.g. Professional SMS Bundle"
                                    value={newPackage.name}
                                    onChange={e => setNewPackage({ ...newPackage, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Description</label>
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10 h-24"
                                    placeholder="What's included in this package?"
                                    value={newPackage.description}
                                    onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Total Price ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[#00333e] focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10"
                                    value={newPackage.total_price}
                                    onChange={e => setNewPackage({ ...newPackage, total_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Include Services</label>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {services.map(svc => (
                                    <div key={svc.service_id} className={`p-4 rounded-xl border transition-all ${newPackage.services.find(s => s.service_id === svc.service_id)
                                            ? 'bg-[#00333e]/5 border-[#00333e]/30'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!newPackage.services.find(s => s.service_id === svc.service_id)}
                                                    onChange={() => toggleService(svc.service_id)}
                                                />
                                                <span className="text-[#00333e] text-sm font-bold">{svc.name}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 uppercase">${svc.unit_cost}/unit</span>
                                        </div>
                                        {newPackage.services.find(s => s.service_id === svc.service_id) && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">Units</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-[#00333e]"
                                                        value={newPackage.services.find(s => s.service_id === svc.service_id).units_allocated}
                                                        onChange={e => updateServiceAllocation(svc.service_id, 'units_allocated', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">Unit Cost ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-[#00333e]"
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

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 rounded-xl text-gray-500 font-bold hover:text-[#00333e] transition-all">Cancel</button>
                        <button
                            onClick={handleCreatePackage}
                            className="bg-[#00333e] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#00333e]/90 transition-all shadow-sm"
                        >
                            Confirm and Save
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 border border-gray-200 rounded-xl animate-pulse"></div>)
                ) : packages.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No packages configured yet.</p>
                    </div>
                ) : (
                    packages.map(pkg => (
                        <div key={pkg.package_id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#00333e]/30 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#00333e]/5 rounded-lg group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-[#00333e]" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-[#00333e]">${pkg.total_price}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Package</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-[#00333e] mb-2">{pkg.name}</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">{pkg.description}</p>

                            <div className="space-y-3 mb-6 pb-4 border-b border-gray-100">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Included Services</p>
                                {pkg.services.map((ps: any) => (
                                    <div key={ps.package_service_id} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">{services.find(s => s.service_id === ps.service_id)?.name || 'Service'}</span>
                                        <span className="text-[#00333e] font-bold">{ps.units_allocated.toLocaleString()} units</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-3">
                                <button className="text-gray-400 hover:text-[#00333e] transition-all"><Edit2 className="w-4 h-4" /></button>
                                <button className="text-gray-400 hover:text-[#c84b31] transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminPackages;
