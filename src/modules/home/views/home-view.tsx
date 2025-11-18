"use client"

import { AuthClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const HomeView= () => {

  const {data:session} = AuthClient.useSession();
  const router = useRouter()

  if(!session){
    return (
      <p>Loading...</p>
    )
  }

  return(
    <div className="flex flex-col p-4 gay-y-4">
      <p>Logged in as {session.user.name}</p>
      <Button onClick={() => AuthClient.signOut({
        fetchOptions:{
            onSuccess: () => router.push("/sign-in")
        }
        })
        }>
        Sign Out
      </Button>
     
    </div>
  );
}


