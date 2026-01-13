import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";

// Track agent connections to prevent duplicates
const agentConnections = new Set<string>();
// Keep realtime clients alive for the lifetime of the call
const realtimeClients = new Map<string, { disconnect?: () => Promise<void> }>(); // key: `${meetingId}:${agentId}`



import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
    CallRecordingReadyEvent,
    CallSessionStartedEvent,
} from "@stream-io/node-sdk";

// Helper function to connect agent to a call
async function connectAgentToCall(
    meetingId: string,
    agentId: string,
    agentName: string,
    instructions: string,
    call: ReturnType<typeof streamVideo.video.call>
) {
    const connectionKey = `${meetingId}:${agentId}`;

    // Check if already connected
    if (agentConnections.has(connectionKey)) {
        console.log(`[connectAgentToCall] Agent already connected: ${connectionKey}`);
        return;
    }

    console.log(`[connectAgentToCall] Connecting agent ${agentId} to call ${meetingId}...`);

    try {
        // Ensure agent user exists
        await streamVideo.upsertUsers([
            { id: agentId, name: agentName },
        ]);

        // Generate token for agent
        const agentToken = streamVideo.generateCallToken({
            user_id: agentId,
            call_cids: [call.cid],
            validity_in_seconds: 3600,
        });
        console.log(`[connectAgentToCall] Agent token generated`);

        // Verify call state and members before connecting
        try {
            const callState = await call.get();
            const agentIsMember = callState.members?.some(
                (m: { user_id: string }) => m.user_id === agentId
            );
            const otherMembers = callState.members?.filter(
                (m: { user_id: string }) => m.user_id !== agentId
            ) || [];

            console.log(`[connectAgentToCall] Call state:`, {
                callId: callState.call?.id,
                sessionId: callState.call?.current_session_id,
                agentIsMember,
                otherMembersCount: otherMembers.length,
            });

            if (!agentIsMember) {
                console.warn(`[connectAgentToCall] ⚠️ Agent is not a call member - this may cause issues`);
            }
        } catch (e) {
            console.warn(`[connectAgentToCall] Could not verify call state:`, e);
        }

        // Connect OpenAI Realtime client - this should automatically join the agent to the call
        console.log(`[connectAgentToCall] Calling connectOpenAi...`);
        const realtimeClient = await streamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            agentUserId: agentId,
        });
        console.log(`[connectAgentToCall] ✅ connectOpenAi returned successfully`);

        console.log(`[connectAgentToCall] Realtime client connected`);

        // Set up comprehensive event listeners
        realtimeClient.on('session.updated', (event: unknown) => {
            console.log(`[connectAgentToCall] Session updated:`, JSON.stringify(event, null, 2));
        });

        realtimeClient.on('conversation.item.input_audio_transcription.completed', (event: unknown) => {
            console.log(`[connectAgentToCall] ✅ TRANSCRIPTION RECEIVED:`, JSON.stringify(event, null, 2));
        });

        realtimeClient.on('conversation.item.input_audio_transcription.failed', (event: unknown) => {
            console.error(`[connectAgentToCall] ❌ Transcription failed:`, JSON.stringify(event, null, 2));
        });

        realtimeClient.on('conversation.item.output_audio.delta', (_event: unknown) => {
            console.log(`[connectAgentToCall] 🔊 Agent generating audio response`);
        });

        realtimeClient.on('conversation.item.output_audio.done', (_event: unknown) => {
            console.log(`[connectAgentToCall] ✅ Agent finished generating audio`);
        });

        realtimeClient.on('input_audio_buffer.speech_started', () => {
            console.log(`[connectAgentToCall] 🎤 SPEECH DETECTED - Agent is listening!`);
        });

        realtimeClient.on('input_audio_buffer.speech_stopped', () => {
            console.log(`[connectAgentToCall] 🎤 Speech stopped`);
        });

        realtimeClient.on('input_audio_buffer.committed', () => {
            console.log(`[connectAgentToCall] 🎤 Audio buffer committed`);
        });

        realtimeClient.on('conversation.item.created', (event: unknown) => {
            console.log(`[connectAgentToCall] 📝 Conversation item created:`, JSON.stringify(event, null, 2));
        });

        realtimeClient.on('response.audio_transcript.delta', (event: unknown) => {
            console.log(`[connectAgentToCall] 📝 Response transcript delta:`, JSON.stringify(event, null, 2));
        });

        realtimeClient.on('response.audio_transcript.done', (event: unknown) => {
            console.log(`[connectAgentToCall] ✅ Response transcript done:`, JSON.stringify(event, null, 2));
        });

        realtimeClient.on('error', (error: unknown) => {
            console.error(`[connectAgentToCall] ❌ Error:`, JSON.stringify(error, null, 2));
        });

        realtimeClient.on('connection.closed', () => {
            console.log(`[connectAgentToCall] ⚠️ Connection closed - cleaning up`);
            agentConnections.delete(connectionKey);
            realtimeClients.delete(connectionKey);
        });

        // Wait for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update session with instructions and ensure audio is enabled
        const sessionUpdate: Record<string, unknown> = {
            instructions: instructions || "You are a helpful AI assistant in a video call. Listen carefully and respond naturally.",
            voice: "alloy",
            temperature: 0.8,
        };

        realtimeClient.updateSession(sessionUpdate);

        console.log(`[connectAgentToCall] Session updated with instructions`);

        // Wait for session to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify connection is still active
        try {
            const isConnected = realtimeClient.isConnected?.() ?? false;
            console.log(`[connectAgentToCall] Connection status: ${isConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
            if (!isConnected) {
                throw new Error('Realtime client disconnected after connection');
            }
        } catch (e) {
            console.warn(`[connectAgentToCall] Could not verify connection status:`, e);
        }

        // Store client to keep it alive
        agentConnections.add(connectionKey);
        realtimeClients.set(connectionKey, {
            disconnect: async () => {
                try {
                    await realtimeClient.disconnect();
                } catch (e) {
                    console.error(`[connectAgentToCall] Error disconnecting:`, e);
                }
            }
        });

        console.log(`[connectAgentToCall] ✅ Agent successfully connected and ready: ${connectionKey}`);

    } catch (error) {
        console.error(`[connectAgentToCall] Failed to connect agent:`, error);
        throw error;
    }
}


function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json(
            { error: "Missing signature or API key" },
            { status: 400 }
        );
    }

    const body = await req.text();

    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;

    try {
        payload = JSON.parse(body) as Record<string, unknown>;

    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    }
    const eventType = (payload as Record<string, unknown>)?.type;
    const callPayload = (payload as Record<string, unknown>)?.call as Record<string, unknown> | undefined;
    const meetingId = callPayload?.id as string | undefined;

    if (!meetingId) {
        return NextResponse.json({ error: "Missing meetingId" }, { status: 400 })
    }

    if (eventType === "call.session_started") {
        // Early check to prevent duplicate connections
        const processingKey = `processing:${meetingId}`;
        if (agentConnections.has(processingKey)) {
            console.log(`[Webhook] Already processing call ${meetingId}, skipping...`);
            return NextResponse.json({ status: "ok", message: "Already processing" });
        }
        agentConnections.add(processingKey);

        try {
            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, meetingId),
                        not(eq(meetings.status, "completed")),
                        not(eq(meetings.status, "active")),
                        not(eq(meetings.status, "canclled")),
                        not(eq(meetings.status, "processing")),
                    )
                );
            if (!existingMeeting) {
                agentConnections.delete(processingKey);
                return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
            }

            await db
                .update(meetings)
                .set({
                    status: "active",
                    startedAt: new Date(),
                })
                .where(eq(meetings.id, existingMeeting.id));
            const [existingAgent] = await db
                .select()
                .from(agents)
                .where(eq(agents.id, existingMeeting.agentId));

            if (!existingAgent) {
                agentConnections.delete(processingKey);
                return NextResponse.json({ error: "Agent not found" }, { status: 404 });
            }

            // Ensure agent user exists in Stream.io before connecting
            try {
                await streamVideo.upsertUsers([
                    { id: existingAgent.id, name: existingAgent.name },
                ]);
                console.log(`[Webhook] Agent user upserted in Stream.io: ${existingAgent.id}`);
            } catch (upsertError) {
                console.error(`[Webhook] Failed to upsert agent user:`, upsertError);
                // Continue anyway - user might already exist
            }

            if (!process.env.OPENAI_API_KEY) {
                console.error(`[Webhook] OPENAI_API_KEY not set, cannot connect agent`);
                return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
            }

            // Validate OpenAI API key format
            if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
                console.error(`[Webhook] Invalid OpenAI API key format - should start with 'sk-'`);
                return NextResponse.json({ error: "Invalid OPENAI_API_KEY format" }, { status: 500 });
            }

            console.log(`[Webhook] OpenAI API key validated (length: ${process.env.OPENAI_API_KEY.length})`);

            // Check if agent is already connected
            const finalConnectionKey = `${meetingId}:${existingAgent.id}`;
            if (agentConnections.has(finalConnectionKey)) {
                console.log(`[Webhook] ⚠️ Agent already connected to call ${meetingId}, skipping...`);
                agentConnections.delete(processingKey);
                return NextResponse.json({ status: "ok", message: "Agent already connected" });
            }

            console.log(`[Webhook] Connecting agent to call session: ${meetingId}`);
            const call = streamVideo.video.call("default", meetingId);

            // Wait for session to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Connect agent using helper function
            try {
                await connectAgentToCall(
                    meetingId,
                    existingAgent.id,
                    existingAgent.name,
                    existingAgent.instructions || "You are a helpful AI assistant in a video call.",
                    call
                );
                agentConnections.delete(processingKey);
                console.log(`[Webhook] ✅ Agent connection completed successfully`);
            } catch (connectError) {
                agentConnections.delete(processingKey);
                console.error(`[Webhook] ❌ Failed to connect agent:`, connectError);
                // Don't fail the webhook - call can proceed without agent
            }
        } catch (outerError) {
            // Clean up on any outer error
            agentConnections.delete(processingKey);
            console.error(`[Webhook] Outer error in call.session_started handler:`, outerError);
            throw outerError;
        }
    }
    else if (eventType === "call.session_participant_joined") {
        // When a participant joins, ensure agent is connected and can receive their audio
        console.log(`[Webhook] Participant joined call: ${meetingId}`);

        try {
            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(eq(meetings.id, meetingId))
                .limit(1);

            if (existingMeeting) {
                const [existingAgent] = await db
                    .select()
                    .from(agents)
                    .where(eq(agents.id, existingMeeting.agentId))
                    .limit(1);

                if (existingAgent) {
                    const connectionKey = `${meetingId}:${existingAgent.id}`;

                    // If agent is not connected yet, connect it now
                    if (!agentConnections.has(connectionKey)) {
                        console.log(`[Webhook] Participant joined - connecting agent now...`);
                        const call = streamVideo.video.call("default", meetingId);
                        await connectAgentToCall(
                            meetingId,
                            existingAgent.id,
                            existingAgent.name,
                            existingAgent.instructions || "You are a helpful AI assistant.",
                            call
                        );
                    } else {
                        console.log(`[Webhook] Agent already connected, should receive audio from new participant`);
                    }
                }
            }
        } catch (error) {
            console.error(`[Webhook] Error handling participant join:`, error);
        }
    }
    else if (eventType === "call.ended") {
        const event = payload as CallEndedEvent;
        const meetingId = event.call_cid.split(":")[1];

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingid" }, { status: 400 });
        }

        // Clean up agent connection tracking and realtime client
        for (const key of agentConnections) {
            if (key.startsWith(`${meetingId}:`)) {
                agentConnections.delete(key);
                const client = realtimeClients.get(key);
                if (client?.disconnect) {
                    client.disconnect().catch(() => { });
                }
                realtimeClients.delete(key);
                console.log(`[Webhook] Cleaned up agent client for ${key}`);
            }
        }

        await db
            .update(meetings)
            .set({
                status: "completed",
                endedAt: new Date(),
            })
            .where(eq(meetings.id, meetingId));
    }



    return NextResponse.json({ status: "ok" });
}