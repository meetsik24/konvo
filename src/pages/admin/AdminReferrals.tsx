import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';
import type {
  ReferralRecord,
  ReferralStatus,
  ReferralStatsResponse,
  ReferralConfig,
  ReferralConfigPatch,
  QualifyingEvent,
  LeaderboardEntry,
} from '../../services/admin-api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';

const STATUS_OPTIONS: { value: ReferralStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'invited', label: 'Invited' },
  { value: 'registered', label: 'Registered' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'rewarded', label: 'Rewarded' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const QUALIFYING_OPTIONS: { value: QualifyingEvent; label: string }[] = [
  { value: 'immediate', label: 'Immediate (on signup)' },
  { value: 'first_transaction', label: 'First transaction' },
  { value: 'manual', label: 'Manual approval' },
];

function formatDate(s: string | null): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

function statusBadgeClass(status: ReferralStatus): string {
  const map: Record<ReferralStatus, string> = {
    invited: 'bg-gray-100 text-gray-700',
    registered: 'bg-blue-100 text-blue-700',
    qualified: 'bg-amber-100 text-amber-700',
    rewarded: 'bg-green-100 text-green-700',
    expired: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

const AdminReferrals: React.FC = () => {
  const [stats, setStats] = useState<ReferralStatsResponse | null>(null);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | ''>('');
  const [referrerSearch, setReferrerSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<ReferralConfigPatch>({});

  const fetchStats = useCallback(async () => {
    try {
      const data = await AdminApi.getReferralStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await AdminApi.getReferralConfig();
      setConfig(data);
      setConfigForm({});
    } catch (err) {
      console.error('Failed to fetch referral config:', err);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await AdminApi.getReferralLeaderboard(10);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const params: { page: number; page_size: number; status?: ReferralStatus; referrer_user_id?: string } = { page, page_size: pageSize };
      if (statusFilter) params.status = statusFilter;
      if (referrerSearch.trim()) params.referrer_user_id = referrerSearch.trim();
      const res = await AdminApi.getReferrals(params);
      setReferrals(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
      setReferrals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, referrerSearch]);

  useEffect(() => {
    fetchStats();
    fetchConfig();
    fetchLeaderboard();
  }, [fetchStats, fetchConfig, fetchLeaderboard]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleSaveConfig = async () => {
    if (Object.keys(configForm).length === 0) return;
    try {
      setConfigSaving(true);
      const updated = await AdminApi.updateReferralConfig(configForm);
      setConfig(updated);
      setConfigForm({});
      await fetchStats();
    } catch (err) {
      console.error('Failed to update config:', err);
    } finally {
      setConfigSaving(false);
    }
  };

  const handleApprove = async (referralId: string) => {
    try {
      setActionLoading(referralId);
      await AdminApi.approveReferral(referralId);
      await fetchReferrals();
      if (selectedReferral?.id === referralId) {
        const updated = await AdminApi.getReferralById(referralId);
        setSelectedReferral(updated);
      }
      await fetchStats();
      await fetchLeaderboard();
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (referralId: string) => {
    try {
      setActionLoading(referralId);
      await AdminApi.cancelReferral(referralId);
      await fetchReferrals();
      setIsSheetOpen(false);
      setSelectedReferral(null);
      await fetchStats();
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canApprove = config?.qualifying_event === 'manual' && selectedReferral?.status === 'qualified';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Referrals</h1>
          <p className="text-gray-500 text-sm">Manage referral programme, view stats and approve rewards.</p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchConfig(); fetchLeaderboard(); fetchReferrals(); }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00333e] bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Programme</h3>
          <p className="text-lg font-bold text-[#00333e]">
            {stats?.programme_active ? 'Active' : 'Paused'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Total referrals</h3>
          <p className="text-2xl font-bold text-[#00333e]">{stats?.total_referrals ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Conversion rate</h3>
          <p className="text-2xl font-bold text-[#00333e]">
            {stats?.conversion_rate != null ? `${(stats.conversion_rate * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Units issued</h3>
          <p className="text-2xl font-bold text-[#00333e]">{stats?.total_units_issued?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 tracking-wider">Top referrer</h3>
          <p className="text-sm font-bold text-[#00333e] truncate">
            {stats?.top_referrer ? `${stats.top_referrer.username} (${stats.top_referrer.referral_count})` : '—'}
          </p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00333e]" />
          <h2 className="text-lg font-semibold text-[#00333e]">Programme configuration</h2>
        </div>
        <div className="p-6">
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Referrer reward (units)</label>
                <input
                  type="number"
                  min={0}
                  value={configForm.referrer_reward_units !== undefined ? configForm.referrer_reward_units : config.referrer_reward_units}
                  onChange={(e) => setConfigForm((f) => ({ ...f, referrer_reward_units: e.target.value === '' ? undefined : parseInt(e.target.value, 10) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Referee reward (units)</label>
                <input
                  type="number"
                  min={0}
                  value={configForm.referee_reward_units !== undefined ? configForm.referee_reward_units : config.referee_reward_units}
                  onChange={(e) => setConfigForm((f) => ({ ...f, referee_reward_units: e.target.value === '' ? undefined : parseInt(e.target.value, 10) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Qualifying event</label>
                <select
                  value={configForm.qualifying_event ?? config.qualifying_event}
                  onChange={(e) => setConfigForm((f) => ({ ...f, qualifying_event: e.target.value as QualifyingEvent }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e]"
                >
                  {QUALIFYING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Max referrals per user</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Unlimited"
                  value={configForm.max_referrals_per_user !== undefined ? configForm.max_referrals_per_user ?? '' : config.max_referrals_per_user ?? ''}
                  onChange={(e) => setConfigForm((f) => ({ ...f, max_referrals_per_user: e.target.value === '' ? null : parseInt(e.target.value, 10) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e]"
                />
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={configForm.is_programme_active !== undefined ? configForm.is_programme_active : config?.is_programme_active ?? false}
                onChange={(e) => setConfigForm((f) => ({ ...f, is_programme_active: e.target.checked }))}
                className="rounded border-gray-300 text-[#00333e] focus:ring-[#00333e]"
              />
              <span className="text-sm font-medium text-[#00333e]">Programme active</span>
            </label>
            {config?.updated_at && (
              <span className="text-xs text-gray-500">Last updated: {formatDate(config.updated_at)}</span>
            )}
            {Object.keys(configForm).length > 0 && (
              <button
                onClick={handleSaveConfig}
                disabled={configSaving}
                className="px-4 py-2 bg-[#00333e] text-white text-sm font-medium rounded-lg hover:bg-[#004d5c] disabled:opacity-50"
              >
                {configSaving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#00333e]" />
          <h2 className="text-lg font-semibold text-[#00333e]">Top referrers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referrals</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Units generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No leaderboard data yet.</td>
                </tr>
              ) : (
                leaderboard.map((entry) => (
                  <tr key={entry.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-[#00333e]">{entry.rank}</td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-[#00333e]">{entry.username}</span>
                      <p className="text-[10px] text-gray-500 font-mono">{entry.user_id}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold">{entry.referrals}</td>
                    <td className="px-6 py-3">{entry.units_generated?.toLocaleString() ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referrals list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Referrer user ID..."
                value={referrerSearch}
                onChange={(e) => { setReferrerSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#00333e]/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as ReferralStatus | ''); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e] bg-white max-w-[180px]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referral ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referrer</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referee</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-2"></div>
                    Loading...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No referrals match your filters.</td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedReferral(r); setIsSheetOpen(true); }}
                  >
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{r.id.slice(0, 8)}…</td>
                    <td className="px-6 py-3 font-mono text-xs text-[#00333e]">{r.referrer_user_id.slice(0, 8)}…</td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{r.referee_user_id ? `${r.referee_user_id.slice(0, 8)}…` : '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">{formatDate(r.invited_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500 font-medium">
            Showing {referrals.length} of {total} referrals
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-[#00333e] px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail sheet */}
      {selectedReferral && (
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setSelectedReferral(null);
          }}
        >
          <SheetContent side="right" className="sm:max-w-[420px] w-full p-0 bg-white">
            <SheetHeader className="px-5 py-4 border-b border-gray-200">
              <SheetTitle>Referral details</SheetTitle>
              <SheetDescription>
                <code className="text-[10px] font-mono">{selectedReferral.id}</code>
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-[#00333e]">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadgeClass(selectedReferral.status)}`}>
                  {selectedReferral.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Referrer user ID</p>
                <p className="mt-1 font-mono text-xs break-all">{selectedReferral.referrer_user_id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Referee user ID</p>
                <p className="mt-1 font-mono text-xs break-all">{selectedReferral.referee_user_id ?? '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invited</p>
                  <p className="mt-1 text-xs">{formatDate(selectedReferral.invited_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</p>
                  <p className="mt-1 text-xs">{formatDate(selectedReferral.registered_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualified</p>
                  <p className="mt-1 text-xs">{formatDate(selectedReferral.qualified_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rewarded</p>
                  <p className="mt-1 text-xs">{formatDate(selectedReferral.rewarded_at)}</p>
                </div>
              </div>
              {(canApprove || (selectedReferral.status !== 'rewarded' && selectedReferral.status !== 'cancelled' && selectedReferral.status !== 'expired')) && (
                <div className="pt-4 flex gap-2 border-t border-gray-200">
                  {canApprove && (
                    <button
                      onClick={() => handleApprove(selectedReferral.id)}
                      disabled={actionLoading === selectedReferral.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> {actionLoading === selectedReferral.id ? 'Approving…' : 'Approve & issue rewards'}
                    </button>
                  )}
                  {selectedReferral.status !== 'rewarded' && selectedReferral.status !== 'cancelled' && selectedReferral.status !== 'expired' && (
                    <button
                      onClick={() => handleCancel(selectedReferral.id)}
                      disabled={actionLoading === selectedReferral.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> {actionLoading === selectedReferral.id ? 'Cancelling…' : 'Cancel referral'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default AdminReferrals;
