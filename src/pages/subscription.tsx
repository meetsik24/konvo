import React, { useState, useEffect } from "react";
import { MessageSquare, Phone, Wallet, Plus, X, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Alert
          type={alertState.type}
          message={alertState.message}
          isOpen={alertState.isOpen}
          onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Header with Wallet */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your units and services</p>
            </div>
            <div className="text-right">
              {loading.wallet ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : errors.wallet ? (
                <p className="text-red-500 text-sm">{errors.wallet}</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Wallet Balance</p>
                  <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-blue-600" />
                    {wallet?.units?.toLocaleString() || 0}
                  </p>
                  <button
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Top Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Current Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Allocation</h2>
          {errors.usage ? (
            <p className="text-red-500 text-sm">{errors.usage}</p>
          ) : loading.usage ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">SMS</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPackage.allocation.sms.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">units allocated</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPackage.allocation.whatsapp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">units allocated</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Voice</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPackage.allocation.avr.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">units allocated</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Units</h2>
          {errors.packages ? (
            <p className="text-red-500 text-sm">{errors.packages}</p>
          ) : loading.packages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => openServiceModal("sms")}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="relative z-10 flex flex-col items-center text-white">
                  <MessageSquare className="w-10 h-10 mb-3" />
                  <h3 className="text-lg font-semibold">SMS</h3>
                  <p className="text-sm text-blue-100 mt-1">
                    {getPackagesByService("sms").length} packages
                  </p>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>

              <button
                onClick={() => openServiceModal("whatsapp")}
                className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="relative z-10 flex flex-col items-center text-white">
                  <MessageSquare className="w-10 h-10 mb-3" />
                  <h3 className="text-lg font-semibold">WhatsApp</h3>
                  <p className="text-sm text-green-100 mt-1">
                    {getPackagesByService("whatsapp").length} packages
                  </p>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>

              <button
                onClick={() => openServiceModal("voice")}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="relative z-10 flex flex-col items-center text-white">
                  <Phone className="w-10 h-10 mb-3" />
                  <h3 className="text-lg font-semibold">Voice</h3>
                  <p className="text-sm text-purple-100 mt-1">
                    {getPackagesByService("voice").length} packages
                  </p>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <div className="flex gap-2">
              {["all", "usage", "topup"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTransactionFilter(filter as typeof transactionFilter);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    transactionFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter === "all" ? "All" : filter === "usage" ? "Usage" : "Top-Up"}
                </button>
              ))}
            </div>
          </div>

          {isTransactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : transactionsError ? (
            <p className="text-red-500 text-sm">{transactionsError}</p>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.units.toLocaleString()} Units
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{item.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                    {item.amount > 0 && (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {item.amount.toLocaleString()} Tsh
                      </p>
                    )}
                    <span
                      className={`inline-block text-xs font-medium mt-1 px-2 py-1 rounded ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Service Modal - Shows Packages for Selected Service */}
      {isServiceModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {selectedService === "sms" && <MessageSquare className="w-6 h-6 text-blue-600" />}
                {selectedService === "whatsapp" && <MessageSquare className="w-6 h-6 text-green-600" />}
                {selectedService === "voice" && <Phone className="w-6 h-6 text-purple-600" />}
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedService === "sms" && "SMS Packages"}
                  {selectedService === "whatsapp" && "WhatsApp Packages"}
                  {selectedService === "voice" && "Voice Packages"}
                </h2>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Section */}
            <div className="p-6 border-b bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How many units do you need?
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={userRequiredUnits || ""}
                  onChange={(e) => handleUserUnitInput(parseInt(e.target.value) || 0)}
                  placeholder="Enter number of units"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (userRequiredUnits > 0 && recommendedPackage) {
                      setSelectedPackage(recommendedPackage);
                      setSelectedUnits(userRequiredUnits);
                      setUnitError("");
                      setIsServiceModalOpen(false);
                      setIsPackageDetailsModalOpen(true);
                    }
                  }}
                  disabled={userRequiredUnits <= 0 || !recommendedPackage}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Purchase
                </button>
              </div>
              {userRequiredUnits > 0 && !recommendedPackage && (
                <p className="text-red-500 text-sm mt-2">
                  No packages available for {userRequiredUnits.toLocaleString()} units
                </p>
              )}
            </div>

            {/* Packages Grid */}
            <div className="p-6 flex-1 overflow-y-auto">
              {getPackagesByService(selectedService).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No packages available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPackagesByService(selectedService).map((pkg) => {
                    const { min, max } = getPackageUnitRange(pkg);
                    const isRecommended = recommendedPackage?.id === pkg.id;

                    return (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                          isRecommended
                            ? "bg-blue-50 border-blue-500 shadow-md"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {isRecommended && (
                          <div className="inline-block text-xs font-bold mb-2 px-2 py-1 bg-blue-600 text-white rounded">
                            RECOMMENDED
                          </div>
                        )}
                        
                        <h4 className="font-bold text-lg text-gray-900 mb-3">
                          {pkg.name}
                        </h4>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Price</span>
                            <span className="font-bold text-gray-900">
                              {(pkg.totalPrice || 0).toLocaleString()} Units
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Range</span>
                            <span className="font-semibold text-gray-900 text-sm">
                              {min.toLocaleString()} - {max.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Package Details Modal */}
      {isPackageDetailsModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedPackage.name}</h2>
              <button
                onClick={() => setIsPackageDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
              {selectedPackage.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedPackage.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Package Price</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {(selectedPackage.totalPrice || 0).toLocaleString()} Units
                </p>
              </div>

              {selectedPackage.services?.length > 0 && (() => {
                const { min, max } = getPackageUnitRange(selectedPackage);
                return (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Quantity (Units)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newValue = Math.max(min, selectedUnits - 100);
                          setSelectedUnits(newValue);
                          if (newValue > 0) {
                            setUnitError(validateUnitQuantity(newValue, selectedPackage));
                          }
                        }}
                        className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold flex items-center justify-center"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={selectedUnits || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setSelectedUnits(value);
                          if (value > 0) {
                            setUnitError(validateUnitQuantity(value, selectedPackage));
                          }
                        }}
                        placeholder="Enter quantity"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
                      />
                      <button
                        onClick={() => {
                          const newValue = Math.min(max, selectedUnits + 100);
                          setSelectedUnits(newValue);
                          if (newValue > 0) {
                            setUnitError(validateUnitQuantity(newValue, selectedPackage));
                          }
                        }}
                        className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    {unitError && (
                      <p className="text-red-500 text-sm mt-2">{unitError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Range: {min.toLocaleString()} - {max.toLocaleString()} units
                    </p>
                  </div>
                );
              })()}

              {selectedUnits > 0 && !unitError && selectedPackage.services?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Units to Purchase</span>
                    <span className="font-semibold text-gray-900">
                      {selectedUnits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Unit Price</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPackage.services[0]?.unit_cost_at_purchase || 0}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Cost</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {(selectedUnits * (selectedPackage.services[0]?.unit_cost_at_purchase || 0)).toLocaleString()}
                    </span>
                  </div>
                  {wallet && (
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-gray-700">Wallet Balance</span>
                      <span
                        className={
                          wallet.units >= selectedUnits * (selectedPackage.services[0]?.unit_cost_at_purchase || 0)
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {wallet.units.toLocaleString()} Units
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setIsPackageDetailsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchase(selectedPackage)}
                disabled={
                  purchasingPackageId === selectedPackage.id ||
                  !wallet ||
                  selectedUnits <= 0 ||
                  !!unitError ||
                  !selectedPackage.services?.[0] ||
                  wallet.units < selectedUnits * (selectedPackage.services[0]?.unit_cost_at_purchase || 0)
                }
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {purchasingPackageId === selectedPackage.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Purchase ${selectedUnits.toLocaleString()} Units`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top-Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Top Up Wallet</h2>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTopUp} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter mobile money number"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (Tsh)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseFloat(e.target.value))}
                  placeholder="Enter amount"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
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