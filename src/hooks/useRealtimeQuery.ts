"use client";
import { useEffect, useRef, useState } from "react";
import {
  createRealtimeClient,
  type SealedLiveQuery,
  type LiveQuerySnapshot,
  type LiveQueryError,
  type LiveQueryState,
  type MaterializedLiveQuerySubscription,
} from "@neon/realtime/client";

export type RealtimeStatus = "connecting" | "live" | "stale" | "error" | "closed";

export function useRealtimeQuery<T>(
  fetchSealedQuery: () => Promise<SealedLiveQuery<T>>,
  initialData?: T[]
): { data: T[] | undefined; status: RealtimeStatus; error: LiveQueryError | undefined } {
  const [snapshot, setSnapshot] = useState<LiveQuerySnapshot<T>>({
    status: "connecting",
    error: undefined,
    data: initialData,
  });

  const fetchRef = useRef(fetchSealedQuery);
  fetchRef.current = fetchSealedQuery;

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_NEON_REALTIME_URL;
    if (!url) {
      console.warn("NEXT_PUBLIC_NEON_REALTIME_URL is not set");
      return;
    }

    const client = createRealtimeClient({ url });
    let sub: MaterializedLiveQuerySubscription<T> | null = null;

    async function start() {
      try {
        const sealedQuery = await fetchRef.current();
        sub = client.subscribe<T>(sealedQuery, { materialize: true, initialData });

        // Listen to snapshot changes (data + status together)
        sub.onChange((snap: LiveQuerySnapshot<T>) => {
          setSnapshot(snap);
        });

        // Handle stale — re-fetch a new sealed query and renew
        sub.onStateChange(async (state: LiveQueryState) => {
          if (state.status === "stale" && sub) {
            try {
              const fresh = await fetchRef.current();
              await sub.renew(fresh);
            } catch (e) {
              console.error("Realtime renew failed:", e);
            }
          }
        });
      } catch (e) {
        console.error("Realtime subscribe failed:", e);
        setSnapshot((prev) => ({
          ...prev,
          status: "error",
          error: e as LiveQueryError,
        }));
      }
    }

    void start();

    return () => {
      sub?.unsubscribe();
      client.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = snapshot.status as RealtimeStatus;
  return {
    data: snapshot.data as T[] | undefined,
    status,
    error: snapshot.status === "error" ? snapshot.error : undefined,
  };
}
