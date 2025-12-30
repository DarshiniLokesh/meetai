import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

import {
    CallControls,
    SpeakerLayout,
    useCallStateHooks,
} from "@stream-io/video-react-sdk"

interface Props {
    onLeave: () => void;
    meetingName: string;
};

export const Callactive = ({onLeave, meetingName}:Props) => {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    
    // Log participants to verify agent is present
    useEffect(() => {
        console.log("[CallActive] Call participants:", participants.map(p => ({
            userId: p.userId,
            name: p.name,
            isLocal: p.isLocalParticipant,
            sessionId: p.sessionId,
        })));
    }, [participants]);
    
    return (
        <div className="flex flex-col justify-between p-4 h-full text-white">
            <div className="bg-[#101213] rounded-full p-4 flex items-center gap-4">
             <Link href="/"  className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
             <Image src="/logo.svg" width={22} height={22} alt="Logo"/>
             </Link>   
             <h4 className="text-base">
                {meetingName}
             </h4>

            </div>
            <SpeakerLayout/>
            <div className="bg-[#101213] rounded-full px-4">
                <CallControls onLeave={onLeave}/>
            </div>
        </div>
    );
};

