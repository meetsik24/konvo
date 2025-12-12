import React, { useState, useEffect } from "react";
import { X, Loader2, Wallet, ChevronRight } from "lucide-react";
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

  const openPackageModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSelectedUnits(0);
    setUnitError("");
    setIsPackageDetailsModalOpen(true);
  };

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
              return (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-600 capitalize font-medium">{key}</span>
                  <span className="text-[#00333e] font-semibold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                className="bg-white p-6 rounded-md border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h4 className="text-lg font-semibold text-[#00333e] mb-1">
                    {pkg.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {pkg.description?.length > 100 
                      ? `${pkg.description.substring(0, 100)}...` 
                      : pkg.description}
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                    <p className="text-xs text-gray-600 mb-1">Package Price</p>
                    <p className="text-xl font-bold text-[#00333e]">
                      {(pkg.totalPrice || 0).toLocaleString()} Units
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600 mb-1">Units Allocated</p>
                    <p className="text-sm font-medium text-[#00333e]">
                      {(pkg.allocation?.sms || 0).toLocaleString()} Units
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => openPackageModal(pkg)}
                    className="w-full px-4 py-2 bg-gray-100 text-[#00333e] rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Package Details Modal */}
      {isPackageDetailsModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-md max-w-2xl w-full shadow-lg"
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
            <div className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-[#00333e] mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{selectedPackage.description}</p>
              </div>

              {/* Package Price */}
              <div>
                <h3 className="text-sm font-medium text-[#00333e] mb-2">Package Price</h3>
                <p className="text-2xl font-bold text-[#00333e]">
                  {(selectedPackage.totalPrice || 0).toLocaleString()} Units
                </p>
              </div>

              {/* Services/Units Breakdown */}
              {selectedPackage.services && selectedPackage.services.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#00333e] mb-2">What's Included</h3>
                  <div className="space-y-2">
                    {selectedPackage.services.map((service, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Units Allocated:</span>
                          <span className="font-semibold text-[#00333e]">
                            {service.units_allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Unit Cost:</span>
                          <span className="text-sm text-[#00333e]">
                            {service.unit_cost_at_purchase} units each
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit Quantity Input */}
              {selectedPackage.services && selectedPackage.services.length > 0 && (() => {
                const { min, max } = getPackageUnitRange(selectedPackage);
                return (
                  <div>
                    <label className="block text-sm font-medium text-[#00333e] mb-2">
                      How many units do you want?
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = Math.max(min, selectedUnits - 100);
                          setSelectedUnits(newValue);
                          if (newValue > 0) {
                            setUnitError(validateUnitQuantity(newValue, selectedPackage));
                          } else {
                            setUnitError("");
                          }
                        }}
                        className="px-3 py-2 bg-gray-200 text-[#00333e] rounded-md hover:bg-gray-300 font-bold"
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
                          } else {
                            setUnitError("");
                          }
                        }}
                        placeholder="Enter unit quantity"
                        min={min}
                        max={max}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00333e] text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = Math.min(max, selectedUnits + 100);
                          setSelectedUnits(newValue);
                          if (newValue > 0) {
                            setUnitError(validateUnitQuantity(newValue, selectedPackage));
                          } else {
                            setUnitError("");
                          }
                        }}
                        className="px-3 py-2 bg-gray-200 text-[#00333e] rounded-md hover:bg-gray-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                    {unitError && (
                      <p className="text-red-500 text-xs mt-2">{unitError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Range: {min.toLocaleString()} - {max.toLocaleString()} units
                    </p>
                  </div>
                );
              })()}

              {/* Cost Breakdown */}
              {selectedUnits > 0 && !unitError && selectedPackage.services.length > 0 && (() => {
                return (
                  <div className="bg-blue-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Units to Purchase:</span>
                      <span className="font-medium text-[#00333e]">{selectedUnits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium text-[#00333e]">{selectedPackage.services[0]?.unit_cost_at_purchase || 0} units each</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-semibold text-[#00333e]">Total Cost:</span>
                      <span className="text-lg font-bold text-[#fddf0d]">
                        {(selectedUnits * (selectedPackage.services[0]?.unit_cost_at_purchase || 0)).toLocaleString()} Units
                      </span>
                    </div>
                    {wallet && (
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-gray-600">Wallet Balance:</span>
                        <span className={wallet.units >= selectedUnits * (selectedPackage.services[0]?.unit_cost_at_purchase || 0) ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {wallet.units.toLocaleString()} Units
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Wallet Balance */}
              {wallet && !selectedUnits && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#00333e]">Wallet Balance:</span>
                    <span className="text-lg font-bold text-[#00333e]">
                      {wallet.units.toLocaleString()} Units
                    </span>
                  </div>
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
                  selectedUnits <= 0 ||
                  !!unitError ||
                  !selectedPackage.services[0] ||
                  wallet.units < selectedUnits * (selectedPackage.services[0]?.unit_cost_at_purchase || 0)
                }
              >
                {purchasingPackageId === selectedPackage.id ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </span>
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

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium text-[#00333e]">Transaction History</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTransactionFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
              <div className="space-y-4">
                {paginatedHistory.map((historyItem, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-md border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-[#00333e]">
                          {historyItem.units.toLocaleString()} Units
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(historyItem.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        {historyItem.amount > 0 && (
                          <p className="font-medium text-[#00333e]">
                            {historyItem.amount.toLocaleString()} Tsh
                          </p>
                        )}
                        <p
                          className={`text-sm ${
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
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-100 text-[#00333e] rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-100 text-[#00333e] rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  );
};

export default Subscription;