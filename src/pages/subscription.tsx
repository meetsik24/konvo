import React, { useState, useEffect } from "react";
import { X, Loader2, Wallet, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Alert from "../components/Alert";
import {
  getAccountBalance,
  initiateUnitsPayment,
  getAllocationsFromPackage,
  getTransactions,
  getPlans,
  getBalanceUsageLogs,
  getAllocationsSummary
} from "../services/api";

interface Package {
  id: string;
  name: string;
  description: string;
  units: number;
  unitPrice: number;
  minSms: number;
  maxSms: number;
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

  const [fullHistory, setFullHistory] = useState<any[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionFilter, setTransactionFilter] = useState<"all" | "usage" | "topup">("all");
  const itemsPerPage = 5;

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
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPackageDetailsModalOpen, setIsPackageDetailsModalOpen] = useState(false);
  const [smsQuantity, setSmsQuantity] = useState<number>(0);
  const [smsError, setSmsError] = useState<string>("");

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
        setWallet({ units: balance.balance });
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

        // Sort plans by minimum SMS to ensure proper ordering
        const sortedPlans = [...plans].sort((a, b) => a.minimum_sms_purchase - b.minimum_sms_purchase);

        const transformedPackages = sortedPlans.map((plan, index) => {
          // Max SMS of current package = Min SMS of next package - 1
          const maxSms = index < sortedPlans.length - 1 
            ? sortedPlans[index + 1].minimum_sms_purchase - 1
            : plan.minimum_sms_purchase + (plan.maximum_sms_purchase || 100000);

          return {
            id: plan.plan_id,
            name: plan.name,
            description: plan.description,
            units: plan.sms_unit_price,
            unitPrice: plan.sms_unit_price,
            minSms: plan.minimum_sms_purchase,
            maxSms: maxSms,
            allocation: {
              sms: plan.minimum_sms_purchase,
              whatsapp: 0,
              voice: 0,
            },
          };
        });

        setPackages(transformedPackages);
        console.log("Loaded packages from API:", transformedPackages);
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
        
        // Fetch allocations summary only
        const allocationsData = await getAllocationsSummary();
        console.log("Allocations Data:", allocationsData);

        // Calculate allocations from the allocations summary endpoint
        const allocation = { sms: 0, whatsapp: 0, avr: 0 };
        allocationsData.allocations.forEach((alloc: any) => {
          if (alloc.service_name === "SMS") {
            allocation.sms = alloc.total_units_allocated;
          } else if (alloc.service_name === "WHATSAPP") {
            allocation.whatsapp = alloc.total_units_allocated;
          } else if (alloc.service_name === "VOICE") {
            allocation.avr = alloc.total_units_allocated;
          }
        });

        // Initialize usage as zero (no usage data from this endpoint)
        const usage = { sms: 0, whatsapp: 0, avr: 0 };

        setCurrentPackage((prev) => ({ ...prev, allocation, usage }));
      } catch (error) {
        console.error("Usage allocation fetch failed:", error);
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
        setIsTransactionsLoading(true);

        const topUps = await getTransactions();

        const normalizedTopUps = (Array.isArray(topUps) ? topUps : []).map((tx: any) => ({
          type: "topup",
          units: tx.units_purchased,
          amount: tx.total_amount_paid,
          date: tx.transaction_date,
          status: tx.marked_complete ? "Completed" : "Pending",
          source: "Wallet Top-Up"
        }));

        const balanceUsage = await getBalanceUsageLogs();

        const normalizedPurchases = (Array.isArray(balanceUsage) ? balanceUsage : []).map((p: any) => ({
          type: "package",
          units: p.units_used,
          amount: 0,
          date: p.usage_date,
          status: "Completed",
          source: p.usage_description
        }));

        const merged = [...normalizedTopUps, ...normalizedPurchases];
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setFullHistory(merged);

      } catch (error) {
        console.error("Failed to fetch transaction history:", error);
        setTransactionsError("Failed to load transaction history");
      } finally {
        setIsTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [transactions]);

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

  // -------------------- SMS QUANTITY VALIDATION --------------------
  const validateSmsQuantity = (quantity: number, pkg: Package): string => {
    if (!quantity || quantity <= 0) {
      return "Please enter a valid SMS quantity";
    }
    if (quantity < pkg.minSms) {
      return `Minimum SMS for this package is ${pkg.minSms.toLocaleString()}`;
    }
    if (quantity > pkg.maxSms) {
      return `Maximum SMS for this package is ${pkg.maxSms.toLocaleString()}`;
    }
    return "";
  };

  // -------------------- PACKAGE PURCHASE --------------------
  const handlePurchase = async (pkg: Package) => {
    const error = validateSmsQuantity(smsQuantity, pkg);
    if (error) {
      setSmsError(error);
      return;
    }

    try {
      setPurchasingPackageId(pkg.id);
      const totalCost = smsQuantity * pkg.unitPrice;

      if (!wallet || wallet.units < totalCost) {
        showAlert("error", `Not enough credits. You need ${totalCost} units but have ${wallet?.units || 0}`);
        return;
      }

      const allocationsResponse = await getAllocationsFromPackage(pkg.id);
      if (!allocationsResponse.status)
        throw new Error("Failed to get package allocations");

      setWallet((prev) =>
        prev ? { ...prev, units: prev.units - totalCost } : null
      );

      setSmsQuantity(0);
      setSmsError("");
      setIsPackageDetailsModalOpen(false);
      showAlert("success", `Successfully purchased ${smsQuantity.toLocaleString()} SMS for ${totalCost} units!`);
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

  // Filter transactions based on type
  const filteredHistory = fullHistory.filter((item) => {
    if (transactionFilter === "all") return true;
    if (transactionFilter === "usage") return item.type === "package";
    if (transactionFilter === "topup") return item.type === "topup";
    return true;
  });

  // Pagination helpers
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  const openPackageModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSmsQuantity(0);
    setSmsError("");
    setIsPackageDetailsModalOpen(true);
  };

  // -------------------- UI RENDER --------------------
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen space-y-8">
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
          className="bg-white p-4 sm:p-6 rounded-md border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Wallet className="w-6 sm:w-8 h-6 sm:h-8 text-[#00333e] flex-shrink-0" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#00333e]">Wallet Balance</h2>
                {loading.wallet ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Loading balance...</span>
                  </div>
                ) : errors.wallet ? (
                  <p className="text-red-500 text-xs sm:text-sm">{errors.wallet}</p>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-[#00333e]">
                    {wallet?.units?.toLocaleString()} Units
                  </p>
                )}
              </div>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f] transition-colors"
              disabled={loading.wallet}
              onClick={() => setIsTopUpModalOpen(true)}
            >
              Top Up
            </button>
          </div>
        </motion.div>

        {/* Usage Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-6 rounded-md border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg sm:text-xl font-medium text-[#00333e] mb-4">Current Usage</h3>
          {errors.usage ? (
            <p className="text-red-500 text-sm">{errors.usage}</p>
          ) : loading.usage ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#00333e]" />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(currentPackage.allocation).map(([key, total]) => {
                const used = currentPackage.usage[
                  key as keyof typeof currentPackage.usage
                ];
                return (
                  <div key={key} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-md">
                    <span className="text-xs sm:text-sm text-gray-600 capitalize font-medium">{key}</span>
                    <span className="text-xs sm:text-base text-[#00333e] font-semibold">
                      {used.toLocaleString()} / {total.toLocaleString()} units
                    </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {packages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  className="bg-white p-4 sm:p-6 rounded-md border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-[#00333e] mb-1">
                      {pkg.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                      {pkg.description?.length > 100 
                        ? `${pkg.description.substring(0, 100)}...` 
                        : pkg.description}
                    </p>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md mb-3">
                      <p className="text-xs text-gray-600 mb-1">Price per SMS</p>
                      <p className="text-lg sm:text-xl font-bold text-[#00333e]">
                        {pkg.unitPrice} Units
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-md">
                      <p className="text-xs text-gray-600 mb-1">SMS Range</p>
                      <p className="text-xs sm:text-sm font-medium text-[#00333e]">
                        {pkg.minSms.toLocaleString()} - {pkg.maxSms.toLocaleString()} SMS
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => openPackageModal(pkg)}
                      className="w-full px-3 sm:px-4 py-2 bg-gray-100 text-[#00333e] rounded-md text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      View Details
                      <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-6 rounded-md border border-gray-100 shadow-sm"
        >
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <h3 className="text-lg sm:text-xl font-medium text-[#00333e]">Transaction History</h3>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setTransactionFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    transactionFilter === "all"
                      ? "bg-[#00333e] text-white"
                      : "bg-gray-100 text-[#00333e] hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setTransactionFilter("usage");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    transactionFilter === "usage"
                      ? "bg-[#00333e] text-white"
                      : "bg-gray-100 text-[#00333e] hover:bg-gray-200"
                  }`}
                >
                  Package Usage
                </button>
                <button
                  onClick={() => {
                    setTransactionFilter("topup");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    transactionFilter === "topup"
                      ? "bg-[#00333e] text-white"
                      : "bg-gray-100 text-[#00333e] hover:bg-gray-200"
                  }`}
                >
                  Top-Up
                </button>
              </div>
            </div>

            {isTransactionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#00333e]" />
              </div>
            ) : transactionsError ? (
              <p className="text-red-500 text-sm">{transactionsError}</p>
            ) : filteredHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions found.</p>
            ) : (
              <div>
                <div className="space-y-3 sm:space-y-4">
                  {paginatedHistory.map((historyItem, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 sm:p-4 rounded-md border border-gray-100 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <p className="font-medium text-[#00333e] text-sm sm:text-base">
                            {historyItem.units.toLocaleString()} Units
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {new Date(historyItem.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          {historyItem.amount > 0 && (
                            <p className="font-medium text-[#00333e] text-sm sm:text-base">
                              {historyItem.amount.toLocaleString()} Tsh
                            </p>
                          )}
                          <p
                            className={`text-xs sm:text-sm ${
                              historyItem.status === "Completed"
                                ? "text-green-500"
                                : "text-orange-500"
                            }`}
                          >
                            {historyItem.status}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">{historyItem.source}</p>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-200 gap-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-[#00333e] rounded-md text-xs sm:text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-[#00333e] rounded-md text-xs sm:text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Package Details Modal */}
      {isPackageDetailsModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-md max-w-md w-full shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#00333e]">{selectedPackage.name}</h2>
              <button
                onClick={() => setIsPackageDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-[#00333e] mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{selectedPackage.description}</p>
              </div>

              {/* Price Info */}
              <div>
                <h3 className="text-sm font-medium text-[#00333e] mb-2">Price</h3>
                <p className="text-2xl font-bold text-[#00333e">
                  {selectedPackage.unitPrice} Units per SMS
                </p>
              </div>

              {/* SMS Range */}
              <div>
                <h3 className="text-sm font-medium text-[#00333e] mb-2">Available SMS Range</h3>
                <p className="text-lg font-semibold text-[#00333e]">
                  {selectedPackage.minSms.toLocaleString()} - {selectedPackage.maxSms.toLocaleString()} SMS
                </p>
              </div>

              {/* SMS Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  How many SMS do you want?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.max(selectedPackage.minSms, smsQuantity - 100);
                      setSmsQuantity(newValue);
                      if (newValue > 0) {
                        setSmsError(validateSmsQuantity(newValue, selectedPackage));
                      } else {
                        setSmsError("");
                      }
                    }}
                    className="px-3 py-2 bg-gray-200 text-[#00333e] rounded-md hover:bg-gray-300 font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={smsQuantity || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setSmsQuantity(value);
                      if (value > 0) {
                        setSmsError(validateSmsQuantity(value, selectedPackage));
                      } else {
                        setSmsError("");
                      }
                    }}
                    placeholder="Enter SMS quantity"
                    min={selectedPackage.minSms}
                    max={selectedPackage.maxSms}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e] text-center"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.min(selectedPackage.maxSms, smsQuantity + 100);
                      setSmsQuantity(newValue);
                      if (newValue > 0) {
                        setSmsError(validateSmsQuantity(newValue, selectedPackage));
                      } else {
                        setSmsError("");
                      }
                    }}
                    className="px-3 py-2 bg-gray-200 text-[#00333e] rounded-md hover:bg-gray-300 font-bold"
                  >
                    +
                  </button>
                </div>
                {smsError && (
                  <p className="text-red-500 text-xs mt-2">{smsError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Range: {selectedPackage.minSms.toLocaleString()} - {selectedPackage.maxSms.toLocaleString()} SMS
                </p>
              </div>

              {/* Cost Breakdown */}
              {smsQuantity > 0 && !smsError && (
                <div className="bg-blue-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SMS Quantity:</span>
                    <span className="font-medium text-[#00333e]">{smsQuantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium text-[#00333e]">{selectedPackage.unitPrice} units/SMS</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between">
                    <span className="font-semibold text-[#00333e]">Total Cost:</span>
                    <span className="text-lg font-bold text-[#fddf0d]">
                      {(smsQuantity * selectedPackage.unitPrice).toLocaleString()} Units
                    </span>
                  </div>
                  {wallet && (
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-gray-600">Wallet Balance:</span>
                      <span className={wallet.units >= smsQuantity * selectedPackage.unitPrice ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {wallet.units.toLocaleString()} Units
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setIsPackageDetailsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-[#00333e] rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handlePurchase(selectedPackage)}
                className="flex-1 px-4 py-2 bg-[#fddf0d] text-[#00333e] rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  purchasingPackageId === selectedPackage.id ||
                  !wallet ||
                  smsQuantity <= 0 ||
                  !!smsError ||
                  wallet.units < smsQuantity * selectedPackage.unitPrice
                }
              >
                {purchasingPackageId === selectedPackage.id ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  `Purchase ${smsQuantity.toLocaleString()} SMS`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top-Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-md max-w-md w-full shadow-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#00333e]">Top Up Wallet</h2>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleTopUp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter mobile money number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  Amount (Tsh)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseFloat(e.target.value))}
                  placeholder="Enter amount"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#00333e] rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-[#00333e] text-white rounded-md text-sm font-medium hover:bg-[#00262f] disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Top Up"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Subscription;