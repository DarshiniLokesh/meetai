import { inngest } from '@/lib/inngest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db';
import { meetings } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Summarize meeting transcript using Gemini AI
 * Triggered when transcription is ready
 */
export const summarizeTranscript = inngest.createFunction(
    {
        id: 'summarize-transcript',
        name: 'Summarize Meeting Transcript'
    },
    { event: 'call/transcription.ready' },
    async ({ event, step }) => {
        const { meetingId, transcriptUrl } = event.data;

        console.log(`[Inngest] Starting transcript summarization for meeting: ${meetingId}`);

        // Step 1: Fetch transcript from Stream.io
        const transcript = await step.run('fetch-transcript', async () => {
            console.log(`[Inngest] Fetching transcript from: ${transcriptUrl}`);

            try {
                const response = await fetch(transcriptUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch transcript: ${response.statusText}`);
                }

                const data = await response.json();

                // Stream.io transcript format: array of transcript items
                const transcriptText = data
                    .map((item: any) => `${item.user_name || 'Unknown'}: ${item.text}`)
                    .join('\n');

                console.log(`[Inngest] Transcript fetched (${transcriptText.length} characters)`);
                return transcriptText;
            } catch (error) {
                console.error(`[Inngest] Error fetching transcript:`, error);
                throw error;
            }
        });

        // Step 2: Generate summary using Gemini
        const summary = await step.run('generate-summary', async () => {
            console.log(`[Inngest] Generating summary with Gemini...`);

            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY not configured');
            }

            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const prompt = `You are an AI assistant that summarizes meeting transcripts.

Please provide a concise summary of the following meeting transcript. Include:
1. Main topics discussed
2. Key decisions made
3. Action items (if any)
4. Overall meeting outcome

Transcript:
${transcript}

Summary:`;

                const result = await model.generateContent(prompt);
                const summaryText = result.response.text();

                console.log(`[Inngest] Summary generated (${summaryText.length} characters)`);
                return summaryText;
            } catch (error) {
                console.error(`[Inngest] Error generating summary:`, error);
                throw error;
            }
        });

        // Step 3: Save summary to database
        await step.run('save-summary', async () => {
            console.log(`[Inngest] Saving summary to database...`);

            try {
                await db
                    .update(meetings)
                    .set({ summary })
                    .where(eq(meetings.id, meetingId));

                console.log(`[Inngest] ✅ Summary saved for meeting: ${meetingId}`);
            } catch (error) {
                console.error(`[Inngest] Error saving summary:`, error);
                throw error;
            }
        });

        return {
            success: true,
            meetingId,
            summaryLength: summary.length
        };
    }
);

/**
 * Export all Inngest functions
 */
export const functions = [
    summarizeTranscript,
];
