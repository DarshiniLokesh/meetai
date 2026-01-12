import { Inngest } from 'inngest';

/**
 * Inngest client for MeetAI
 * Handles background jobs for call events and transcript processing
 */
export const inngest = new Inngest({
    id: 'meetai',
    name: 'MeetAI Background Jobs'
});
