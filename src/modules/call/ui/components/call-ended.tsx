"use client";

import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthClient } from "@/lib/auth-client";
import { generatedAvatarUri } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import {
    DefaultVideoPlaceholder,
    StreamVideoParticipant,
    ToggleAudioPreviewButton,
    ToggleVideoPreviewButton,
    useCallStateHooks,
    VideoPreview,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";


interface Props{
    onJoin: () => void;
};

const VideoPlaceholder = () => {
    const { useLocalParticipant } = useCallStateHooks();
    const localParticipant = useLocalParticipant();
    
    return (
        <DefaultVideoPlaceholder
            participant={
                {
                    name: localParticipant?.name ?? "",
                    image:
                        localParticipant?.image ??
                        generatedAvatarUri({
                            seed: localParticipant?.name ?? "",
                            variant: "initials",
                        }),
                } as StreamVideoParticipant
            }
        />
    );
};

 const AllowBrowserPermission = () => {
    return (
        <p className="text-sm">
            Please grant permission to access your camera and microphone
        </p>
    )
 }

export const CallEnded = () => {
    

     {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
                <div className="py-4 px-8 flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                        <div className="flex flex-col gap-y-2 text-center">
                            <h6 className="text-lg font-medium">You have ended the call</h6>
                            <p className="text-sm"> Summary will appear in few mins</p>
                        </div>
                        <Button asChild>
                            <Link href="/meetings"> Back to meetings</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

}