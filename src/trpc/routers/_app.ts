import {z} from 'zod';
import { agentsRouter } from '@/modules/agents/server/procedures';

import { baseProcedure, createTRPCRouter } from '../init';

import { meetingsRouter } from '@/modules/meetings/server/procedures';
export const appRouter = createTRPCRouter({
    agents: agentsRouter,
    meetings: meetingsRouter
});

export type AppRouter = typeof appRouter;