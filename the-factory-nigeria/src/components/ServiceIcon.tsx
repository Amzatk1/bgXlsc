import { Building2, Gift, HardHat, Layers, Printer, Scissors, Shirt } from "lucide-react";
import type { IconKey } from "../data/services";

const MAP = {
  shirt: Shirt,
  printer: Printer,
  building: Building2,
  scissors: Scissors,
  gift: Gift,
  hardhat: HardHat,
  layers: Layers,
} as const;

export function ServiceIcon({ name, size = 22 }: { name: IconKey; size?: number }) {
  const Cmp = MAP[name];
  return <Cmp size={size} strokeWidth={1.6} aria-hidden="true" />;
}
