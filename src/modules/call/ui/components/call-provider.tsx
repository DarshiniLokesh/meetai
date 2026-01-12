"use client"

import { LoaderIcon } from "lucide-react"

import { AuthClient } from "@/lib/auth-client";
import { CallConnect } from "./call-connect";
import { generatedAvatarUri } from "@/lib/avatar";

interface Props {
    meetingId: string;
    meetingName: string;
    startedAt?: Date | null;
};

export const CallProvider = ({ meetingId, meetingName, startedAt }: Props) => {
    const { data, isPending } = AuthClient.useSession();

    if (!data || isPending) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoaderIcon className="animate-spin" />
            </div>
        );
    }

    return (
        <CallConnect
            meetingId={meetingId}
            meetingName={meetingName}
            startedAt={startedAt}
            userId={data.user.id}
            userName={data.user.name}
            userImage={
                data.user.image ??
                generatedAvatarUri({ seed: data.user.name, variant: "initials" })
            }
        />
    );
};