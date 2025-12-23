import {initTRPC} from '@trpc/server';
import { auth } from '@/lib/auth';
import { TRPCError } from '@trpc/server';
import { headers } from 'next/headers';

export const createTRPCContext = async (opts?: { req?: Request }) => {
    // For API routes, we have a Request object
    if (opts?.req) {
        return {
            req: opts.req,
        };
    }
    
    // For server components, we need to create a mock request with headers
    const headersList = await headers();
    const req = new Request('http://localhost', {
        headers: headersList,
    });
    
    return {
        req,
    };
};

const t = initTRPC.create({


});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async({ctx,next}) =>{
    const session = await auth.api.getSession({
        headers: ctx.req.headers,
    });

    if(!session){
        throw new TRPCError({code: "UNAUTHORIZED", message:"Unauthorized"});
    }

    return next({ctx: {...ctx, auth: session}});
});