import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { functions } from '@/inngest/functions';

/**
 * Inngest API endpoint
 * Handles background job execution
 */
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions,
    servePath: '/api/inngest',
});
