import { useState, useEffect } from "react";

export function useCountdown(s: number) {
  const [t, setT] = useState(s);
  useEffect(() => {
    const id = setInterval(() => setT(x => x > 0 ? x - 1 : s), 1000);
    return () => clearInterval(id);
  }, [s]);
  return {
    h: String(Math.floor(t / 3600)).padStart(2, "0"),
    m: String(Math.floor((t % 3600) / 60)).padStart(2, "0"),
    s: String(t % 60).padStart(2, "0"),
  };
}
