"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
    Call,
    CallingState,
    StreamCall,
    StreamVideo,
    StreamVideoClient
} from "@stream-io/video-react-sdk"
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css"
import { CallUI } from "./call-ui";





interface Props {
    meetingId: string;
    meetingName: string;
    startedAt?: Date | null;
    userId: string;
    userName: string;
    userImage: string;
}

export const CallConnect = ({
    meetingId,
    meetingName,
    startedAt,
    userId,
    userName,
    userImage,
}: Props) => {

    const trpc = useTRPC();
    const { mutateAsync: generateToken } = useMutation(
        trpc.meetings.generateToken.mutationOptions(),
    );

    const [client, setClient] = useState<StreamVideoClient>();
    useEffect(() => {
        const _client = new StreamVideoClient(
            process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!
        );

        const connect = async () => {
            await _client.connectUser(
                {
                    id: userId,
                    name: userName,
                    image: userImage,
                },
                async () => {
                    const result = await generateToken({ meetingId });
                    return result.token;
                }
            );
            setClient(_client);
        };

        connect();

        return () => {
            _client.disconnectUser();
            setClient(undefined);
        }
    }, [userId, userName, userImage, generateToken, meetingId]);

    const [call, setCall] = useState<Call>();
    useEffect(() => {
        if (!client) return;
        const _call = client.call("default", meetingId);
        setCall(_call);

        return () => {
            if (_call.state.callingState !== CallingState.LEFT) {
                _call.leave();
            }
        }
    }, [client, meetingId]);

    if (!client || !call) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent">
                <LoaderIcon className="size-6 animate-spin text-white" />
            </div>
        );
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <CallUI meetingName={meetingName} startedAt={startedAt} />
            </StreamCall>
        </StreamVideo>
    )
}