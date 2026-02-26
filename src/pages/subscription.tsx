import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Phone, Wallet, Plus, X, Loader2, CreditCard, QrCode, Smartphone, ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import Alert from "../components/Alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  getAccountBalance,
  initiateUnitsPayment,
  initiateCardPayment,
  initiateQRPayment,
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

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card" | "qr">("mobile");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState("TZ");
  const [qrData, setQrData] = useState<{ emv: string; paymentUrl: string; expiresAt: string } | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingRef, setPollingRef] = useState<string | null>(null);
  const topUpScrollRef = useRef<HTMLDivElement>(null);

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

  // -------------------- CARD PAYMENT RETURN HANDLER --------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success" || paymentStatus === "cancel") {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      const storedRef = localStorage.getItem("briq_pending_payment_ref");
      if (storedRef && paymentStatus === "success") {
        showAlert("success", "Verifying card payment...");
        setIsProcessing(true);
        pollForCompletion(storedRef);
      } else if (paymentStatus === "cancel") {
        showAlert("error", "Card payment was cancelled.");
      }
      localStorage.removeItem("briq_pending_payment_ref");
      localStorage.removeItem("briq_pending_txn_id");
    }
  }, []);

  // Scroll payment sheet to top when QR is generated so the code is visible
  useEffect(() => {
    if (qrData && paymentMethod === "qr" && topUpScrollRef.current) {
      topUpScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [qrData, paymentMethod]);

  // Escape key closes Top Up sheet when not processing
  useEffect(() => {
    if (!isTopUpModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) {
        setIsTopUpModalOpen(false);
        setQrData(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isTopUpModalOpen, isProcessing]);

  // Escape key closes Purchase modal
  useEffect(() => {
    if (!isServiceModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsServiceModalOpen(false);
        setSelectedPackage(null);
        setSelectedUnits(0);
        setUnitError("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isServiceModalOpen]);

  // -------------------- FETCH: INITIAL LOAD (wallet, plans, usage, transactions in parallel) --------------------
  const refreshTransactions = React.useCallback(async () => {
    setIsTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const [topUps, balanceUsage] = await Promise.all([getTransactions(), getBalanceUsageLogs()]);
      const normalizedTopUps = (Array.isArray(topUps) ? topUps : []).map((tx: any) => ({
        type: "topup",
        units: tx.units_purchased ?? 0,
        amountTzs: typeof tx.total_amount_paid === "number" ? tx.total_amount_paid : 0,
        date: tx.transaction_date,
        status: tx.marked_complete ? "Completed" : "Pending",
        source: "Wallet Top-Up"
      }));
      const normalizedPurchases = (Array.isArray(balanceUsage) ? balanceUsage : []).map((p: any) => ({
        type: "package",
        units: p.units_used ?? 0,
        amountTzs: null as number | null,
        date: p.usage_date,
        status: "Completed",
        source: p.usage_description ?? "Usage"
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading({ wallet: true, usage: true, transactions: true, packages: true });
    setIsTransactionsLoading(true);

    const fetchTransactionsPair = () =>
      Promise.all([getTransactions(), getBalanceUsageLogs()]).then(([a, b]) => ({ topUps: a, balanceUsage: b })).catch((e) => ({ error: e }));

    const run = async () => {
      try {
        const [balanceRes, plansRes, allocationsRes, txnPair] = await Promise.all([
          getAccountBalance().catch((e) => ({ error: e })),
          getPlans().catch((e) => ({ error: e })),
          getAllocationsSummary().catch((e) => ({ error: e })),
          fetchTransactionsPair(),
        ]);

        if (cancelled) return;

        if (!balanceRes || "error" in balanceRes) {
          setErrors((prev) => ({ ...prev, wallet: "Failed to load wallet balance" }));
        } else {
          setWallet({ units: balanceRes.balance });
        }

        if (!plansRes || "error" in plansRes) {
          setErrors((prev) => ({ ...prev, packages: "Failed to load available packages" }));
        } else {
          const transformedPackages = plansRes
            .filter((plan: any) => plan && plan.package_id && plan.services && plan.services.length > 0)
            .map((plan: any) => {
              const totalUnits = plan.services.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
              const voiceService = plan.services.find((s: any) => s.service_id === "cc08b078-59d5-4d03-963e-e6f7a45ec867");
              const smsUnits = voiceService ? voiceService.quantity || 0 : totalUnits;
              return {
                id: plan.package_id,
                name: plan.name || "Unnamed Package",
                description: plan.description || "",
                totalPrice: plan.total_price || 0,
                services: plan.services.map((service: any) => ({
                  service_id: service.service_id,
                  quantity: service.quantity || 0,
                  unit_cost_at_purchase: service.unit_cost_at_purchase || 0,
                })),
                allocation: { sms: smsUnits, whatsapp: 0, voice: smsUnits },
              };
            });
          setPackages(transformedPackages);
        }

        if (!allocationsRes || "error" in allocationsRes) {
          setErrors((prev) => ({ ...prev, usage: "Failed to load usage data" }));
        } else {
          const allocation = { sms: 0, whatsapp: 0, avr: 0 };
          allocationsRes.allocations?.forEach((alloc: any) => {
            if (alloc.service_name === "SMS") allocation.sms = alloc.total_quantity;
            else if (alloc.service_name === "WHATSAPP") allocation.whatsapp = alloc.total_quantity;
            else if (alloc.service_name === "VOICE") allocation.avr = alloc.total_quantity;
          });
          setCurrentPackage((prev) => ({ ...prev, allocation, usage: { sms: 0, whatsapp: 0, avr: 0 } }));
        }

        if (txnPair && "error" in txnPair) {
          setTransactionsError("Failed to load transaction history");
        } else {
          const topUps = Array.isArray((txnPair as any).topUps) ? (txnPair as any).topUps : [];
          const balanceUsage = Array.isArray((txnPair as any).balanceUsage) ? (txnPair as any).balanceUsage : [];
          const normalizedTopUps = topUps.map((tx: any) => ({
            type: "topup",
            units: tx.units_purchased ?? 0,
            amountTzs: typeof tx.total_amount_paid === "number" ? tx.total_amount_paid : 0,
            date: tx.transaction_date,
            status: tx.marked_complete ? "Completed" : "Pending",
            source: "Wallet Top-Up"
          }));
          const normalizedPurchases = balanceUsage.map((p: any) => ({
            type: "package",
            units: p.units_used ?? 0,
            amountTzs: null as number | null,
            date: p.usage_date,
            status: "Completed",
            source: p.usage_description ?? "Usage"
          }));
          const merged = [...normalizedTopUps, ...normalizedPurchases];
          merged.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setFullHistory(merged);
        }
      } finally {
        if (!cancelled) {
          setLoading({ wallet: false, usage: false, transactions: false, packages: false });
          setIsTransactionsLoading(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  // -------------------- TOP-UP HANDLER --------------------
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      setQrData(null);

      let paymentResponse;

      if (paymentMethod === "mobile") {
        // Mobile Money — USSD push
        paymentResponse = await initiateUnitsPayment({
          amount_paid: topUpAmount,
          target_phone: phoneNumber,
        });
      } else if (paymentMethod === "card") {
        // Card — redirect flow
        const currentUrl = window.location.href.split('?')[0];
        paymentResponse = await initiateCardPayment({
          amount_paid: topUpAmount,
          target_phone: phoneNumber,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          address: billingAddress || undefined,
          city: billingCity || undefined,
          country: billingCountry || "TZ",
          redirect_url: `${currentUrl}?payment=success`,
          cancel_url: `${currentUrl}?payment=cancel`,
        });
      } else {
        // QR — scan-to-pay
        paymentResponse = await initiateQRPayment({
          amount_paid: topUpAmount,
          target_phone: phoneNumber,
        });
      }

      if (!paymentResponse.success) {
        showAlert("error", paymentResponse.message || "Payment initiation failed");
        setIsProcessing(false);
        return;
      }

      const paymentRef = paymentResponse.payment_reference || "";

      // === CARD: redirect to payment_url ===
      if (paymentMethod === "card" && paymentResponse.payment_url) {
        showAlert("success", "Redirecting to payment page...");
        // Store ref for when user returns
        localStorage.setItem("briq_pending_payment_ref", paymentRef);
        localStorage.setItem("briq_pending_txn_id", paymentResponse.transaction_id || "");
        window.location.href = paymentResponse.payment_url;
        return;
      }

      // === QR: show QR code + poll ===
      if (paymentMethod === "qr") {
        const pr = paymentResponse.provider_response;
        const data = pr?.data ?? pr?.Data ?? pr ?? {};
        const dataObj = typeof data === "object" && data !== null ? data : {};
        const emv =
          dataObj?.payment_qr_code ??
          dataObj?.paymentQrCode ??
          pr?.payment_qr_code ??
          paymentResponse.qr_code ??
          "";
        const qrPaymentUrl =
          paymentResponse.payment_url ??
          dataObj?.payment_url ??
          pr?.payment_url ??
          "";
        const expiresAt =
          dataObj?.expires_at ?? pr?.expires_at ?? "";

        if (emv || qrPaymentUrl) {
          setQrData({ emv: String(emv).trim(), paymentUrl: String(qrPaymentUrl), expiresAt: String(expiresAt) });
          setPollingRef(paymentRef);
          showAlert("success", "QR code generated! Scan to pay, then we'll verify automatically.");
          // Start polling in background
          pollForCompletion(paymentRef);
          return;
        } else {
          showAlert("error", "No QR code returned from provider");
          setIsProcessing(false);
          return;
        }
      }

      // === MOBILE MONEY: show message + poll ===
      showAlert("success", `Payment initiated! Reference: ${paymentRef}. Check your phone...`);
      pollForCompletion(paymentRef);

    } catch (error) {
      console.error("Payment initiation failed:", error);
      showAlert("error", "Failed to initiate payment.");
      setIsProcessing(false);
    }
  };

  // -------------------- POLL FOR COMPLETION --------------------
  const pollForCompletion = async (paymentRef: string) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 12;
    const interval = 6000;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await completeTransaction({
          payment_reference: paymentRef,
          transaction_id: "",
        });
        // Only treat as success when backend explicitly says so (ignore credits_added when success is false)
        if (result && result.success === true) {
          const newBalance = result.updated_balance ?? 0;
          const added = result.credits_added ?? 0;
          setWallet({ units: newBalance });
          refreshTransactions();
          setIsTopUpModalOpen(false);
          setQrData(null);
          setPhoneNumber("");
          setTopUpAmount(0);
          setIsPolling(false);
          setIsProcessing(false);
          setPollingRef(null);
          showAlert("success", `Payment completed! ${added} units added. New balance: ${newBalance} units`);
          return;
        }
      } catch {
        // Not yet complete
      }
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, interval));
      }
    }

    // Timeout
    setIsPolling(false);
    setIsProcessing(false);
    showAlert("success", `Payment initiated with reference: ${paymentRef}. Credits will be added shortly. Please refresh to check your balance.`);
    setIsTopUpModalOpen(false);
    setQrData(null);
    setPhoneNumber("");
    setTopUpAmount(0);
    setPollingRef(null);
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

      const unitsPurchased = selectedUnits;
      setSelectedUnits(0);
      setUnitError("");
      setIsPackageDetailsModalOpen(false);
      showAlert("success", `Successfully purchased ${unitsPurchased.toLocaleString()} units for ${totalCost.toLocaleString()} units!`);
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
        max: 20000,
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

    // No overlaps: max of current package = min of next package - 1
    return {
      min: currentUnits || 1,
      max: nextUnits > currentUnits ? nextUnits - 1 : (currentUnits + 100000),
    };
  };

  // -------------------- UNIT QUANTITY VALIDATION --------------------
  const validateUnitQuantity = (quantity: number, pkg: Package): string => {
    if (!quantity || quantity <= 0) {
      return "Please enter a valid unit quantity";
    }

    const { min, max } = getPackageUnitRange(pkg);

    if (quantity < min && min > 0) {
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
            <div className="text-center py-12 px-4">
              <div className="inline-flex p-4 rounded-full bg-gray-100 text-gray-400 mb-3">
                <Wallet className="w-8 h-8" />
              </div>
              <p className="text-gray-600 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Top up your wallet or purchase units to see history here.</p>
            </div>
          ) : (
            <div>
              {/* Desktop Table - shadcn-style */}
              <div className="hidden sm:block rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-200">
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount (TZS)</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.map((item: any, index: number) => (
                      <TableRow key={`${item.date}-${item.type}-${index}`}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {new Date(item.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.type === "topup" ? "Top-Up" : "Usage"}
                        </TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell className="text-right whitespace-nowrap tabular-nums">
                          {item.amountTzs != null && item.amountTzs > 0
                            ? `${Number(item.amountTzs).toLocaleString()} Tsh`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap tabular-nums font-medium">
                          {Number(item.units).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {paginatedHistory.map((item: any, index: number) => (
                  <div key={`${item.date}-${item.type}-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-bold text-[#00333e] uppercase tracking-wider">
                          {item.type === "topup" ? "Top-Up" : "Usage"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(item.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.status === "Completed" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Description</span>
                        <span className="text-[#00333e] font-medium text-right">{item.source}</span>
                      </div>
                      {item.amountTzs != null && item.amountTzs > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Amount (TZS)</span>
                          <span className="text-[#00333e] font-semibold tabular-nums">{Number(item.amountTzs).toLocaleString()} Tsh</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Units</span>
                        <span className="text-[#00333e] font-bold tabular-nums">{Number(item.units).toLocaleString()}</span>
                      </div>
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
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsServiceModalOpen(false);
              setSelectedPackage(null);
              setSelectedUnits(0);
              setUnitError("");
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-labelledby="purchase-modal-title"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg sm:rounded-xl w-full max-w-md sm:max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-3 sm:p-6 border-b rounded-t-lg sm:rounded-t-xl z-10">
              <h2 className="text-xs sm:text-base font-bold text-[#00333e]" id="purchase-modal-title">
                Purchase {selectedService === "sms" ? "SMS" : selectedService === "whatsapp" ? "WhatsApp" : "Voice"}
              </h2>
              <button
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setSelectedPackage(null);
                  setSelectedUnits(0);
                  setUnitError("");
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
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
                              const needed = totalCost - wallet.units;
                              setIsServiceModalOpen(false);
                              setIsTopUpModalOpen(true);
                              setTopUpAmount(needed);
                              showAlert("success", `Top up with the amount below, then purchase again to complete.`);
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

      {/* Top-Up Sheet */}
      {isTopUpModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => { if (!isProcessing) { setIsTopUpModalOpen(false); setQrData(null); } }}
          />
          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-labelledby="topup-sheet-title"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
              <h2 id="topup-sheet-title" className="text-lg font-semibold text-[#00333e]">Top Up Wallet</h2>
              <button
                onClick={() => { setIsTopUpModalOpen(false); setQrData(null); setIsProcessing(false); }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex border-b border-gray-200 shrink-0">
              {([
                { id: "mobile" as const, label: "Mobile Money", icon: <Smartphone className="w-4 h-4" /> },
                { id: "card" as const, label: "Card", icon: <CreditCard className="w-4 h-4" /> },
                { id: "qr" as const, label: "QR Code", icon: <QrCode className="w-4 h-4" /> },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setPaymentMethod(tab.id); setQrData(null); }}
                  disabled={isProcessing}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors ${paymentMethod === tab.id
                    ? "text-[#00333e] border-b-2 border-[#00333e]"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div ref={topUpScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              {/* QR Code Display - shown first when QR is generated */}
              {qrData && paymentMethod === "qr" && (
                <div className="p-5 bg-gray-50 border-b border-gray-200 shrink-0">
                  <div className="text-center space-y-4">
                    <p className="text-sm font-medium text-[#00333e]">Scan to pay</p>
                    {qrData.emv ? (
                      <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm min-h-[260px] w-full">
                        <p className="text-xs text-gray-500 mb-3 font-medium">Scan with your banking app</p>
                        <div className="flex items-center justify-center w-[220px] h-[220px] mx-auto bg-white rounded-lg overflow-visible">
                          {qrData.emv.startsWith("data:image/") || qrData.emv.startsWith("http") || (qrData.emv.length > 500 && !qrData.emv.startsWith("00")) ? (
                            <img
                              src={qrData.emv.startsWith("data:image/") || qrData.emv.startsWith("http") ? qrData.emv : `data:image/png;base64,${qrData.emv}`}
                              alt="Payment QR Code"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <QRCode
                              value={qrData.emv}
                              size={220}
                              level="M"
                              style={{ width: 220, height: 220 }}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Use the link below to pay</p>
                    )}
                    {qrData.paymentUrl && (
                      <a
                        href={qrData.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00333e] text-white rounded-lg text-sm font-medium hover:bg-[#004d5e] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Payment Page
                      </a>
                    )}
                    {qrData.expiresAt && (
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}
                      </p>
                    )}
                    {isPolling && (
                      <div className="flex items-center justify-center gap-2 text-xs text-[#00333e]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Waiting for payment confirmation...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleTopUp} className="p-5 space-y-4">
                {paymentMethod === "card" && (
                  <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    You will be redirected to a secure page to enter your <strong>card number</strong>, expiry, and CVV. Your phone number below is for contact and receipts only.
                  </p>
                )}
                {/* Phone Number - for Mobile/QR it's the pay-from number; for Card it's contact only */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {paymentMethod === "card" ? "Contact phone (for receipt)" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 255712345678"
                    required
                    disabled={isProcessing}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors"
                  />
                  {paymentMethod === "card" && (
                    <p className="text-[11px] text-gray-400 mt-1">Card details are entered on the next page.</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (TZS)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={topUpAmount || ""}
                    onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 10000"
                    required
                    disabled={isProcessing}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors"
                  />
                </div>

                {/* Card-specific fields */}
                {paymentMethod === "card" && (
                  <>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-[#00333e] mb-3 uppercase tracking-wider">Cardholder Info</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="Jane Doe"
                          required
                          disabled={isProcessing}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          placeholder="customer@example.com"
                          required
                          disabled={isProcessing}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-[#00333e] mb-3 uppercase tracking-wider">Billing Address</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Street Address</label>
                        <input
                          type="text"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="123 Uhuru St"
                          disabled={isProcessing}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                          <input
                            type="text"
                            value={billingCity}
                            onChange={(e) => setBillingCity(e.target.value)}
                            placeholder="Dar es Salaam"
                            disabled={isProcessing}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Country</label>
                          <select
                            value={billingCountry}
                            onChange={(e) => setBillingCountry(e.target.value)}
                            disabled={isProcessing}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00333e]/20 focus:border-[#00333e] text-sm transition-colors bg-white"
                          >
                            <option value="TZ">Tanzania</option>
                            <option value="KE">Kenya</option>
                            <option value="UG">Uganda</option>
                            <option value="RW">Rwanda</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => { setIsTopUpModalOpen(false); setQrData(null); setIsProcessing(false); }}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-[#00333e] rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || (qrData !== null && paymentMethod === "qr")}
                    className="flex-1 px-4 py-2.5 bg-[#00333e] text-white rounded-lg font-medium hover:bg-[#004d5e] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {paymentMethod === "card" ? "Redirecting..." : paymentMethod === "qr" ? "Generating..." : "Processing..."}
                      </>
                    ) : (
                      paymentMethod === "card" ? "Pay with Card" : paymentMethod === "qr" ? "Generate QR Code" : "Top Up"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Subscription;