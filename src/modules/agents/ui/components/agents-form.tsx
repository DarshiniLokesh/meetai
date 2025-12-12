import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import {  useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl,FormField,FormItem,FormLabel,FormMessage } from "@/components/ui/form";
import { agentsInsertSchema } from "../../scehma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo, useCallback } from "react";

interface AgentFormProps{
    onSuccess?: () => void;
    onCancel?:() => void;
    initialValue?: AgentGetOne;
}

export const AgentForm =({
    onSuccess,
    onCancel,
    initialValue,
}:AgentFormProps) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const getManyQueryOptions = useMemo(
        () => trpc.agents.getMany.queryOptions({}),
        [trpc.agents.getMany]
    );

    const getOneQueryOptions = useMemo(
        () => initialValue?.id ? trpc.agents.getOne.queryOptions({ id: initialValue.id }) : null,
        [trpc.agents.getOne, initialValue?.id]
    );

    const handleSuccess = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: getManyQueryOptions.queryKey,
        });

        if(getOneQueryOptions){
            await queryClient.invalidateQueries({
                queryKey: getOneQueryOptions.queryKey,
            });
        }

        onSuccess?.();
    }, [queryClient, getManyQueryOptions.queryKey, getOneQueryOptions, onSuccess]);

    const createMutationOptions = useMemo(
        () => trpc.agents.create.mutationOptions({
            onSuccess: handleSuccess,
            onError: (error) => {
                toast.error(error.message);
            },
        }),
        [trpc.agents.create, handleSuccess]
    );

    const updateMutationOptions = useMemo(
        () => trpc.agents.update.mutationOptions({
            onSuccess: handleSuccess,
            onError: (error) => {
                toast.error(error.message);
            },
        }),
        [trpc.agents.update, handleSuccess]
    );

    const createAgent = useMutation(createMutationOptions);
    const updateAgent = useMutation(updateMutationOptions);

    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues:{
            name: initialValue?.name??"",
            instructions: initialValue?.instructions??"",
        },
    });

    const isEdit = !!initialValue?.id;
    const isPending = createAgent.isPending || updateAgent.isPending;

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit && initialValue?.id) {
            updateAgent.mutate({
                id: initialValue.id,
                ...values,
            });
        } else {
            createAgent.mutate(values);
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <GeneratedAvatar 
            seed={form.watch("name") || ""}
            variant="botttsNeutral"
            className="border size-16"
            />
            <FormField
            name="name"
            control = {form.control}
            render={({field}) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="e.g. Math tutor"/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            name="instructions"
            control = {form.control}
            render={({field}) => (
                <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="You are a helpful assistant"/>
                    </FormControl>
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
    )
}