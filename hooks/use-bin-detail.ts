"use client";

import { useEffect, useState } from "react";

import { fetchBinById, subscribeToBinRealtime } from "@/lib/firebase/database";
import type { GarbageBin } from "@/lib/firebase/types";

type UseBinDetailState = {
  bin: GarbageBin | null;
  isLoading: boolean;
  errorMessage: string | null;
  notFound: boolean;
};

export function useBinDetail(binId: string): UseBinDetailState {
  const [bin, setBin] = useState<GarbageBin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialBin() {
      try {
        const initialBin = await fetchBinById(binId);

        if (!isMounted) {
          return;
        }

        setBin(initialBin);
        setNotFound(!initialBin);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the selected bin.",
        );
        setIsLoading(false);
      }
    }

    void loadInitialBin();

    const unsubscribe = subscribeToBinRealtime(
      binId,
      (nextBin) => {
        if (!isMounted) {
          return;
        }

        setBin(nextBin);
        setNotFound(!nextBin);
        setIsLoading(false);
        setErrorMessage(null);
      },
      (error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error.message || "Unable to stream the selected bin.");
        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [binId]);

  return {
    bin,
    isLoading,
    errorMessage,
    notFound,
  };
}
