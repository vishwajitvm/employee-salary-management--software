import { useState, useEffect } from 'react';
import axios from 'axios';

export function useExchangeRate() {
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    // Fetch live exchange rate from INR to USD using a free open API
    axios.get('https://open.er-api.com/v6/latest/INR')
      .then(res => {
        setUsdRate(res.data.rates.USD);
      })
      .catch(err => {
        console.error("Failed to fetch exchange rate, using fallback", err);
        setUsdRate(0.012); // Fallback rate (approx 1 INR = 0.012 USD)
      });
  }, []);

  return usdRate;
}
