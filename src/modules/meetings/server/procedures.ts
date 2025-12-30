import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql} from "drizzle-orm";

import {  agents, meetings } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { streamVideo } from "@/lib/stream-video";

import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schema";
import { MeetingStatus } from "../types";


export const meetingsRouter = createTRPCRouter({


    remove:  protectedProcedure
      .input(z.object({id:z.string()}))
      .mutation(async({ctx, input}) => {
        const[removedMeeting] = await db
          .delete(meetings)
          .where(
            and(
                eq(meetings.id, input.id),
                eq(meetings.userId, ctx.auth.user.id),
            )
          )
          .returning();

          if(!removedMeeting){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting  not found"
            });
          }
          return removedMeeting;
      }),


    update:  protectedProcedure
      .input(meetingsUpdateSchema)
      .mutation(async({ctx, input}) => {
        const[updatedMeeting] = await db
          .update(meetings)
          .set(input)
          .where(
            and(
                eq(meetings.id, input.id),
                eq(meetings.userId, ctx.auth.user.id),
            )
          )
          .returning();

          if(!updatedMeeting){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting  not found"
            });
          }
          return updatedMeeting;
      }),

    create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async({input,ctx})=> {
        const[createdMeeting] = await db
        .insert(meetings)
        .values({
            ...input,
            userId: ctx.auth.user.id,
        })
        .returning();

        return createdMeeting;
    }),



    
    getOne: protectedProcedure.input(z.object({id:z.string()})).query(async({input,ctx}) => {
        const [existingMeeting] = await db
        .select({
            ...getTableColumns(meetings),
            agent: agents,
            duration: sql<number>`EXTRACT(EPOCH FROM(ended_at - started_at))`.as("duration"),
           
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
            and(
                eq (meetings.id,input.id),
                eq (meetings.userId,ctx.auth.user.id),
            )
        );

        if(!existingMeeting){
            throw new TRPCError({code:"NOT_FOUND", message:"Meeting not Found"})
        }

        

        return existingMeeting;
    }),
    getMany: protectedProcedure
    .input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
         .number()
         .min(MIN_PAGE_SIZE)
         .max(MAX_PAGE_SIZE)
         .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z 
            .enum([
                MeetingStatus.Upcoming,
                MeetingStatus.Active,
                MeetingStatus.Completed,
                MeetingStatus.Processing,
                MeetingStatus.Cancelled,
            ])
            .nullish(),
    }))
    
    .query(async({ctx, input}) => {
        const { search, page, pageSize, status, agentId} = input;

        const data = await db
        .select({
            ...getTableColumns(meetings),
            agent: agents,
            duration: sql<number>`EXTRACT(EPOCH FROM(ended_at - started_at))`.as("duration"),
            
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
            and(
                eq(meetings.userId, ctx.auth.user.id),
                ...(search ? [ilike(meetings.name, `%${search}%`)] : []),
                ...(status ? [eq(meetings.status, status)] : []),
                ...(agentId ? [eq(meetings.agentId, agentId)] : []),
            )
        )

        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        const [{ count: totalCount }] = await db
        
        .select({count: count()})
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
            search
            ?  and(
                eq(meetings.userId, ctx.auth.user.id),
                ...(search ? [ilike(meetings.name, `%${search}%`)] : []),
                ...(status ? [eq(meetings.status, status)] : []),
                ...(agentId ? [eq(meetings.agentId, agentId)] : []),
            )
            : eq(meetings.userId, ctx.auth.user.id)
        );

        const totalPages = Math.ceil(totalCount / pageSize);

        return{
            items: data,
            total: totalCount,
            totalPages,

        };
    }),
    generateToken: protectedProcedure
        .input(z.object({meetingId: z.string()}))
        .mutation(async ({ctx, input}) => {
            const [meeting] = await db
                .select({
                    ...getTableColumns(meetings),
                    agent: agents,
                })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(
                    and(
                        eq(meetings.id, input.meetingId),
                        eq(meetings.userId, ctx.auth.user.id),
                    )
                )
                .limit(1);

            if (!meeting) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Meeting not found"
                });
            }

            // Ensure users exist in Stream.io
            await streamVideo.upsertUsers([
                { id: ctx.auth.user.id, name: ctx.auth.user.name || ctx.auth.user.email || "User" },
                { id: meeting.agent.id, name: meeting.agent.name },
            ]);

            const token = streamVideo.generateUserToken({
                user_id: ctx.auth.user.id,
                validity_in_seconds: 3600
            });

            // Create call and connect agent BEFORE user joins - CRITICAL
            console.log(`[generateToken] Creating call for meeting: ${input.meetingId}`);
            const call = streamVideo.video.call("default", input.meetingId);
            
            // Use getOrCreate to ensure call exists - this handles both creation and retrieval
            try {
                console.log(`[generateToken] Calling getOrCreate for call: default:${input.meetingId}`);
                const callResult = await call.getOrCreate({
                    data: {
                        created_by_id: ctx.auth.user.id,
                        members: [
                            { user_id: ctx.auth.user.id, role: "user" },
                            { user_id: meeting.agent.id, role: "user" },
                        ],
                    },
                });
                console.log(`[generateToken] getOrCreate succeeded:`, JSON.stringify(callResult, null, 2));
            } catch (createError: unknown) {
                const errorMessage = createError instanceof Error ? createError.message : String(createError);
                console.error(`[generateToken] getOrCreate failed:`, errorMessage);
                console.error(`[generateToken] Error details:`, createError);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create call: ${errorMessage}`
                });
            }
            
            // Verify call exists by fetching it - retry if needed
            let verified = false;
            let lastError: unknown = null;
            for (let i = 0; i < 5; i++) {
                try {
                    const callData = await call.get();
                    console.log(`[generateToken] Call verified on attempt ${i + 1}:`, JSON.stringify(callData, null, 2));
                    verified = true;
                    break;
                } catch (error) {
                    lastError = error;
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    console.log(`[generateToken] Verification attempt ${i + 1} failed:`, errorMsg);
                    if (i < 4) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            if (!verified) {
                const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
                console.error(`[generateToken] Call verification failed after 5 attempts. Last error:`, errorMsg);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Call was created but could not be verified: ${errorMsg}. Please try again.`
                });
            }
            
            console.log(`[generateToken] Call successfully created and verified: ${input.meetingId}`);
            
            // Wait a moment to ensure call is fully propagated in Stream.io
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Final verification - ensure call is still accessible
            try {
                const finalCheck = await call.get();
                console.log(`[generateToken] Final call check passed:`, JSON.stringify(finalCheck, null, 2));
            } catch (finalError) {
                const errorMsg = finalError instanceof Error ? finalError.message : String(finalError);
                console.error(`[generateToken] Final call check failed:`, errorMsg);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Call verification failed before returning token: ${errorMsg}`
                });
            }

            // Note: Agent connection happens via webhook when call.session_started fires
            // This ensures the agent connects when the call session is actually active
            // The agent is already added as a member during call creation above
            console.log(`[generateToken] Agent will be connected when call session starts (via webhook)`);

            console.log(`[generateToken] Returning token for meeting: ${input.meetingId}`);
            return {token};
        }),
});
