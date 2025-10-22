"use client"

import { Button } from "@/components/ui/button"
import { AuthClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { useState } from "react"
export default function Home() {

  const{ data: session}= AuthClient.useSession()
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () =>{ 
    AuthClient.signUp.email({
      email,
      name, 
      password
    }, {
      onError:()=>{
        window.alert("Something went wrong");
      },
      onSuccess:()=>{
        window.alert("Success");
      }
    });
  }
  const onLogin = () =>{ 
    AuthClient.signIn.email({
      email,
    
      password
    }, {
      onError:()=>{
        window.alert("Something went wrong");
      },
      onSuccess:()=>{
        window.alert("Success");
      }
    });
  }

  if(session){
    return(
      <div className="flex flex-col p-4 gap-y-4">
        <p>Logged in as {session.user.name}</p>
        <Button onClick={() => AuthClient.signOut()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return(
    <div className=" flex flex-col gap-y-10">
    <div className="p-4 flex flex-col gap-y-4">
      <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)}/>
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <Input placeholder="password" type= "password" value={password} onChange={(e) => setPassword(e.target.value)}/>

      <Button onClick={onSubmit} >
        Create User
      </Button>
    </div>

    <div className="p-4 flex flex-col gap-y-4">
     
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <Input placeholder="password" type= "password" value={password} onChange={(e) => setPassword(e.target.value)}/>

      <Button onClick={onLogin} >
        Login
      </Button>
    </div>
    </div>

    
  )
  
}
