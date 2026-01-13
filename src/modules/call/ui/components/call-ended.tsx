import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CallEnded = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-y-4">
            <h1 className="text-2xl font-bold">Call Ended</h1>
            <p className="text-muted-foreground">You have left the meeting.</p>
            <Button asChild>
                <Link href="/">Back to Dashboard</Link>
            </Button>
        </div>
    );
};
