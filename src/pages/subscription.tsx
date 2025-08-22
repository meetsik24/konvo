import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ShoppingBag, Package, Loader2 } from "lucide-react";
import { getAccountBalance, getUsageLogs, ServiceName } from "../services/api";

interface Package {
  id: string;
  name: string;
  description: string;
  units: number;
  allocation: {
    sms: number;
    whatsapp: number;
    avr: number;
  };
}

const dummyPackages: Package[] = [
  {
    id: "pkg1",
    name: "Starter Pack",
    description: "Great for testing out SMS & WhatsApp",
    units: 2000,
    allocation: { sms: 200, whatsapp: 800, avr: 0 },
  },
  {
    id: "pkg2",
    name: "Business Pack",
    description: "Balanced credits for mixed usage",
    units: 5000,
    allocation: { sms: 500, whatsapp: 1500, avr: 100 },
  },
  {
    id: "pkg3",
    name: "Enterprise Pack",
    description: "High volume with AVR support",
    units: 10000,
    allocation: { sms: 1000, whatsapp: 3000, avr: 300 },
  },
];

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
  const [wallet, setWallet] = useState<{
    balance_id: string;
    user_id: string;
    units: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPackage, setCurrentPackage] = useState<UsageData>({
    name: "Your Package",
    allocation: { sms: 0, whatsapp: 0, avr: 0 },
    usage: { sms: 0, whatsapp: 0, avr: 0 },
  });
  const [transactions, setTransactions] = useState<
    { type: string; units: number; desc: string }[]
  >([]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getAccountBalance();
        setWallet({
          balance_id: balance.balance_id,
          user_id: balance.user_id,
          units: balance.units,
        });
      } catch (err) {
        setError("Failed to load wallet balance");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const logs = await getUsageLogs();

        // Aggregate usage by service type
        const usage = logs.reduce(
          (acc, log) => {
            switch (log.service_name) {
              case ServiceName.SMS:
                acc.sms += log.units_used;
                break;
              case ServiceName.WHATSAPP:
                acc.whatsapp += log.units_used;
                break;
              case ServiceName.VOICE:
                acc.avr += log.units_used;
                break;
            }
            return acc;
          },
          { sms: 0, whatsapp: 0, avr: 0 }
        );

        setCurrentPackage((prev) => ({
          ...prev,
          usage: usage,
        }));
      } catch (err) {
        console.error("Failed to fetch usage logs:", err);
        setError("Failed to load usage data");
      }
    };

    fetchUsageData();
  }, []);

  const handlePurchase = (pkg: Package) => {
    if (!wallet || wallet.units < pkg.units) {
      alert("Not enough credits in wallet to purchase this package.");
      return;
    }
    setWallet((prev) =>
      prev
        ? {
            ...prev,
            units: prev.units - pkg.units,
          }
        : null
    );
    setTransactions((prev) => [
      ...prev,
      {
        type: "purchase",
        units: pkg.units,
        desc: `Bought ${pkg.name} (${pkg.allocation.sms} SMS, ${pkg.allocation.whatsapp} WhatsApp, ${pkg.allocation.avr} AVR)`,
      },
    ]);
  };

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
                {wallet?.units.toLocaleString()} Units
              </p>
            )}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f]"
          disabled={isLoading}
        >
          Top Up
        </button>
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

      {/* Packages */}
      <div>
        <h3 className="text-xl font-medium text-[#00333e] mb-4 flex items-center gap-2">
          Available Packages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
            >
              <h4 className="text-lg font-semibold text-[#00333e] mb-1">
                {pkg.name}
              </h4>
              <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
              <p className="text-sm mb-3 text-[#00333e] font-medium">
                {pkg.units.toLocaleString()} Units
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>{pkg.allocation.sms} SMS</li>
                <li>{pkg.allocation.whatsapp} WhatsApp</li>
                <li>{pkg.allocation.avr} AVR</li>
              </ul>
              <button
                onClick={() => handlePurchase(pkg)}
                className="px-4 py-2 bg-[#fddf0d] text-[#00333e] rounded-md text-sm font-medium hover:bg-yellow-400"
              >
                Purchase
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-xl font-medium text-[#00333e] mb-4 flex items-center gap-2">
          Recent Transactions
        </h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No purchases yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx, idx) => (
              <li
                key={idx}
                className="bg-white border rounded-md p-3 text-sm flex justify-between"
              >
                <span className="text-gray-700">{tx.desc}</span>
                <span className="font-medium text-[#00333e]">
                  -{tx.units} units
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Subscription;