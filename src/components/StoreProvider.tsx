"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createStore, type Store } from "@/lib/engine";

const KEY = "returni-demo-store-v1";

type Ctx = {
  store: Store;
  storeRef: React.MutableRefObject<Store>;
  commit: (next: Store) => void;
  reset: () => void;
  loaded: boolean;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(createStore);
  const storeRef = useRef<Store>(store);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (
          p &&
          Array.isArray(p.customers) &&
          Array.isArray(p.transactions) &&
          Array.isArray(p.redemptions) &&
          Array.isArray(p.ledger)
        ) {
          storeRef.current = p as Store;
          setStore(p as Store);
        }
      }
    } catch {
      // storage unavailable: carry on with sample data
    }
    setLoaded(true);
  }, []);

  const commit = useCallback((next: Store) => {
    storeRef.current = next;
    setStore(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    const fresh = createStore();
    storeRef.current = fresh;
    setStore(fresh);
  }, []);

  return (
    <StoreCtx.Provider value={{ store, storeRef, commit, reset, loaded }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): Ctx {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
return ctx;
}