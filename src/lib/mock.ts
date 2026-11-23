// SAMPLE DATA ONLY. Replaced by database values later.
export const LIMITS = {
    rateMinPct: 1,
    rateMaxPct: 10,
    expiryMinDays: 30,
    expiryMaxDays: 180,
  };
  
  export const MOCK_MERCHANT = { name: "Demo Store", ratePct: 3, expiryDays: 60 };
  
  export const MOCK_STATS = [
    { label: "Sales today", value: "$184.50" },
    { label: "Receipts today", value: "23" },
    { label: "Repeat customers", value: "38%" },
    { label: "Sign-up rate", value: "41%" },
    { label: "BackPay issued", value: "$42.10" },
    { label: "BackPay redeemed", value: "$12.40" },
  ];
  
  export const MOCK_RECEIPTS = [
    { no: "R-000123", phone: "+26377 *** 567", totalCents: 2500, backpayCents: 75, registered: true, time: "10:42" },
    { no: "R-000122", phone: "+26371 *** 904", totalCents: 1200, backpayCents: 36, registered: false, time: "10:15" },
    { no: "R-000121", phone: "+26378 *** 221", totalCents: 4800, backpayCents: 144, registered: true, time: "09:58" },
    { no: "R-000120", phone: "+26373 *** 618", totalCents: 650, backpayCents: 19, registered: false, time: "09:30" },
  ];