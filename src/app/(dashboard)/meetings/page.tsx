import { getQueryClient, trpc } from "@/trpc/server";
import { MeetingsView, MeetingsViewError, MeetingsViewLoading } from "../../../modules/meetings/ui/views/meetings-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const Page = async () =>{

    const session = await auth.api.getSession({
        headers: await headers()
      });
    
      if(!session){
        redirect("/sign-in")
      }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.meetings.getMany.queryOptions({})
    );
    return(
        <>
        <MeetingsListHeader/>
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<MeetingsViewLoading/>}>
            <ErrorBoundary  fallback ={<MeetingsViewError/>}>
                  <MeetingsView/>
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
        </>
    );
}

export default Page;