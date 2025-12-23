"use client"

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { useConfirm } from "@/modules/agents/hooks/use-confirm";

interface Props {
    meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                router.push("/meetings");
            },
            onError: (error) => {
                toast.error(error.message);
            }
        }),
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "This action will permanently delete this meeting."
    );

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        await removeMeeting.mutateAsync({ id: meetingId });
    };

    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                <div className="bg-white rounded-lg border">
                    <div className="px-4 py-5 gap-y-5 flex flex-col">
                        <div className="flex items-center gap-x-3">
                            <h2 className="text-2xl font-medium">{data.name}</h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-x-2 [&>svg]:size-4"
                        >
                            <CalendarIcon />
                            Status: {data.status}
                        </Badge>
                        {data.startedAt && (
                            <Badge
                                variant="outline"
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <ClockIcon />
                                Started: {format(new Date(data.startedAt), "PPp")}
                            </Badge>
                        )}
                        {data.endedAt && (
                            <Badge
                                variant="outline"
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <ClockIcon />
                                Ended: {format(new Date(data.endedAt), "PPp")}
                            </Badge>
                        )}
                    </div>

                    {data.summary && (
                        <div className="flex flex-col gap-y-4">
                            <p className="text-lg font-medium">Summary</p>
                            <p className="text-neutral-800">{data.summary}</p>
                        </div>
                    )}

                    {data.transcriptUrl && (
                        <div className="flex flex-col gap-y-2">
                            <p className="text-lg font-medium">Transcript</p>
                            <a
                                href={data.transcriptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View Transcript
                            </a>
                        </div>
                    )}

                    {data.recordingUrl && (
                        <div className="flex flex-col gap-y-2">
                            <p className="text-lg font-medium">Recording</p>
                            <a
                                href={data.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View Recording
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export const MeetingIdViewLoading = () => {
    return (
        <LoadingState
            title="Loading meeting"
            description="This may take a few seconds"
        />
    );
};

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meeting"
            description="Something went wrong"
        />
    );
};


