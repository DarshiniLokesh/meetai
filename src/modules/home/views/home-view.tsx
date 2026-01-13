"use client";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bot, Video, ArrowRight, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { MeetingGetMany } from "@/modules/meetings/types";
import type { AgentGetMany } from "@/modules/agents/types";
import { useQuery } from "@tanstack/react-query";

export const HomeView = () => {
    const trpc = useTRPC();

    const { data: meetings, isLoading: meetingsLoading } = useQuery(trpc.meetings.getMany.queryOptions({
        page: 1,
        pageSize: 3,
    }));

    const { data: agents, isLoading: agentsLoading } = useQuery(trpc.agents.getMany.queryOptions({
        page: 1,
        pageSize: 3,
    }));

    const totalMeetings = meetings?.total ?? 0;
    const totalAgents = agents?.total ?? 0;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8 md:p-12">
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <Badge variant="secondary" className="text-sm">AI-Powered Meetings</Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Welcome to MeetAI
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                        Transform your meetings with AI-powered agents that join your calls, take notes,
                        and provide intelligent summaries. Never miss important details again.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg">
                            <Link href="/meetings">
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Meeting
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/agents">
                                <Bot className="mr-2 h-4 w-4" />
                                Create Agent
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 -mb-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {meetingsLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{totalMeetings}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Scheduled and completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {agentsLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{totalAgents}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Active AI assistants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Meetings</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {meetingsLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{meetings?.items.length ?? 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            In the last 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">~{totalMeetings * 15}m</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            With automated notes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Meetings & Agents */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Meetings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Meetings</CardTitle>
                                <CardDescription>Your latest scheduled meetings</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/meetings">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {meetingsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : meetings?.items && meetings.items.length > 0 ? (
                            <div className="space-y-4">
                                {meetings.items.slice(0, 3).map((meeting: MeetingGetMany[number]) => (
                                    <Link
                                        key={meeting.id}
                                        href={`/meetings/${meeting.id}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors group"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                                                {meeting.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {meeting.startedAt ? formatDistanceToNow(new Date(meeting.startedAt), { addSuffix: true }) : 'Not started'}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            meeting.status === "completed" ? "default" :
                                                meeting.status === "upcoming" ? "secondary" :
                                                    meeting.status === "canclled" ? "destructive" : "outline"
                                        }>
                                            {meeting.status}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">No meetings yet</p>
                                <Button asChild size="sm">
                                    <Link href="/meetings">Schedule Your First Meeting</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Agents */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>AI Agents</CardTitle>
                                <CardDescription>Your intelligent meeting assistants</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/agents">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {agentsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : agents?.items && agents.items.length > 0 ? (
                            <div className="space-y-4">
                                {agents.items.slice(0, 3).map((agent: AgentGetMany[number]) => (
                                    <Link
                                        key={agent.id}
                                        href={`/agents/${agent.id}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors group"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Bot className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                                                {agent.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {agent.instructions.substring(0, 50)}...
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">No agents yet</p>
                                <Button asChild size="sm">
                                    <Link href="/agents">Create Your First Agent</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* About Section */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        How MeetAI Works
                    </CardTitle>
                    <CardDescription>
                        Supercharge your meetings with AI-powered intelligence
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Create AI Agents</h3>
                            <p className="text-sm text-muted-foreground">
                                Design custom AI assistants with specific instructions tailored to your meeting needs.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Video className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Schedule Meetings</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up meetings and assign AI agents to automatically join and assist during your calls.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Get Insights</h3>
                            <p className="text-sm text-muted-foreground">
                                Receive automated summaries, action items, and key insights from every meeting.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
