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

export const CallLobby = ({onJoin}: Props) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const { useCameraState, useMicrophoneState } = useCallStateHooks();
    const { hasBrowserPermission: hasCameraPermission } = useCameraState();
    const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
    const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
                <div className="py-4 px-8 flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                        <div className="flex flex-col gap-y-2 text-center">
                            <h6 className="text-lg font-medium">Ready to Join?</h6>
                            <p className="text-sm"> Set up your call before joining</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
            <div className="py-4 px-8 flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                    <VideoPlaceholder />
                    <div className="flex flex-col gap-y-2 text-center">
                        <h6 className="text-lg font-medium">Ready to Join?</h6>
                        <p className="text-sm"> Set up your call before joining</p>
                        </div>
                        {hasBrowserMediaPermission ? (
                            <VideoPreview />
                        ) : (
                            <AllowBrowserPermission />
                        )}

                        <div className="flex gap-x-2">
                            <ToggleAudioPreviewButton/>
                            <ToggleVideoPreviewButton/>

                        </div>
                        <div className="flex gap-x-2 justify-between w-full">
                            <Button asChild variant="ghost">
                                <Link href = "/meetings">
                                Cancel
                                </Link>
                            </Button>
                            <Button
                            onClick={onJoin}
                            >
                                <LogInIcon/>
                                Join Call
                            </Button>
                        </div>



                </div>

            </div>

        </div>
    )
}