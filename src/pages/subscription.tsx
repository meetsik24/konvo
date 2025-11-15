import React, { useState, useEffect } from "react";
import { X, Loader2, Wallet, ShoppingBag } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { motion } from "framer-motion";
import Alert from '../components/Alert';
import {
  getAccountBalance,
  getBalanceUsage,
  getBalanceUsageLogs,
  getTransactions,
  getServices,
  transactionDeposit,
  validatePayment,
  getBalanceUnits,
  getBalanceServicesCost,
} from "../services/api"; // ← Only new endpoints

interface Package {
  id: string;
  name: string;
  description: string;
  units: number;
  allocation: {
    sms: number;
    whatsapp: number;
    voice: number;
  };
}

interface UsageData {
  allocation: { sms: number; whatsapp: number; voice: number };
  usage: { sms: number; whatsapp: number; voice: number };
}

const serviceRates = {
  sms: 0.1,
  whatsapp: 0.2,
  voice: 0.5,
} as const;

const Subscription: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.user.userId);

  // State
  const [wallet, setWallet] = useState<{ units: number } | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [currentUsage, setCurrentUsage] = useState<UsageData>({
    allocation: { sms: 0, whatsapp: 0, voice: 0 },
    usage: { sms: 0, whatsapp: 0, voice: 0 },
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPackagesLoading, setIsPackagesLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

  // Modals
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [customService, setCustomService] = useState<'sms' | 'whatsapp' | 'voice'>('sms');
  const [customQty, setCustomQty] = useState(0);

  // Processing
  const [processing, setProcessing] = useState(false);
  const [purchasingPkgId, setPurchasingPkgId] = useState<string | null>(null);

  // Alert
  const [alert, setAlert] = useState<{ open: boolean; type: 'success' | 'error'; msg: string }>({
    open: false, type: 'success', msg: ''
  });

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ open: true, type, msg });
    setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 5000);
  };

  // Refresh trigger
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => setRefresh(prev => prev + 1);

  // === FETCH WALLET ===
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setIsLoading(true);
        const balance = await getAccountBalance();
        setWallet({ units: balance.unit_balance || 0 });
      } catch (err) {
        showAlert('error', 'Failed to load wallet');
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchWallet();
  }, [userId, refresh]);

  // === FETCH PACKAGES (from Services) ===
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsPackagesLoading(true);
        const services = await getServices();
        const pkgs: Package[] = services.map(s => ({
          id: s.service_id,
          name: s.name,
          description: s.description || 'No description',
          units: s.unit_cost,
          allocation: {
            sms: s.sms_allocation || 0,
            whatsapp: s.whatsapp_allocation || 0,
            voice: s.voice_allocation || 0,
          }
        }));
        setPackages(pkgs);
      } catch (err) {
        showAlert('error', 'Failed to load packages');
      } finally {
        setIsPackagesLoading(false);
      }
    };
    fetchPackages();
  }, [refresh]);

  // === FETCH USAGE & ALLOCATIONS ===
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const [usageRes, logsRes] = await Promise.all([
          getBalanceUsage(),
          getBalanceUsageLogs()
        ]);

        const usage = { sms: 0, whatsapp: 0, voice: 0 };
        logsRes.forEach(log => {
          if (log.service === 'sms') usage.sms += log.used;
          if (log.service === 'whatsapp') usage.whatsapp += log.used;
          if (log.service === 'voice') usage.voice += log.used;
        });

        setCurrentUsage({
          allocation: {
            sms: usageRes.sms_allocated || 0,
            whatsapp: usageRes.whatsapp_allocated || 0,
            voice: usageRes.voice_allocated || 0,
          },
          usage
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsage();
  }, [refresh]);

  // === FETCH TRANSACTIONS ===
  useEffect(() => {
    const fetchTx = async () => {
      try {
        setIsTransactionsLoading(true);
        const txs = await getTransactions();
        setTransactions(txs);
      } catch (err) {
        showAlert('error', 'Failed to load transactions');
      } finally {
        setIsTransactionsLoading(false);
      }
    };
    fetchTx();
  }, [refresh]);

  // === TOP-UP HANDLER ===
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || amount < 1000) return showAlert('error', 'Invalid phone or amount');

    try {
      setProcessing(true);
      const deposit = await transactionDeposit({
        amount,
        mobile_money_number: phone,
        type: 'topup'
      });

      if (deposit.transaction_id) {
        showAlert('success', 'Payment initiated. Completing...');
        setIsTopUpOpen(false);

        // Poll validation
        const poll = setInterval(async () => {
          try {
            const valid = await validatePayment({ transaction_id: deposit.transaction_id });
            if (valid.status === 'completed') {
              clearInterval(poll);
              showAlert('success', 'Payment completed!');
              triggerRefresh();
            }
          } catch (_) { }
        }, 3000);

        setTimeout(() => clearInterval(poll), 120000); // 2 min
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // === CUSTOM PURCHASE ===
  const handleCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Math.ceil(customQty * serviceRates[customService]);
    if (cost > (wallet?.units || 0)) return showAlert('error', 'Not enough units');

    try {
      setProcessing(true);
      // Simulate purchase via internal deduction (no API yet)
      // In real: deduct from wallet via backend
      showAlert('success', 'Custom credits purchased!');
      triggerRefresh();
      setIsCustomOpen(false);
      setCustomQty(0);
    } catch (err) {
      showAlert('error', 'Purchase failed');
    } finally {
      setProcessing(false);
    }
  };

  // === PACKAGE PURCHASE ===
  const handlePackage = async (pkg: Package) => {
    if ((wallet?.units || 0) < pkg.units) {
      return showAlert('error', 'Insufficient units');
    }

    setPurchasingPkgId(pkg.id);
    try {
      // In real system: call purchase endpoint
      // For now: simulate
      await new Promise(r => setTimeout(r, 1000));
      showAlert('success', 'Package purchased!');
      triggerRefresh();
    } catch (err) {
      showAlert('error', 'Purchase failed');
    } finally {
      setPurchasingPkgId(null);
    }
  };

  const calcPercent = (used: number, total: number) =>
    total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen space-y-8">

      <Alert
        type={alert.type}
        message={alert.msg}
        isOpen={alert.open}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      />

      {/* Wallet */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Wallet className="w-8 h-8 text-[#00333e]" />
          <div>
            <h2 className="text-lg font-semibold text-[#00333e]">Wallet Balance</h2>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-[#00333e]">
                {wallet?.units.toLocaleString()} Units
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsTopUpOpen(true)}
          className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f]"
        >
          Top Up
        </button>
      </motion.div>

      {/* Top-Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button onClick={() => setIsTopUpOpen(false)} className="absolute right-4 top-4">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-[#00333e] mb-4">Top Up Wallet</h2>
            <form onSubmit={handleTopUp} className="space-y-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="number"
                placeholder="Amount (TZS)"
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                min="1000"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <button
                type="submit"
                disabled={processing}
                className="w-full py-2 bg-[#00333e] text-white rounded-md disabled:opacity-50"
              >
                {processing ? <>Processing <Loader2 className="inline ml-2 w-4 h-4 animate-spin" /></> : 'Pay Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Current Usage */}
      <motion.div className="bg-white p-6 rounded-md border shadow-sm">
        <h3 className="text-xl font-medium text-[#00333e] mb-4">Current Usage</h3>
        <div className="space-y-4">
          {(['sms', 'whatsapp', 'voice'] as const).map(key => {
            const used = currentUsage.usage[key];
            const total = currentUsage.allocation[key];
            const percent = calcPercent(used, total);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-600">{key}</span>
                  <span className="font-medium text-[#00333e]">{used} / {total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-[#00333e] h-2 rounded" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Custom Credits */}
      <motion.div className="bg-white p-6 rounded-md border shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <ShoppingBag className="w-8 h-8 text-[#00333e]" />
          <div>
            <h2 className="text-lg font-semibold text-[#00333e]">Custom Credits</h2>
            <p className="text-sm text-gray-600">Buy for specific service</p>
          </div>
        </div>
        <button
          onClick={() => setIsCustomOpen(true)}
          className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm"
        >
          Buy Custom
        </button>
      </motion.div>

      {/* Custom Modal */}
      {isCustomOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button onClick={() => setIsCustomOpen(false)} className="absolute right-4 top-4">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Buy Custom Credits</h2>
            <form onSubmit={handleCustom} className="space-y-4">
              <select
                value={customService}
                onChange={e => setCustomService(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="voice">Voice</option>
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={customQty || ''}
                onChange={e => setCustomQty(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-sm text-gray-600">
                Cost: {Math.ceil(customQty * serviceRates[customService]).toLocaleString()} units
              </p>
              <button
                type="submit"
                disabled={processing}
                className="w-full py-2 bg-[#00333e] text-white rounded-md"
              >
                {processing ? 'Processing...' : 'Purchase'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Packages */}
      <div>
        <h3 className="text-xl font-medium text-[#00333e] mb-4">Available Packages</h3>
        {isPackagesLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <motion.div
                key={pkg.id}
                className="bg-white p-6 rounded-md border shadow-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <h4 className="font-semibold text-[#00333e]">{pkg.name}</h4>
                <p className="text-sm text-gray-600 my-2">{pkg.description}</p>
                <p className="font-medium text-[#00333e]">{pkg.units.toLocaleString()} Units</p>
                <ul className="text-sm text-gray-600 my-3 space-y-1">
                  <li>SMS: {pkg.allocation.sms}</li>
                  <li>WhatsApp: {pkg.allocation.whatsapp}</li>
                  <li>Voice: {pkg.allocation.voice}</li>
                </ul>
                <button
                  onClick={() => handlePackage(pkg)}
                  disabled={purchasingPkgId === pkg.id || (wallet?.units || 0) < pkg.units}
                  className="w-full py-2 bg-[#fddf0d] text-[#00333e] font-medium rounded-md disabled:opacity-50"
                >
                  {purchasingPkgId === pkg.id ? 'Processing...' : 'Purchase'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-xl font-medium text-[#00333e] mb-4">Transaction History</h3>
        {isTransactionsLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => (
              <div key={tx.transaction_id} className="bg-white p-4 rounded-md border shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-[#00333e]">{tx.units_purchased} Units</p>
                    <p className="text-sm text-gray-600">
                      {new Date(tx.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#00333e]">{tx.amount} TZS</p>
                    <p className={`text-sm ${tx.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;