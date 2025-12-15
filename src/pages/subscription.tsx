import React, { useState, useEffect } from "react";
import { FaEnvelope, FaWhatsapp, FaPhone, FaTimes, FaWallet, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import Alert from "../components/Alert";
import {
  getAccountBalance,
  initiateUnitsPayment,
  createAllocation,
  getTransactions,
  getPlans,
  getBalanceUsageLogs,
  getAllocationsSummary,
  completeTransaction,
} from "../services/api";

interface Package {
  id: string;
  name: string;
  description: string;
  totalPrice: number;
  services: Array<{
    service_id: string;
    units_allocated: number;
    unit_cost_at_purchase: number;
  }>;
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
  const [selectedUnits, setSelectedUnits] = useState<number>(0);
  const [unitError, setUnitError] = useState<string>("");
  const [selectedService, setSelectedService] = useState<"sms" | "whatsapp" | "voice" | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [userRequiredUnits, setUserRequiredUnits] = useState<number>(0);
  const [recommendedPackage, setRecommendedPackage] = useState<Package | null>(null);

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

        const transformedPackages = plans
          .filter(plan => plan && plan.package_id && plan.services && plan.services.length > 0)
          .map((plan) => {
            // Calculate total units from all services
            const totalUnits = plan.services.reduce((sum, service) => sum + service.units_allocated, 0);
            
            // Get voice service units (most packages seem to have voice services)
            const voiceService = plan.services.find(s => s.service_id === 'cc08b078-59d5-4d03-963e-e6f7a45ec867');
            const smsUnits = voiceService ? voiceService.units_allocated : totalUnits;

            return {
              id: plan.package_id,
              name: plan.name || 'Unnamed Package',
              description: plan.description || '',
              totalPrice: plan.total_price || 0,
              services: plan.services.map(service => ({
                service_id: service.service_id,
                units_allocated: service.units_allocated,
                unit_cost_at_purchase: service.unit_cost_at_purchase,
              })),
              allocation: {
                sms: smsUnits,
                whatsapp: 0,
                voice: smsUnits,
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
      
      // Step 1: Initiate payment
      const paymentResponse = await initiateUnitsPayment({
        amount_paid: topUpAmount,
        target_phone: phoneNumber,
        payment_method: "mobile_money",
      });

      if (paymentResponse.success) {
        console.log("Payment initiated. Payment Reference:", paymentResponse.payment_reference);
        
        // Store payment reference and transaction ID for completion check
        const paymentRef = paymentResponse.payment_reference;
        
        // Show pending status immediately
        showAlert(
          "success",
          `Payment initiated! Reference: ${paymentRef}. Verifying payment...`
        );

        // Step 2: Poll for payment completion (with timeout)
        let paymentCompleted = false;
        let completionAttempts = 0;
        const maxAttempts = 12; // 60 seconds with 5-second intervals
        const pollInterval = 5000; // 5 seconds

        const pollForCompletion = async () => {
          while (completionAttempts < maxAttempts && !paymentCompleted) {
            try {
              completionAttempts++;
              console.log(
                `Checking payment completion (attempt ${completionAttempts}/${maxAttempts})...`
              );

              // Call the complete transaction endpoint
              const completeResponse = await completeTransaction({
                payment_reference: paymentRef,
                transaction_id: "", // May not be available yet, API should handle this
              });

              if (completeResponse.success) {
                console.log("Payment completed successfully!", completeResponse);
                
                // Update wallet balance with the actual balance from response
                setWallet({ units: completeResponse.updated_balance });
                
                // Clear form
                setIsTopUpModalOpen(false);
                setPhoneNumber("");
                setTopUpAmount(0);
                
                // Show success alert with credit details
                showAlert(
                  "success",
                  `Payment completed! ${completeResponse.credits_added} units added. New balance: ${completeResponse.updated_balance} units`
                );
                
                paymentCompleted = true;
                setIsProcessing(false);
                return;
              }
            } catch (error) {
              console.log(
                `Payment not yet completed. Will retry in ${pollInterval / 1000} seconds...`,
                error
              );
            }

            // Wait before next attempt
            if (completionAttempts < maxAttempts && !paymentCompleted) {
              await new Promise((resolve) => setTimeout(resolve, pollInterval));
            }
          }

          // If we've exhausted all attempts
          if (!paymentCompleted) {
            console.log("Payment verification timeout. Please check your account balance.");
            showAlert(
              "success",
              `Payment initiated with reference: ${paymentRef}. Credits will be added shortly. Please refresh to check your balance.`
            );
            
            // Clear form anyway
            setIsTopUpModalOpen(false);
            setPhoneNumber("");
            setTopUpAmount(0);
            
            setIsProcessing(false);
          }
        };

        // Start polling in background
        pollForCompletion();
      } else {
        showAlert("error", paymentResponse.message || "Payment initiation failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      showAlert("error", "Failed to initiate payment.");
      setIsProcessing(false);
    }
  };

  // Helper function to fetch balance
  const fetchBalance = async () => {
    try {
      const balance = await getAccountBalance();
      setWallet({ units: balance.balance });
    } catch (error) {
      console.error("Failed to refresh wallet:", error);
    }
  };

  // -------------------- PACKAGE PURCHASE --------------------
  const handlePurchase = async (pkg: Package) => {
    const error = validateUnitQuantity(selectedUnits, pkg);
    if (error) {
      setUnitError(error);
      return;
    }

    try {
      setPurchasingPackageId(pkg.id);
      
      // Calculate cost based on first service's unit cost
      const unitCost = pkg.services[0]?.unit_cost_at_purchase || 1;
      const totalCost = selectedUnits * unitCost;

      if (!wallet || wallet.units < totalCost) {
        showAlert("error", `Not enough credits. You need ${totalCost} units but have ${wallet?.units || 0}`);
        return;
      }

      // Create allocations for each service in the package
      const allocationPromises = pkg.services.map((service) =>
        createAllocation({
          service_id: service.service_id,
          units_allocated: selectedUnits,
        })
      );

      const allocationsResponses = await Promise.all(allocationPromises);
      
      // Verify all allocations were created successfully
      if (!allocationsResponses || allocationsResponses.length === 0) {
        throw new Error("Failed to allocate units");
      }

      // Deduct credits from wallet
      setWallet((prev) =>
        prev ? { ...prev, units: prev.units - totalCost } : null
      );

      setSelectedUnits(0);
      setUnitError("");
      setIsPackageDetailsModalOpen(false);
      showAlert("success", `Successfully purchased ${selectedUnits.toLocaleString()} units for ${totalCost} units!`);
    } catch (error) {
      console.error("Package purchase failed:", error);
      showAlert("error", "Failed to purchase package. Please try again.");
    } finally {
      setPurchasingPackageId(null);
    }
  };

  // -------------------- HELPERS --------------------
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

  // -------------------- UNIT RANGE HELPERS --------------------
  const getPackageUnitRange = (pkg: Package): { min: number; max: number } => {
    // Get total units allocated from current package services
    const currentUnits = pkg.services.reduce((sum, service) => sum + service.units_allocated, 0);
    
    // Find the next package by sorting by units and finding current package's position
    const sortedByUnits = [...packages].sort((a, b) => {
      const aUnits = a.services.reduce((sum, s) => sum + s.units_allocated, 0);
      const bUnits = b.services.reduce((sum, s) => sum + s.units_allocated, 0);
      return aUnits - bUnits;
    });
    
    const currentIndex = sortedByUnits.findIndex(p => p.id === pkg.id);
    const nextPackage = currentIndex !== -1 && currentIndex < sortedByUnits.length - 1 
      ? sortedByUnits[currentIndex + 1]
      : null;
    
    const nextUnits = nextPackage 
      ? nextPackage.services.reduce((sum, service) => sum + service.units_allocated, 0)
      : currentUnits + 100000; // Default fallback
    
    return {
      min: currentUnits,
      max: nextUnits - 1,
    };
  };

  // -------------------- UNIT QUANTITY VALIDATION --------------------
  const validateUnitQuantity = (quantity: number, pkg: Package): string => {
    if (!quantity || quantity <= 0) {
      return "Please enter a valid unit quantity";
    }
    
    const { min, max } = getPackageUnitRange(pkg);
    
    if (quantity < min) {
      return `Minimum units for this package is ${min.toLocaleString()}`;
    }
    if (quantity > max) {
      return `Maximum units for this package is ${max.toLocaleString()}`;
    }
    return "";
  };

  // -------------------- SERVICE HELPERS --------------------
  const getPackagesByService = (service: "sms" | "whatsapp" | "voice" | null): Package[] => {
    if (!service) return [];
    
    const serviceIdMap = {
      sms: "fa1b30ef-6334-4459-88b9-c9f6762bf5c3", // Voice service
      whatsapp: "cc08b078-59d5-4d03-963e-e6f7a45ec867", // WhatsApp/SMS service
      voice: "cc08b078-59d5-4d03-963e-e6f7a45ec867", // Voice service
    };

    const targetServiceId = serviceIdMap[service];
    return packages.filter(pkg =>
      pkg.services.some(svc => svc.service_id === targetServiceId)
    );
  };

  const openServiceModal = (service: "sms" | "whatsapp" | "voice") => {
    setSelectedService(service);
    setSelectedPackage(null);
    setSelectedUnits(0);
    setUnitError("");
    setUserRequiredUnits(0);
    setRecommendedPackage(null);
    setIsServiceModalOpen(true);
  };

  const findRecommendedPackage = (requiredUnits: number, service: "sms" | "whatsapp" | "voice" | null) => {
    if (!requiredUnits || requiredUnits <= 0 || !service) {
      setRecommendedPackage(null);
      return;
    }

    const servicePackages = getPackagesByService(service);
    
    // Find the package whose range CONTAINS the user's input
    const recommended = servicePackages.find(pkg => {
      const { min, max } = getPackageUnitRange(pkg);
      return requiredUnits >= min && requiredUnits <= max;
    });

    setRecommendedPackage(recommended || null);
  };

  const handleUserUnitInput = (value: number) => {
    setUserRequiredUnits(value);
    findRecommendedPackage(value, selectedService);
  };

  // -------------------- UI RENDER --------------------
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Alert
        type={alertState.type}
        message={alertState.message}
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold text-[#004d66] mb-2">Subscription & Billing</h2>
        <p className="text-sm text-gray-600">Manage your wallet, view allocations, and track transactions</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-md p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Wallet Balance</p>
                {loading.wallet ? (
                  <p className="text-lg font-medium text-[#004d66]">Loading...</p>
                ) : errors.wallet ? (
                  <p className="text-sm text-red-500">{errors.wallet}</p>
                ) : (
                  <p className="text-lg font-medium text-[#004d66]">
                    {wallet?.units?.toLocaleString() || 0} Units
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsTopUpModalOpen(true)}
              disabled={loading.wallet}
              className="px-3 py-1.5 bg-[#004d66] text-white text-sm rounded-md hover:bg-[#003d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Top Up
            </button>
          </div>
        </motion.div>

        {/* SMS Allocation Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-md p-4 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-gradient-to-r from-[#e76f51] to-[#e76f51]">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">SMS Allocation</p>
              {loading.allocation ? (
                <p className="text-lg font-medium text-[#004d66]">Loading...</p>
              ) : (
                <p className="text-lg font-medium text-[#004d66]">
                  {allocation.sms.toLocaleString()} Units
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Voice Allocation Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-md p-4 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-gradient-to-r from-[#f4a261] to-[#f4a261]">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Voice Allocation</p>
              {loading.allocation ? (
                <p className="text-lg font-medium text-[#004d66]">Loading...</p>
              ) : (
                <p className="text-lg font-medium text-[#004d66]">
                  {allocation.voice.toLocaleString()} Units
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#004d66]">Transaction History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTransactionFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                transactionFilter === "all"
                  ? "bg-[#004d66] text-white"
                  : "bg-gray-100 text-[#004d66] hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setTransactionFilter("usage");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                transactionFilter === "usage"
                  ? "bg-[#004d66] text-white"
                  : "bg-gray-100 text-[#004d66] hover:bg-gray-200"
              }`}
            >
              Usage
            </button>
            <button
              onClick={() => {
                setTransactionFilter("topup");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                transactionFilter === "topup"
                  ? "bg-[#004d66] text-white"
                  : "bg-gray-100 text-[#004d66] hover:bg-gray-200"
              }`}
            >
              Top-Up
            </button>
          </div>
        </div>

        {loading.transactions ? (
          <div className="flex items-center justify-center py-12">
            <Clock className="w-6 h-6 animate-spin text-[#004d66]" />
            <span className="ml-2 text-gray-600">Loading transactions...</span>
          </div>
        ) : errors.transactions ? (
          <p className="text-red-500 text-sm py-4">{errors.transactions}</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No transactions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTransactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === "topup"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {transaction.type === "topup" ? "Top-Up" : "Usage"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#004d66]">
                        {transaction.type === "topup" ? "+" : "-"}
                        {transaction.units.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.amount > 0 ? `${transaction.amount.toLocaleString()} Tsh` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.status === "Completed" ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-gray-100 text-[#004d66] rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-gray-100 text-[#004d66] rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Top-Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-md max-w-md w-full shadow-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#004d66]">Top Up Wallet</h2>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTopUp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter mobile money number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d66] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-2">
                  Amount (Tsh)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d66] text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#004d66] rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-[#004d66] text-white rounded-md text-sm font-medium hover:bg-[#003d52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Clock className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    "Top Up"
                  )}
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