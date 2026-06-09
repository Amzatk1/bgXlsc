import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ReserveItem = {
  key: string;
  productId: string;
  name: string;
  brand: string;
  condition: string;
  image: string | null;
  size: string | null;
  qty: number;
};

export type ReserveInput = {
  productId: string;
  name: string;
  brand: string;
  condition: string;
  image?: string | null;
  size?: string | null;
};

type ReserveContextValue = {
  items: ReserveItem[];
  count: number;
  isOpen: boolean;
  add: (input: ReserveInput) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const ReserveContext = createContext<ReserveContextValue | null>(null);

const STORAGE_KEY = "lsc.reserve.v1";

function keyFor(input: ReserveInput) {
  return `${input.productId}::${input.size ?? "any"}`;
}

function load(): ReserveItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReserveItem[]) : [];
  } catch {
    return [];
  }
}

export function ReserveProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ReserveItem[]>(load);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [items]);

  const add = useCallback((input: ReserveInput) => {
    const key = keyFor(input);
    setItems((current) => {
      const existing = current.find((it) => it.key === key);
      if (existing) {
        return current.map((it) => (it.key === key ? { ...it, qty: it.qty + 1 } : it));
      }
      return [
        ...current,
        {
          key,
          productId: input.productId,
          name: input.name,
          brand: input.brand,
          condition: input.condition,
          image: input.image ?? null,
          size: input.size ?? null,
          qty: 1,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((it) => it.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((current) =>
      current
        .map((it) => (it.key === key ? { ...it, qty: Math.max(0, qty) } : it))
        .filter((it) => it.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);

  const value = useMemo<ReserveContextValue>(
    () => ({ items, count, isOpen, add, remove, setQty, clear, open, close }),
    [items, count, isOpen, add, remove, setQty, clear, open, close],
  );

  return <ReserveContext.Provider value={value}>{children}</ReserveContext.Provider>;
}

export function useReserve() {
  const ctx = useContext(ReserveContext);
  if (!ctx) throw new Error("useReserve must be used within ReserveProvider");
  return ctx;
}
