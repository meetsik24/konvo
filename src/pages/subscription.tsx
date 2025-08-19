import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ShoppingBag, Package } from "lucide-react";

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

const dummyWallet = {
  user_id: "u123",
  total_units: 50000, // starting balance
};

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

const dummyCurrentPackage = {
  name: "Business Pack",
  allocation: { sms: 500, whatsapp: 1500, avr: 100 },
  usage: { sms: 120, whatsapp: 400, avr: 20 },
};

const Subscription: React.FC = () => {
  const [wallet, setWallet] = useState(dummyWallet);
  const [transactions, setTransactions] = useState<
    { type: string; units: number; desc: string }[]
  >([]);

  const handlePurchase = (pkg: Package) => {
    if (wallet.total_units < pkg.units) {
      alert("Not enough credits in wallet to purchase this package.");
      return;
    }
    setWallet((prev) => ({
      ...prev,
      total_units: prev.total_units - pkg.units,
    }));
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
            <p className="text-2xl font-bold text-[#00333e]">
              {wallet.total_units.toLocaleString()} Units
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-[#00333e] text-white rounded-md text-sm hover:bg-[#00262f]">
          Top Up
        </button>
      </motion.div>

            <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-md border border-gray-100 shadow-sm"
      >
        <h3 className="text-xl font-medium text-[#00333e] mb-4">
          Current Package – {dummyCurrentPackage.name}
        </h3>
        <div className="space-y-4">
          {Object.entries(dummyCurrentPackage.allocation).map(([key, total]) => {
            const used = dummyCurrentPackage.usage[key as keyof typeof dummyCurrentPackage.usage];
            const percent = calcUsagePercent(used, total);
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{key}</span>
                  <span className="text-[#00333e] font-medium">
                    {used}/{total}
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
