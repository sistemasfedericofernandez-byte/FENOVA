import {
  WifiIcon,
  PoolIcon,
  CoffeeIcon,
  ParkingIcon,
  AcIcon,
  PawIcon,
  DumbbellIcon,
  UtensilsIcon,
} from "@/components/icons";
import type { HotelAmenity } from "@/types/database.types";

export const AMENITY_OPTIONS: {
  value: HotelAmenity;
  label: string;
  icon: typeof WifiIcon;
}[] = [
  { value: "wifi", label: "Wifi", icon: WifiIcon },
  { value: "pileta", label: "Pileta", icon: PoolIcon },
  { value: "desayuno", label: "Desayuno incluido", icon: CoffeeIcon },
  { value: "estacionamiento", label: "Estacionamiento", icon: ParkingIcon },
  { value: "aire_acondicionado", label: "Aire acondicionado", icon: AcIcon },
  { value: "pet_friendly", label: "Pet friendly", icon: PawIcon },
  { value: "gimnasio", label: "Gimnasio", icon: DumbbellIcon },
  { value: "restaurante", label: "Restaurante", icon: UtensilsIcon },
];

export const AMENITY_MAP = new Map(
  AMENITY_OPTIONS.map((opt) => [opt.value, opt]),
);
