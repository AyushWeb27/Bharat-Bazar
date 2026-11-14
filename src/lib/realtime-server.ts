import { createRealtime, rawSql } from "@neon/realtime/server";

const secret = process.env.NEON_REALTIME_SECRET ?? "";
const db = "neondb"; // DB name from DATABASE_URL

export const realtime = createRealtime({ secret, db });
export { rawSql };
