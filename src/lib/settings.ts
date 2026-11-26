import { useCallback, useEffect, useState } from "react";
import { MOCK_MERCHANT } from "./mock";

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
};

export const ROLES = ["Owner", "Manager", "Cashier"] as const;
export type Role = (typeof ROLES)[number];

export type StaffMember = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  active: boolean;
};

// Recorded now, enforced once staff login exists
export const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: "Record sales", roles: ["Owner", "Manager", "Cashier"] },
  { label: "Redeem BackPay", roles: ["Owner", "Manager", "Cashier"] },
  { label: "Reverse transactions", roles: ["Owner", "Manager"] },
  { label: "View analytics", roles: ["Owner", "Manager"] },
  { label: "Manage customers", roles: ["Owner", "Manager"] },
  { label: "Manage prices and promotions", roles: ["Owner", "Manager"] },
  { label: "Edit BackPay rules", roles: ["Owner"] },
  { label: "Manage settings and staff", roles: ["Owner"] },
];

export const CATEGORIES = [
  "Grocery / Supermarket",
  "Clothing and fashion",
  "Restaurant / café",
  "Fast food",
  "Electronics",
  "Salon and beauty",
  "Service business",
  "General retail",
  "Other",
];

export type Settings = {
  profile: {
    name: string;
    category: string;
    description: string;
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
    logoDataUrl: string | null;
  };
  branches: Branch[];
  staff: StaffMember[];
  receipt: {
    footer: string;
    contactLine: string;
    showBranch: boolean;
    showBackPayBalance: boolean;
    showRegistrationLink: boolean;
  };
  notifications: {
    whatsappReceipts: boolean;
    rewardAlerts: boolean;
    expiryReminders: boolean;
    promotionalMessages: boolean;
    newCustomerAlert: boolean;
    largeRedemptionAlert: boolean;
  };
  security: {
    sessionTimeoutMin: number;
    requireApprovalForReversal: boolean;
    maskPhonesForCashiers: boolean;
  };
};

export const DEFAULT_SETTINGS: Settings = {
  profile: {
    name: MOCK_MERCHANT.name,
    category: CATEGORIES[0],
    description: "",
    whatsapp: "",
    phone: "",
    email: "",
    address: "",
    logoDataUrl: null,
  },
  branches: [
    { id: "br-1", name: MOCK_MERCHANT.branch, address: "", phone: "", active: true },
  ],
  staff: [
    { id: "st-owner", name: "Demo Owner", phone: "", role: "Owner", active: true },
  ],
  receipt: {
    footer: "Thank you for shopping with us. Every purchase deserves more.",
    contactLine: "",
    showBranch: true,
    showBackPayBalance: true,
    showRegistrationLink: true,
  },
  notifications: {
    whatsappReceipts: true,
    rewardAlerts: true,
    expiryReminders: true,
    promotionalMessages: false,
    newCustomerAlert: false,
    largeRedemptionAlert: true,
  },
  security: {
    sessionTimeoutMin: 30,
    requireApprovalForReversal: true,
    maskPhonesForCashiers: false,
  },
};

const KEY = "returni-settings-v1";

function merge(p: Partial<Settings>): Settings {
  const d = DEFAULT_SETTINGS;
  return {
    profile: { ...d.profile, ...p.profile },
    branches: Array.isArray(p.branches) && p.branches.length ? p.branches : d.branches,
    staff: Array.isArray(p.staff) && p.staff.length ? p.staff : d.staff,
    receipt: { ...d.receipt, ...p.receipt },
    notifications: { ...d.notifications, ...p.notifications },
    security: { ...d.security, ...p.security },
  };
}

export function useSettings() {
  const [saved, setSaved] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(merge(JSON.parse(raw)));
    } catch {
      // storage unavailable: use defaults
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next: Settings): boolean => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setSaved(next);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { saved, save, loaded };
}