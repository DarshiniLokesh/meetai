import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";

import { agents, meetings } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { agentsInsertSchema, agentsUpdateSchema } from "../scehma";
import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants";

export const agentsRouter = createTRPCRouter({

    update: protectedProcedure
        .input(agentsUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const [updatedAgent] = await db
                .update(agents)
                .set(input)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.auth.user.id),
                    )
                )
                .returning();

            if (!updatedAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found"
                });
            }
            return updatedAgent;
        }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const [removeAgent] = await db
                .delete(agents)
                .where(
                    and(
                        eq(agents.id, input.id),
                        eq(agents.userId, ctx.auth.user.id),
                    ),
                )
                .returning();

            if (!removeAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found"
                });
            }
            return removeAgent;
        }),
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const [existingAgent] = await db
            .select({
                ...getTableColumns(agents),
                meetingCount: count(meetings.id)
            })
            .from(agents)
            .leftJoin(meetings, eq(meetings.agentId, agents.id))
            .where(
                and(
                    eq(agents.id, input.id),
                    eq(agents.userId, ctx.auth.user.id),
                )
            )
            .groupBy(agents.id);

        if (!existingAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not Found" })
        }



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

        .query(async ({ ctx, input }) => {

            const { search, page, pageSize } = input;

            const data = await db
                .select({
                    ...getTableColumns(agents),
                    meetingCount: count(meetings.id)
                })
                .from(agents)
                .leftJoin(meetings, eq(meetings.agentId, agents.id))
                .where(
                    search
                        ? and(
                            eq(agents.userId, ctx.auth.user.id),
                            ilike(agents.name, `%${search}%`)
                        )
                        : eq(agents.userId, ctx.auth.user.id)
                )
                .groupBy(agents.id)
                .orderBy(desc(agents.createdAt), desc(agents.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize)
            const [{ count: totalCount }] = await db
                .select({ count: count() })
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

            return {
                items: data,
                total: totalCount,
                totalPages,

            };
        }),
    create: protectedProcedure
        .input(agentsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdAgent] = await db
                .insert(agents)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();

            return createdAgent;
        }),
});
