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
    quantity: number;
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
            const totalUnits = plan.services.reduce((sum, service) => sum + (service.quantity || 0), 0);

            // Get voice service units (most packages seem to have voice services)
            const voiceService = plan.services.find(s => s.service_id === 'cc08b078-59d5-4d03-963e-e6f7a45ec867');
            const smsUnits = voiceService ? (voiceService.quantity || 0) : totalUnits;

            return {
              id: plan.package_id,
              name: plan.name || 'Unnamed Package',
              description: plan.description || '',
              totalPrice: plan.total_price || 0,
              services: plan.services.map(service => ({
                service_id: service.service_id,
                quantity: service.quantity || 0,
                unit_cost_at_purchase: service.unit_cost_at_purchase || 0,
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
            allocation.sms = alloc.total_quantity;
          } else if (alloc.service_name === "WHATSAPP") {
            allocation.whatsapp = alloc.total_quantity;
          } else if (alloc.service_name === "VOICE") {
            allocation.avr = alloc.total_quantity;
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
          quantity: selectedUnits,
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
    const currentUnits = pkg.services && pkg.services.length > 0
      ? pkg.services.reduce((sum, service) => sum + (service.quantity || 0), 0)
      : 0;

    // Special case: Kitonga package has a maximum of 19,999
    if (pkg.name === "Kitonga") {
      return {
        min: currentUnits || 1,
        max: 19999,
      };
    }

    // Special case: Paradiso package has a maximum of 5,000,000
    if (pkg.name === "Paradiso") {
      return {
        min: currentUnits || 1,
        max: 5000000,
      };
    }

    // Find the next package by sorting by units and finding current package's position
    const sortedByUnits = [...packages].sort((a, b) => {
      const aUnits = a.services && a.services.length > 0
        ? a.services.reduce((sum, s) => sum + (s.quantity || 0), 0)
        : 0;
      const bUnits = b.services && b.services.length > 0
        ? b.services.reduce((sum, s) => sum + (s.quantity || 0), 0)
        : 0;
      return aUnits - bUnits;
    });

    const currentIndex = sortedByUnits.findIndex(p => p.id === pkg.id);
    const nextPackage = currentIndex !== -1 && currentIndex < sortedByUnits.length - 1
      ? sortedByUnits[currentIndex + 1]
      : null;

    const nextUnits = nextPackage
      ? (nextPackage.services && nextPackage.services.length > 0
          ? nextPackage.services.reduce((sum, service) => sum + (service.quantity || 0), 0)
          : 0)
      : currentUnits + 100000; // Default fallback

    // max of current package = min of next package (no gaps)
    return {
      min: currentUnits || 1,
      max: nextUnits > currentUnits ? nextUnits : (currentUnits + 100000),
    };
  };

  // -------------------- UNIT QUANTITY VALIDATION --------------------
  const validateUnitQuantity = (quantity: number, pkg: Package): string => {
    if (!quantity || quantity <= 0) {
      return "Please enter a valid unit quantity";
    }

    const { min, max } = getPackageUnitRange(pkg);

    // Allow any positive quantity; remove strict min/max validation
    // to allow customers to purchase custom amounts
    if (quantity < min && min > 0) {
      // Only require minimum if the package has a defined minimum
      return `Minimum units for this package is ${min.toLocaleString()}`;
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
    <div className="p-6">
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
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#00333e]">Subscription</h1>
              <p className="text-gray-500 text-xs font-medium mt-1">Manage your units and services</p>
            </div>
            <div className="flex items-center gap-3">
              {loading.wallet ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : errors.wallet ? (
                <p className="text-red-500 text-xs">{errors.wallet}</p>
              ) : (
                <>
                  <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center gap-3">
                    <div className="p-1.5 bg-green-50 rounded-md">
                      <Wallet className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Wallet Balance</p>
                      <p className="text-sm font-bold text-[#00333e]">
                        {wallet?.units?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="flex items-center gap-2 bg-[#00333e] text-white px-4 py-2 rounded-xl border border-[#00333e] hover:bg-[#004d5e] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <div>
                      <p className="text-xs font-medium">Top Up</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Current Allocation & Purchase Units - Combined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          {/* Current Allocation Section */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#00333e] mb-4 uppercase tracking-wider">Current Allocation</h2>
            {errors.usage ? (
              <p className="text-red-500 text-xs">{errors.usage}</p>
            ) : loading.usage ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white text-[#00333e]">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00333e]">
                      {currentPackage.allocation.sms.toLocaleString()}
                    </h3>
                    <p className="text-gray-500 text-xs font-medium">SMS</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white text-[#00333e]">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00333e]">
                      {currentPackage.allocation.whatsapp.toLocaleString()}
                    </h3>
                    <p className="text-gray-500 text-xs font-medium">WhatsApp Messages</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white text-[#00333e]">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#00333e]">
                      {currentPackage.allocation.avr.toLocaleString()}
                    </h3>
                    <p className="text-gray-500 text-xs font-medium">Minutes</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Purchase Units Section */}
          <div>
            <h2 className="text-sm font-bold text-[#00333e] mb-4 uppercase tracking-wider">Purchase Units</h2>
            {errors.packages ? (
              <p className="text-red-500 text-xs">{errors.packages}</p>
            ) : loading.packages ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => openServiceModal("sms")}
                  className="group relative overflow-hidden bg-[#00333e] p-4 rounded-xl border border-[#00333e] hover:bg-[#004d5e] transition-colors"
                >
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-[#004d66]">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-medium">SMS</h3>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {getPackagesByService("sms").length} packages
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  disabled
                  className="group relative overflow-hidden bg-gray-300 p-4 rounded-xl border border-gray-300 cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="p-2 rounded-lg bg-gray-400">
                      <MessageSquare className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-medium">WhatsApp</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Not Available
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  disabled
                  className="group relative overflow-hidden bg-gray-300 p-4 rounded-xl border border-gray-300 cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="p-2 rounded-lg bg-gray-400">
                      <Phone className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-medium">Voice</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Not Available
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-medium text-[#004d66]">Transaction History</h2>
            <div className="flex gap-2">
              {["all", "usage", "topup"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setTransactionFilter(filter as typeof transactionFilter);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${transactionFilter === filter
                    ? "bg-[#00333e] text-white"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e]"></div>
            </div>
          ) : transactionsError ? (
            <p className="text-red-500 text-sm">{transactionsError}</p>
          ) : filteredHistory.length === 0 ? (
            <p className="text-gray-600">No transactions found</p>
          ) : (
            <div>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">
                          {item.type === "topup" ? "Top-Up" : "Usage"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#004d66]">{item.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#004d66]">
                          {item.units.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">
                          {item.amount > 0 ? `${item.amount.toLocaleString()} Tsh` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center ${item.status === "Completed" ? "text-green-600" : "text-orange-600"
                            }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {paginatedHistory.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-bold text-[#00333e] uppercase tracking-wider">
                          {item.type === "topup" ? "Top-Up" : "Usage"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${item.status === "Completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                        }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Description</span>
                        <span className="text-[#00333e] font-medium text-right">{item.source}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Units</span>
                        <span className="text-[#00333e] font-bold">{item.units.toLocaleString()}</span>
                      </div>
                      {item.amount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Amount</span>
                          <span className="text-[#00333e] font-medium">{item.amount.toLocaleString()} Tsh</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-gray-100 text-[#00333e] rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-gray-100 text-[#00333e] rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Purchase Modal */}
      {isServiceModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg sm:rounded-xl w-full max-w-md sm:max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-3 sm:p-6 border-b rounded-t-lg sm:rounded-t-xl z-10">
              <h2 className="text-xs sm:text-base font-bold text-[#00333e]">
                Purchase {selectedService === "sms" ? "SMS" : selectedService === "whatsapp" ? "WhatsApp" : "Voice"}
              </h2>
              <button
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setSelectedPackage(null);
                  setSelectedUnits(0);
                  setUnitError("");
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
              {/* Package Selection */}
              <div className={selectedPackage ? "hidden sm:block" : ""}>
                <label className="block text-xs font-bold text-[#00333e] mb-2 uppercase tracking-wider">
                  Package
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {getPackagesByService(selectedService).map((pkg, index) => {
                    const { min, max } = getPackageUnitRange(pkg);
                    const isPopular = index === 1;
                    const isSelected = selectedPackage?.id === pkg.id;

                    return (
                      <button
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPackage(pkg);
                          const { min } = getPackageUnitRange(pkg);
                          setSelectedUnits(min);
                          setUnitError("");
                        }}
                        className={`relative p-2 sm:p-4 rounded-lg border-2 transition-all text-left ${isSelected
                          ? "border-[#00333e] bg-[#00333e]/5"
                          : isPopular
                            ? "border-[#fddf0d] bg-[#fddf0d]/5 hover:bg-[#fddf0d]/10"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                            <span className="bg-[#fddf0d] text-[#00333e] text-xs font-bold px-1 sm:px-2 py-0.5 rounded">
                              ★
                            </span>
                          </div>
                        )}
                        <div className="space-y-0.5 sm:space-y-2">
                          <h4 className="font-bold text-xs text-[#00333e]">{pkg.name}</h4>
                          <p className="text-xs text-gray-600">
                            {min.toLocaleString()} - {max === Infinity ? '∞' : max.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Units Input & Summary */}
              {selectedPackage && selectedPackage.services?.length > 0 && (() => {
                const { min, max } = getPackageUnitRange(selectedPackage);
                const unitPrice = selectedPackage.services[0]?.unit_cost_at_purchase || 0;
                const totalCost = selectedUnits * unitPrice;

                return (
                  <>
                    {/* Selected Package Info - Mobile Only */}
                    <div className="sm:hidden bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">Selected Package</p>
                          <p className="text-sm font-bold text-[#00333e]">{selectedPackage.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Range: {min.toLocaleString()} - {max === Infinity ? '∞' : max.toLocaleString()} units
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPackage(null);
                            setSelectedUnits(0);
                            setUnitError("");
                          }}
                          className="text-xs text-[#00333e] underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Units Input */}
                    <div>
                      <label className="block text-xs font-bold text-[#00333e] mb-2 uppercase tracking-wider">
                        Units
                      </label>
                      <input
                        type="number"
                        value={selectedUnits || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setSelectedUnits(value);

                          // Auto-select appropriate package based on units entered
                          if (value > 0 && selectedService) {
                            const servicePackages = getPackagesByService(selectedService);
                            const appropriatePackage = servicePackages.find(pkg => {
                              const { min, max } = getPackageUnitRange(pkg);
                              return value >= min && value <= max;
                            });

                            if (appropriatePackage && appropriatePackage.id !== selectedPackage?.id) {
                              setSelectedPackage(appropriatePackage);
                            }

                            const error = appropriatePackage
                              ? validateUnitQuantity(value, appropriatePackage)
                              : "No package available for this quantity";
                            setUnitError(error);
                          } else {
                            setUnitError("");
                          }
                        }}
                        placeholder={`${min.toLocaleString()} - ${max.toLocaleString()}`}
                        className="w-full px-3 py-2 sm:py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-transparent"
                      />
                      {unitError && (
                        <p className="text-red-500 text-xs mt-1">{unitError}</p>
                      )}
                    </div>

                    {/* Cost Summary - Compact on Mobile */}
                    {selectedUnits > 0 && !unitError && (
                      <div className="bg-[#00333e]/5 rounded-lg p-3 border border-[#00333e]/20">
                        {/* Desktop View */}
                        <div className="hidden sm:block">
                          <h3 className="text-xs font-bold text-[#00333e] mb-2.5 uppercase tracking-wider">
                            Summary
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Package</span>
                              <span className="text-xs font-bold text-[#00333e]">{selectedPackage.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Units</span>
                              <span className="text-xs font-medium text-[#00333e]">{selectedUnits.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Unit Price</span>
                              <span className="text-xs font-medium text-[#00333e]">{unitPrice}</span>
                            </div>
                            <div className="border-t border-[#00333e]/20 pt-2 flex justify-between items-center">
                              <span className="text-sm font-bold text-[#00333e]">Total</span>
                              <span className="text-lg font-bold text-[#00333e]">{totalCost.toLocaleString()}</span>
                            </div>
                            {wallet && (
                              <div className="flex justify-between items-center pt-2 border-t border-[#00333e]/20">
                                <span className="text-xs text-gray-600">Balance</span>
                                <span className={`text-xs font-bold ${wallet.units >= totalCost ? "text-green-600" : "text-red-600"}`}>
                                  {wallet.units.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mobile View - Show Package & Unit Price */}
                        <div className="sm:hidden space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Package</span>
                            <span className="text-xs font-bold text-[#00333e]">{selectedPackage.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Unit Price</span>
                            <span className="text-xs font-medium text-[#00333e]">{unitPrice}</span>
                          </div>
                          <div className="border-t border-[#00333e]/20 pt-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-[#00333e]">Total Cost</span>
                            <span className="text-base font-bold text-[#00333e]">{totalCost.toLocaleString()}</span>
                          </div>
                          {wallet && (
                            <div className="flex justify-between items-center pt-1.5 border-t border-[#00333e]/20">
                              <span className="text-xs text-gray-600">Balance</span>
                              <span className={`text-xs font-bold ${wallet.units >= totalCost ? "text-green-600" : "text-red-600"}`}>
                                {wallet.units.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setIsServiceModalOpen(false);
                          setSelectedPackage(null);
                          setSelectedUnits(0);
                          setUnitError("");
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-[#00333e] rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (wallet && wallet.units < totalCost) {
                            // Insufficient balance - switch to top-up modal
                            setIsServiceModalOpen(false);
                            setIsTopUpModalOpen(true);
                            setTopUpAmount(totalCost - wallet.units);
                          } else {
                            handlePurchase(selectedPackage);
                            setIsServiceModalOpen(false);
                          }
                        }}
                        disabled={
                          purchasingPackageId === selectedPackage.id ||
                          !wallet ||
                          selectedUnits <= 0 ||
                          !!unitError
                        }
                        className="flex-1 px-3 py-2 bg-[#00333e] text-white rounded-lg text-sm font-medium hover:bg-[#004d5e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {purchasingPackageId === selectedPackage.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="hidden sm:inline">Processing...</span>
                          </>
                        ) : wallet && wallet.units < totalCost ? (
                          "Top Up Wallet"
                        ) : (
                          "Purchase"
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
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
            className="bg-white rounded-xl max-w-sm w-full border border-gray-200"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-base font-medium text-[#00333e]">Top Up Wallet</h2>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTopUp} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#00333e] mb-2 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter mobile money number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00333e] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#00333e] mb-2 uppercase tracking-wider">
                  Amount (Tsh)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseFloat(e.target.value))}
                  placeholder="Enter amount"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00333e] focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#00333e] rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-[#00333e] text-white rounded-lg font-medium hover:bg-[#004d5e] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
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