import {betterAuth } from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
    trustedOrigins: [
        "http://localhost:3000",
        "http://192.168.0.155:3000",
        "http://192.168.0.155:3001",
    ],
    emailAndPassword:{
        enabled:true,
    },
    database:drizzleAdapter(db,{
        provider: "pg",
        schema: {
            ...schema,
        },
    }),
});