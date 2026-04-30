export type BinLocation = {
  latitude: number;
  longitude: number;
};

export type GarbageBin = {
  binId: string;
  fillLevel: number;
  gasLevel: number;
  weight: number;
  location: BinLocation;
};

export type GarbageBinRecord = Record<string, Partial<GarbageBin>>;
