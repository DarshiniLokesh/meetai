import { useEffect, useState } from "react";

/**
 * Hook to track call duration in real-time
 * Updates every second while the call is active
 * 
 * @param startedAt - The timestamp when the call started
 * @returns duration in seconds
 */
export function useCallDuration(startedAt: Date | null | undefined) {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!startedAt) {
            setDuration(0);
            return;
        }

        // Calculate initial duration
        const calculateDuration = () => {
            const now = new Date();
            const start = new Date(startedAt);
            const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
            return Math.max(0, diff); // Ensure non-negative
        };

        // Set initial duration
        setDuration(calculateDuration());

        // Update duration every second
        const interval = setInterval(() => {
            setDuration(calculateDuration());
        }, 1000);

        return () => clearInterval(interval);
    }, [startedAt]);

    return duration;
}

/**
 * Format duration in seconds to HH:MM:SS
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted string like "01:23:45"
 */
export function formatCallDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}
