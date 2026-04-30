"use client";

import { useEffect, useState } from "react";

import { subscribeToBinsRealtime } from "@/lib/firebase/database";
import type { GarbageBin } from "@/lib/firebase/types";

type UseBinsState = {
  bins: GarbageBin[];
  isLoading: boolean;
  errorMessage: string | null;
};

export function useBins(): UseBinsState {
  const [bins, setBins] = useState<GarbageBin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToBinsRealtime(
      (nextBins) => {
        setBins(nextBins);
        setIsLoading(false);
        setErrorMessage(null);
      },
      (error) => {
        setErrorMessage(error.message || "Unable to subscribe to realtime bins.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return {
    bins,
    isLoading,
    errorMessage,
  };
}
