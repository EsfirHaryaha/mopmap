import { create } from "zustand";
import type { House, HouseMember } from "@/types/database";

interface HouseState {
  currentHouse: House | null;
  houses: House[];
  members: HouseMember[];
  setCurrentHouse: (house: House | null) => void;
  setHouses: (houses: House[]) => void;
  setMembers: (members: HouseMember[]) => void;
}

export const useHouseStore = create<HouseState>((set) => ({
  currentHouse: null,
  houses: [],
  members: [],
  setCurrentHouse: (house) => set({ currentHouse: house }),
  setHouses: (houses) => set({ houses }),
  setMembers: (members) => set({ members }),
}));
