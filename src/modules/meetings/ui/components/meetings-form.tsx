import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types"
import {  useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage } from "@/components/ui/form";
import { meetingsInsertSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo, useCallback, useState } from "react";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";

interface MeetingFormProps{
    onSuccess?: (id?:string) => void;
    onCancel?:() => void;
    initialValue?: MeetingGetOne;
}

export const MeetingForm =({
    onSuccess,
    onCancel,
    initialValue,
}:MeetingFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [openNewAgentDialog,setOpenNewAgentDialog] = useState(false);
    const[agentSearch,setAgentSearch] = useState("");


    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100,
            search: agentSearch,
        })
    );

    const getManyAgentsQueryOptions = useMemo(
        () => trpc.agents.getMany.queryOptions({}),
        [trpc.agents.getMany]
    );

    const getManyMeetingsQueryOptions = useMemo(
        () => trpc.meetings.getMany.queryOptions({}),
        [trpc.meetings.getMany]
    );

    const getOneMeetingQueryOptions = useMemo(
        () => initialValue?.id ? trpc.meetings.getOne.queryOptions({ id: initialValue.id }) : null,
        [trpc.meetings.getOne, initialValue?.id]
    );

    const handleSuccess = useCallback(async (data: { id: string }) => {
        await queryClient.invalidateQueries({
            queryKey: getManyAgentsQueryOptions.queryKey,
        });

        await queryClient.invalidateQueries({
            queryKey: getManyMeetingsQueryOptions.queryKey,
        });

        if(getOneMeetingQueryOptions){
            await queryClient.invalidateQueries({
                queryKey: getOneMeetingQueryOptions.queryKey,
            });
        }

        onSuccess?.(data.id);
    }, [queryClient, getManyAgentsQueryOptions.queryKey, getManyMeetingsQueryOptions.queryKey, getOneMeetingQueryOptions, onSuccess]);

    const createMutationOptions = useMemo(
        () => trpc.meetings.create.mutationOptions({
            onSuccess: handleSuccess,
            onError: (error: unknown) => {
                const message =
                    error instanceof Error ? error.message : "Failed to create meeting";
                toast.error(message);
            },
        }),
        [trpc.meetings.create, handleSuccess]
    );

    const updateMutationOptions = useMemo(
        () => trpc.meetings.update.mutationOptions({
            onSuccess: handleSuccess,
            onError: (error: unknown) => {
                const message =
                    error instanceof Error ? error.message : "Failed to update meeting";
                toast.error(message);
            },
        }),
        [trpc.meetings.update, handleSuccess]
    );

    const createMeeting = useMutation(createMutationOptions);
    const updateMeeting = useMutation(updateMutationOptions);

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues:{
            name: initialValue?.name??"",
            agentId: initialValue?.agentId??"",
        },
    });

    const isEdit = !!initialValue?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit && initialValue?.id) {
            updateMeeting.mutate({
                id: initialValue.id,
                ...values,
            });
        } else {
            createMeeting.mutate(values);
        }
    };

    return (
        <>
        <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog}/>
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              
            <FormField
            name="name"
            control = {form.control}
            render={({field}) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="e.g. Math Consultation"/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            name="agentId"
            control = {form.control}
            render={({field}) => (
                <FormItem>
                    <FormLabel>Agents</FormLabel>
                    <FormControl>
                       <CommandSelect
                       options={(agents.data?.items??[]).map((agent)=>({
                        id:agent.id,
                        value:agent.id,
                        children:(
                            <div className="flex items-center gap-x-2">
                                <GeneratedAvatar
                                seed={agent.name}
                                variant="botttsNeutral"
                                className="border size-6"
                                />
                                <span>{agent.name}</span>
                            </div>
                        )
                       }))}

                       onSelect={field.onChange}
                       onSearch={setAgentSearch}
                       value={field.value}
                       placeholder="Select an agent"
                       />
                    </FormControl>

                    <FormDescription>
                        Not found what you&apos; re looking for?{" "}
                        <button 
                        type="button"
                        className="text-primary hover:underline"
                        onClick={()=> setOpenNewAgentDialog(true)}>

                        </button>
                        </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
            />
            

            <div className="flex justify-between gap-x-2">
                {onCancel && (
                    <Button variant = "ghost"
                    disabled = {isPending}
                    type = "button"
                    onClick= {() => onCancel()}>
                        Cancel
                    </Button>
                )}
                <Button disabled= {isPending} type="submit">
                    {isEdit ? "Update" : "Create Agent"}
                </Button>
            </div>
            
            </form>

        </Form>
        </>
    )
}