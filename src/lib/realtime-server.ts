import { createRealtime, rawSql, type RealtimeServer, type RawSqlQuery } from "@neon/realtime/server";

let _realtime: RealtimeServer<RawSqlQuery<unknown>> | null = null;

export function getRealtime(): RealtimeServer<RawSqlQuery<unknown>> {
  if (_realtime) return _realtime;
  const secret = process.env.NEON_REALTIME_SECRET;
  if (!secret) {
    throw new Error("NEON_REALTIME_SECRET environment variable is not set.");
  }
  const db = process.env.NEON_DATABASE_NAME || "neondb";
  _realtime = createRealtime({ secret, db });
  return _realtime;
}

export const realtime = {
  seal: async <ConcreteQuery extends RawSqlQuery<unknown>>(input: { query: ConcreteQuery }) => {
    const r = getRealtime();
    return r.seal(input);
  },
};

export { rawSql };
