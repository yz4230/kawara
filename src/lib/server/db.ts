import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export const driver = postgres(process.env.DATABASE_URL as string);
export const db = drizzle({ client: driver, schema, casing: "snake_case" });
