import React, { useState, useEffect } from "react";
import { X, Loader2, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Alert from "../components/Alert";
import {
  getAccountBalance,
  initiateUnitsPayment,
  getUsageLogs,
  getAllocationsFromPackage,
  // getTransactionHistory,
  getPlans,
  ServiceName,
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
    avr: number;
  };
  usage: {
    sms: number;
    whatsapp: number;
    avr: number;
  };
}

const Subscription: React.FC = () => {
  // -------------------- STATE MANAGEMENT --------------------
  const [wallet, setWallet] = useState<{ units: number } | null>(null);
  const [currentPackage, setCurrentPackage] = useState<UsageData>({
    name: "Your Package",
    allocation: { sms: 0, whatsapp: 0, avr: 0 },
    usage: { sms: 0, whatsapp: 0, avr: 0 },
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  // -------------------- ERROR + LOADING STATES --------------------
  const [loading, setLoading] = useState({
    wallet: true,
    usage: true,
    transactions: true,
    packages: true,
  });

  const [errors, setErrors] = useState({
    wallet: null as string | null,
    usage: null as string | null,
    transactions: null as string | null,
    packages: null as string | null,
  });

  // -------------------- UI STATE --------------------
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(
    null
  );

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlertState({ isOpen: true, type, message });
    setTimeout(() => {
      setAlertState((prev) => ({ ...prev, isOpen: false }));
    }, 5000);
  };

  // -------------------- FETCH: WALLET --------------------
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading((prev) => ({ ...prev, wallet: true }));
        const balance = await getAccountBalance();
        setWallet({ units: balance.units });
      } catch (error) {
        console.error("Wallet fetch failed:", error);
        setErrors((prev) => ({ ...prev, wallet: "Failed to load wallet balance" }));
      } finally {
        setLoading((prev) => ({ ...prev, wallet: false }));
      }
    };
    fetchBalance();
  }, []);

  // -------------------- FETCH: PLANS --------------------
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading((prev) => ({ ...prev, packages: true }));
        const plans = await getPlans();

        const transformedPackages = plans.map((plan) => ({
          id: plan.plan_id,
          name: plan.name,
          description: plan.description,
          units: plan.sms_unit_price,
          allocation: {
            sms: plan.minimum_sms_purchase,
            whatsapp: 0,
            voice: 0,
          },
        }));

        setPackages(transformedPackages);
      } catch (error) {
        console.error("Plans fetch failed:", error);
        setErrors((prev) => ({
          ...prev,
          packages: "Failed to load available packages",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, packages: false }));
      }
    };
    fetchPlans();
  }, []);

  // -------------------- FETCH: USAGE --------------------
  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading((prev) => ({ ...prev, usage: true }));
        const logs = await getUsageLogs();

        const usage = logs.reduce(
          (acc: any, log: any) => {
            switch (log.service_name) {
              case ServiceName.SMS:
                acc.sms += log.quantity;
                break;
              case ServiceName.WHATSAPP:
                acc.whatsapp += log.quantity;
                break;
              case ServiceName.VOICE:
                acc.avr += log.quantity;
                break;
            }
            return acc;
          },
          { sms: 0, whatsapp: 0, avr: 0 }
        );

        setCurrentPackage((prev) => ({ ...prev, usage }));
      } catch (error) {
        console.error("Usage fetch failed:", error);
        setErrors((prev) => ({ ...prev, usage: "Failed to load usage data" }));
      } finally {
        setLoading((prev) => ({ ...prev, usage: false }));
      }
    };
    fetchUsageData();
  }, []);

  // -------------------- FETCH: TRANSACTIONS --------------------
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading((prev) => ({ ...prev, transactions: true }));
        const response = await getTransactionHistory();
        setTransactions(response.transactions);
      } catch (error) {
        console.error("Transaction fetch failed:", error);
        setErrors((prev) => ({
          ...prev,
          transactions: "Failed to load transaction history",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, transactions: false }));
      }
    };
    fetchTransactions();
  }, []);

  // -------------------- TOP-UP HANDLER --------------------
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const response = await initiateUnitsPayment({
        mobile_money_number: phoneNumber,
        amount: topUpAmount,
      });

      if (response.marked_complete) {
        setWallet((prev) => ({
          ...prev,
          units: (prev?.units || 0) + response.units_purchased,
        }));
        setIsTopUpModalOpen(false);
        setPhoneNumber("");
        setTopUpAmount(0);
        showAlert("success", "Top-up completed successfully!");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      showAlert("error", "Failed to initiate payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------- PACKAGE PURCHASE --------------------
  const handlePurchase = async (pkg: Package) => {
    try {
      setPurchasingPackageId(pkg.id);
      if (!wallet || wallet.units < pkg.units) {
        showAlert("error", "Not enough credits in wallet to purchase this package.");
        return;
      }

      const allocationsResponse = await getAllocationsFromPackage(pkg.id);
      if (!allocationsResponse.status)
        throw new Error("Failed to get package allocations");

      setWallet((prev) =>
        prev ? { ...prev, units: prev.units - pkg.units } : null
      );

      showAlert("success", "Package purchased successfully!");
    } catch (error) {
      console.error("Package purchase failed:", error);
      showAlert("error", "Failed to purchase package. Please try again.");
    } finally {
      setPurchasingPackageId(null);
    }
  };

  // -------------------- HELPERS --------------------
  const calcUsagePercent = (used: number, total: number) =>
    total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));

  // -------------------- UI RENDER --------------------
  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen space-y-8">
      <Alert
        type={alertState.type}
        message={alertState.message}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Wallet Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Wallet className="w-8 h-8 text-[#00333e]" />
          <div>
            <h2 className="text-lg font-semibold text-[#00333e]">Wallet Balance</h2>
            {loading.wallet ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading balance...</span>
              </div>
            ) : errors.wallet ? (
              <p className="text-red-500 text-sm">{errors.wallet}</p>
            ) : (
              <p className="text-2xl font-bold text-[#00333e]">
                {wallet?.units?.toLocaleString()} Units
              </p>
            )}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f]"
          disabled={loading.wallet}
          onClick={() => setIsTopUpModalOpen(true)}
        >
          Top Up
        </button>
      </motion.div>

      {/* Usage Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
      >
        <h3 className="text-xl font-medium text-[#00333e] mb-4">Current Usage</h3>
        {errors.usage ? (
          <p className="text-red-500 text-sm">{errors.usage}</p>
        ) : loading.usage ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 animate-spin text-[#00333e]" />
          </div>
        ) : (
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
        )}
      </motion.div>

      {/* Packages */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
      >
        <h3 className="text-xl font-medium text-[#00333e] mb-4">Available Packages</h3>
        {errors.packages ? (
          <p className="text-red-500 text-sm">{errors.packages}</p>
        ) : loading.packages ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#00333e]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-semibold text-[#00333e] mb-1">
                    {pkg.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                    {pkg.description}
                  </p>
                  <p className="text-sm mb-3 text-[#00333e] font-medium">
                    {pkg.units.toLocaleString()} Units
                  </p>
                </div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  className="w-full px-4 py-2 bg-[#fddf0d] text-[#00333e] rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    purchasingPackageId === pkg.id ||
                    !wallet ||
                    wallet.units < pkg.units
                  }
                >
                  {purchasingPackageId === pkg.id ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    "Purchase"
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
      >
        <h3 className="text-xl font-medium text-[#00333e] mb-4">
          Transaction History
        </h3>
        {errors.transactions ? (
          <p className="text-red-500 text-sm">{errors.transactions}</p>
        ) : loading.transactions ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#00333e]" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No transaction history available.
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((t: any) => (
              <div
                key={t.transaction_id}
                className="bg-white p-4 rounded-md border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[#00333e]">
                      {t.units_purchased.toLocaleString()} Units
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#00333e]">
                      {t.total_amount_paid.toLocaleString()} Tsh
                    </p>
                    <p
                      className={`text-sm ${
                        t.marked_complete
                          ? "text-green-500"
                          : "text-orange-500"
                      }`}
                    >
                      {t.marked_complete ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Subscription;
