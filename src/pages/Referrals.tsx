import React, { useEffect, useState, useCallback } from 'react';
import {
  Copy,
  RefreshCw,
  Gift,
  Send,
  ChevronLeft,
  ChevronRight,
  Share2,
  UserPlus,
} from 'lucide-react';
import {
  getMyReferralCode,
  getReferralStats,
  getReferralHistory,
  sendReferralInvite,
  regenerateReferralCode,
  type ReferralMyCode,
  type ReferralUserStats,
  type ReferralHistoryItem,
  type ReferralHistoryStatus,
} from '../services/api';

function statusBadgeClass(status: ReferralHistoryStatus): string {
  const map: Record<ReferralHistoryStatus, string> = {
    invited: 'bg-gray-100 text-gray-700',
    registered: 'bg-blue-100 text-blue-700',
    qualified: 'bg-amber-100 text-amber-700',
    rewarded: 'bg-green-100 text-green-700',
    expired: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

function formatDate(s: string | null): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

const Referrals: React.FC = () => {
  const [myCode, setMyCode] = useState<ReferralMyCode | null>(null);
  const [stats, setStats] = useState<ReferralUserStats | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    channel: 'sms' as 'sms' | 'whatsapp',
    recipient_phone: '',
    custom_message: '',
  });

  const fetchCode = useCallback(async () => {
    try {
      const data = await getMyReferralCode();
      setMyCode(data);
    } catch (err) {
      console.error('Failed to fetch referral code:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getReferralStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getReferralHistory(page, pageSize);
      setHistory(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch referral history:', err);
      setHistory([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCode();
    fetchStats();
  }, [fetchCode, fetchStats]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopyLink = async () => {
    if (!myCode?.invite_link) return;
    try {
      await navigator.clipboard.writeText(myCode.invite_link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  const handleCopyCode = async () => {
    if (!myCode?.code) return;
    try {
      await navigator.clipboard.writeText(myCode.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Generate a new referral code? Your current code will stop working for new referrals.')) return;
    try {
      setRegenerating(true);
      const data = await regenerateReferralCode();
      setMyCode(data);
    } catch (err) {
      console.error('Failed to regenerate code:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = inviteForm.recipient_phone.trim().replace(/\s/g, '');
    if (!phone) {
      setInviteError('Enter a phone number');
      return;
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setInviteError('Phone must be in E.164 format (e.g. +255712345678)');
      return;
    }
    if (!myCode?.invite_link) {
      setInviteError('Your referral link is not loaded yet. Please wait and try again.');
      return;
    }
    setInviteError(null);
    setInviteSuccess(null);
    try {
      setInviteSending(true);
      const messageWithLink = inviteForm.custom_message.trim()
        ? `${inviteForm.custom_message.trim()}\n\n${myCode.invite_link}`
        : myCode.invite_link;
      const res = await sendReferralInvite({
        channel: inviteForm.channel,
        recipient_phone: phone,
        custom_message: messageWithLink,
      });
      setInviteSuccess(res.message || 'Invite sent.');
      setInviteForm((f) => ({ ...f, recipient_phone: '', custom_message: '' }));
      await fetchStats();
      await fetchHistory();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to send invite';
      setInviteError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setInviteSending(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Refer a Friend</h1>
        <p className="text-gray-500 text-sm">Share your code and earn Briq units when friends join and qualify.</p>
      </div>

      {/* My code & invite link */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-[#00333e]" />
          <h2 className="text-lg font-semibold text-[#00333e]">Your referral code</h2>
        </div>
        {myCode ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <code className="px-4 py-2 bg-gray-100 text-[#00333e] font-mono font-bold rounded-lg text-lg">
                {myCode.code}
              </code>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#00333e] bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                <Copy className="w-4 h-4" /> {copySuccess ? 'Copied!' : 'Copy code'}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                readOnly
                value={myCode.invite_link}
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#00333e] bg-[#fddf0d] hover:bg-[#fce96a] rounded-lg"
              >
                <Share2 className="w-4 h-4" /> {copySuccess ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Code created: {formatDate(myCode.created_at)}</span>
              {!myCode.is_active && <span className="text-amber-600">(Inactive)</span>}
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} /> New code
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Loading your code...</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invited</p>
          <p className="text-xl font-bold text-[#00333e]">{stats?.total_invited ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered</p>
          <p className="text-xl font-bold text-[#00333e]">{stats?.total_registered ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rewarded</p>
          <p className="text-xl font-bold text-green-600">{stats?.total_rewarded ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Units earned</p>
          <p className="text-xl font-bold text-[#00333e]">{stats?.units_earned?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      {/* Send invite */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-[#00333e]" />
          <h2 className="text-lg font-semibold text-[#00333e]">Send invite</h2>
        </div>
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Channel</label>
              <select
                value={inviteForm.channel}
                onChange={(e) => setInviteForm((f) => ({ ...f, channel: e.target.value as 'sms' | 'whatsapp' }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e]"
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone (E.164)</label>
              <input
                type="tel"
                value={inviteForm.recipient_phone}
                onChange={(e) => setInviteForm((f) => ({ ...f, recipient_phone: e.target.value }))}
                placeholder="+255712345678"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e] placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message (optional)</label>
            <textarea
              value={inviteForm.custom_message}
              onChange={(e) => setInviteForm((f) => ({ ...f, custom_message: e.target.value }))}
              placeholder="Add a personal message… Your referral link will be included automatically."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e] placeholder-gray-400"
            />
          </div>
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
          {inviteSuccess && <p className="text-sm text-green-600">{inviteSuccess}</p>}
          <button
            type="submit"
            disabled={inviteSending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00333e] text-white text-sm font-medium rounded-lg hover:bg-[#004d5c] disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {inviteSending ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-[#00333e]">Referral history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referee</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rewarded</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No referrals yet. Share your link to get started.</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-[#00333e]">{item.referee_username ?? '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">{formatDate(item.registered_at)}</td>
                    <td className="px-6 py-3 text-xs text-gray-500">{formatDate(item.rewarded_at)}</td>
                    <td className="px-6 py-3 font-semibold">{item.units_earned}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500 font-medium">
            Showing {history.length} of {total}
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
    </div>
  );
};

export default Referrals;
