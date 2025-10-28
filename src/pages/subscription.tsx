import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { motion } from "framer-motion";
import { Wallet, ShoppingBag, Package, Loader2 } from "lucide-react";
import Alert from '../components/Alert';
import { 
  getAccountBalance, 
  initiateUnitsPayment, 
  getUsageLogs, 
  getAllocationsFromPackage, 
  getTransactionHistory, 
  getPlans, 
  ServiceName,
  getTransactionById,
  listAllTransactions,
  validatePayment,
  purchasePackage,
  purchaseCustom,
  getCurrentServiceAllocations,
} from "../services/api";

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
  name: string;
  allocation: {
    sms: number;
    whatsapp: number;
    voice: number;
  };
  usage: {
    sms: number;
    whatsapp: number;
    voice: number;
  };
}

const serviceRates: { [key in keyof UsageData['allocation']]: number } = {
  sms: 0.1,
  whatsapp: 0.2,
  voice: 0.5
};

const Subscription: React.FC = () => {
  const [wallet, setWallet] = useState<{
    units: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPackage, setCurrentPackage] = useState<UsageData>({
    name: "Your Package",
    allocation: { sms: 0, whatsapp: 0, voice: 0 },
    usage: { sms: 0, whatsapp: 0, voice: 0 },
  });
  const [transactions, setTransactions] = useState<
    { type: string; units: number; desc: string }[]
  >([]);
  const userId = useSelector((state: RootState) => state.auth.user.userId);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isPackagesLoading, setIsPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customService, setCustomService] = useState<'sms' | 'whatsapp' | 'voice'>('sms');
  const [customQuantity, setCustomQuantity] = useState<number>(0);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ isOpen: true, type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setAlertState(prev => ({ ...prev, isOpen: false }));
    }, 5000);
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const response = await initiateUnitsPayment({
        mobile_money_number: phoneNumber,
        amount: topUpAmount
      });
      
      console.log("Payment initiated:", response);
      if (response.marked_complete) {
        setRefreshKey(prev => prev + 1);
        setIsTopUpModalOpen(false); // Close modal on success
        setPhoneNumber(""); // Reset form
        setTopUpAmount(0); // Reset form
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setError("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const rate = serviceRates[customService];
      const cost = Math.ceil(customQuantity * rate);
      if (cost <= 0 || customQuantity <= 0) {
        showAlert('error', 'Invalid quantity');
        return;
      }
      if (!wallet || wallet.units < cost) {
        showAlert('error', "Not enough units in wallet.");
        return;
      }
      const response = await purchaseCustom(customService, customQuantity, cost);
      if (response.status) {
        showAlert('success', 'Custom credits purchased successfully!');
        setRefreshKey(prev => prev + 1);
        setIsCustomModalOpen(false);
        setCustomQuantity(0);
        setCustomService('sms');
      } else {
        showAlert('error', 'Failed to purchase custom credits.');
      }
    } catch (error) {
      console.error("Custom purchase failed:", error);
      showAlert('error', 'Failed to purchase custom credits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!userId) {
          throw new Error('User ID not found');
        }
        const balance = await getAccountBalance(userId);
        setWallet({
          units: balance.unit_cost
        });
      } catch (err) {
        setError("Failed to load wallet balance");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [userId, refreshKey]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsPackagesLoading(true);
        const plans = await getPlans();
        
        // Transform Plan[] to Package[]
        const transformedPackages = plans.map(plan => ({
          id: plan.plan_id,
          name: plan.name,
          description: plan.description,
          units: plan.sms_unit_price,
          allocation: {
            sms: plan.minimum_sms_purchase, // 40% for SMS
            whatsapp: 0, // 40% for WhatsApp
            voice: 0, // 20% for Voice
          }
        }));

        setPackages(transformedPackages);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setPackagesError("Failed to load available packages");
      } finally {
        setIsPackagesLoading(false);
      }
    };

    fetchPlans();
  }, [refreshKey]);

  useEffect(() => {
    const fetchUsageAndAllocation = async () => {
      try {
        const logs = await getUsageLogs();

        // Aggregate usage by service type
        const usage = logs.reduce(
          (acc, log) => {
            switch (log.service_name) {
              case ServiceName.SMS:
                acc.sms += log.quantity;
                break;
              case ServiceName.WHATSAPP:
                acc.whatsapp += log.quantity;
                break;
              case ServiceName.VOICE:
                acc.voice += log.quantity;
                break;
            }
            return acc;
          },
          { sms: 0, whatsapp: 0, voice: 0 }
        );

        const allocations = await getCurrentServiceAllocations();

        setCurrentPackage({
          name: "Your Package",
          allocation: allocations,
          usage: usage,
        });
      } catch (err) {
        console.error("Failed to fetch usage logs or allocations:", err);
        setError("Failed to load usage data");
      }
    };

    fetchUsageAndAllocation();
  }, [refreshKey]);

  const handlePurchase = async (pkg: Package) => {
    try {
      setPurchasingPackageId(pkg.id);
      if (!wallet || wallet.units < pkg.units) {
        showAlert('error', "Not enough credits in wallet to purchase this package.");
        return;
      }

      // Get allocations for the package
      const allocationsResponse = await getAllocationsFromPackage(pkg.id);
      
      if (!allocationsResponse.status) {
        throw new Error('Failed to get package allocations');
      }

      const purchaseResponse = await purchasePackage(pkg.id);

      if (purchaseResponse.status) {
        showAlert('success', 'Package purchased successfully!');
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error('Purchase failed');
      }

    } catch (error) {
      console.error('Package purchase failed:', error);
      showAlert('error', 'Failed to purchase package. Please try again.');
    } finally {
      setPurchasingPackageId(null);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsTransactionsLoading(true);
        const response = await getTransactionHistory();
        setTransactions(response.transactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactionsError("Failed to load transaction history");
      } finally {
        setIsTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshKey]);

  const calcUsagePercent = (used: number, total: number) =>
    total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen space-y-8">
     
      {/* Wallet Overview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex items-center justify-between"
      >
         <Alert
        type={alertState.type}
        message={alertState.message}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
        <div className="flex items-center space-x-4">
          <Wallet className="w-8 h-8 text-[#00333e]" />
          <div>
            <h2 className="text-lg font-semibold text-[#00333e]">
              Wallet Balance
            </h2>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading balance...</span>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <p className="text-2xl font-bold text-[#00333e]">
                {wallet?.units?.toLocaleString()} Units
              </p>
            )}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f]"
          disabled={isLoading}
          onClick={() => setIsTopUpModalOpen(true)}
        >
          Top Up
        </button>
        {isTopUpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold text-[#00333e] mb-4">Top Up Wallet</h2>
            
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  required
                />
              </div>
        
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={topUpAmount || ''}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              placeholder="Enter amount"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e]"
              required
            />
          </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                      </span>
                                ) : (
                  'Proceed with Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
      >
        <h3 className="text-xl font-medium text-[#00333e] mb-4">
          Current Usage
        </h3>
        <div className="space-y-4">
          {Object.entries(currentPackage.allocation).map(([key, total]) => {
            const used = currentPackage.usage[
              key as keyof typeof currentPackage.usage
            ];
            const percent = calcUsagePercent(used, total);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{key}</span>
                  <span className="text-[#00333e] font-medium">
                    {used} units used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-md h-2">
                  <div
                    className="bg-[#00333e] h-2 rounded-md"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Custom Credits */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <ShoppingBag className="w-8 h-8 text-[#00333e]" />
          <div>
            <h2 className="text-lg font-semibold text-[#00333e]">
              Custom Credits
            </h2>
            <p className="text-sm text-gray-600">
              Buy credits for specific services
            </p>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f]"
          onClick={() => setIsCustomModalOpen(true)}
        >
          Buy Custom
        </button>
      </motion.div>

      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold text-[#00333e] mb-4">Buy Custom Credits</h2>
            
            <form onSubmit={handleCustomPurchase} className="space-y-4">
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  id="service"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value as 'sms' | 'whatsapp' | 'voice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  required
                >
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="voice">Voice</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={customQuantity || ''}
                  onChange={(e) => setCustomQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  required
                />
              </div>

              <p className="text-sm text-gray-600">
                Estimated cost: {Math.ceil(customQuantity * serviceRates[customService]).toLocaleString()} units
              </p>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Purchase'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Packages */}
        <div>
          <h3 className="text-xl font-medium text-[#00333e] mb-4 flex items-center gap-2">
            Available Packages
          </h3>
          {isPackagesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#00333e]" />
            </div>
          ) : packagesError ? (
            <p className="text-red-500 text-sm">{packagesError}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages?.map((pkg) => (
              <motion.div
                key={pkg?.id || Math.random()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-semibold text-[#00333e] mb-1">
                    {pkg?.name || 'Package Name'}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                    {pkg?.description || 'No description available'}
                  </p>
                  <p className="text-sm mb-3 text-[#00333e] font-medium">
                    {(pkg?.units || 0).toLocaleString()} Units
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>{pkg?.allocation?.sms || 0} SMS</li>
                    <li>{pkg?.allocation?.whatsapp || 0} WhatsApp</li>
                    <li>{pkg?.allocation?.voice || 0} Voice</li>
                  </ul>
                </div>
                <button
                  onClick={() => pkg && handlePurchase(pkg)}
                  className="w-full px-4 py-2 bg-[#fddf0d] text-[#00333e] rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!pkg || purchasingPackageId === pkg.id || !wallet || wallet.units < pkg.units}
                >
                  {purchasingPackageId === pkg.id ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Purchase'
                  )}
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
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#00333e]" />
        </div>
      ) : transactionsError ? (
        <p className="text-red-500 text-sm">{transactionsError}</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 text-sm">No transaction history available.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.transaction_id}
              className="bg-white p-4 rounded-md border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#00333e]">
                    {transaction.units_purchased.toLocaleString()} Units
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#00333e]">
                    {transaction.total_amount_paid.toLocaleString()} Tsh
                  </p>
                  <p className={`text-sm ${
                    transaction.marked_complete ? 'text-green-500' : 'text-orange-500'
                  }`}>
                    {transaction.marked_complete ? 'Completed' : 'Pending'}
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