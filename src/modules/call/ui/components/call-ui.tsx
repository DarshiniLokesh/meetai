"use client";

import { StreamTheme, useCall, CallingState } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CallLobby } from "./call-lobby";
import { Callactive } from "./call-active";
import { CallEnded } from "./call-ended";
interface Props {
    meetingName: string;
    startedAt?: Date | null;
};

export const CallUI = ({ meetingName, startedAt }: Props) => {
    const call = useCall();
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!call || call.state.callingState === CallingState.JOINED || isJoining) return;

        try {
            setIsJoining(true);
            setJoinError(null);

            console.log("[CallUI] Attempting to join call:", {
                callId: call.id,
                callType: call.type,
                callingState: call.state.callingState,
            });

            await call.join();

            console.log("[CallUI] Successfully joined call:", {
                callId: call.id,
                callingState: call.state.callingState,
            });

            setShow("call");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to join call";
            setJoinError(errorMessage);
            console.error("[CallUI] Join error:", {
                error: errorMessage,
                callId: call?.id,
                callType: call?.type,
                callingState: call?.state?.callingState,
                errorDetails: error,
            });
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = () => {
        if (!call) return;

        call.endCall();
        setShow("ended");
    };

    return (
        <StreamTheme className="h-full">
            {show === "lobby" && <CallLobby onJoin={handleJoin} error={joinError} isJoining={isJoining} />}
            {show === "call" && <Callactive onLeave={handleLeave} meetingName={meetingName} startedAt={startedAt} />}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
    )
}