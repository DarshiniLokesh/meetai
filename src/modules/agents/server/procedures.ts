import { createTRPCRouter,baseProcedure ,protectedProcedure} from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";

import { agents } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { agentsInsertSchema } from "../scehma";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants";

export const agentsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({id:z.string()})).query(async({input}) => {
        const [existingAgent] = await db
        .select({
            ...getTableColumns(agents),
            meetingCount: sql<number>`5`
        })
        .from(agents)
        .where(eq(agents.id,input.id));

        

        return existingAgent;
    }),
    getMany: protectedProcedure
    .input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
         .number()
         .min(MIN_PAGE_SIZE)
         .max(MAX_PAGE_SIZE)
         .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish()
    }))
    
    .query(async({ctx, input}) => {
        
        const { search, page, pageSize } = input;

        const data = await db
        .select({
            ...getTableColumns(agents),
            meetingCount: sql<number>`5`
        })
        .from(agents)
        .where(
            search
            ? and(
                eq(agents.userId, ctx.auth.user.id),
                ilike(agents.name, `%${search}%`)
            )
            : eq(agents.userId, ctx.auth.user.id)
        )

        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        const [{ count: totalCount }] = await db
        .select({count: count()})
        .from(agents)
        .where(
            search
            ? and(
                eq(agents.userId, ctx.auth.user.id),
                ilike(agents.name, `%${search}%`)
            )
            : eq(agents.userId, ctx.auth.user.id)
        );

        const totalPages = Math.ceil(totalCount / pageSize);

        return{
            items: data,
            total: totalCount,
            totalPages,
            
        };
    }),
    create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async({input,ctx})=> {
        const[createdAgent] = await db
        .insert(agents)
        .values({
            ...input,
            userId: ctx.auth.user.id,
        })
        .returning();

        return createdAgent;
    }),
});
