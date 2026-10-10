"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

type Currency = "INR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  usdRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [usdRate, setUsdRate] = useState<number>(0.012);

  useEffect(() => {
    const saved = localStorage.getItem("app-currency") as Currency;
    if (saved) setCurrency(saved);

    // Fetch live rate
    axios.get("https://open.er-api.com/v6/latest/INR")
      .then(res => setUsdRate(res.data.rates.USD))
      .catch(() => console.warn("Using fallback exchange rate"));
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem("app-currency", c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, usdRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};
