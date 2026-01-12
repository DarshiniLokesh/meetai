"use client"

import Link from "next/link";
import { Calendar, Users, Sparkles, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const HomeView = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Meet.AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered meetings with intelligent agents, real-time transcription, and automated summaries
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/meetings">
            <Button size="lg" className="gap-2">
              <Calendar className="size-5" />
              View Meetings
            </Button>
          </Link>
          <Link href="/agents">
            <Button size="lg" variant="outline" className="gap-2">
              <Users className="size-5" />
              Manage Agents
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Sparkles className="size-6 text-blue-600" />
              </div>
              <CardTitle>AI Agents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Create custom AI agents with specific instructions and personalities for different meeting types
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MessageSquare className="size-6 text-green-600" />
              </div>
              <CardTitle>Real-time Voice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Agents join calls as participants, listen, and respond with natural voice in real-time
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="size-6 text-purple-600" />
              </div>
              <CardTitle>Auto Transcription</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Automatic transcription of all meetings with speaker identification and timestamps
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="size-6 text-orange-600" />
              </div>
              <CardTitle>AI Summaries</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Gemini-powered summaries highlighting key points, decisions, and action items
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Calendar className="size-6 text-pink-600" />
              </div>
              <CardTitle>Meeting History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Track meeting duration, view summaries, and access recordings all in one place
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Users className="size-6 text-cyan-600" />
              </div>
              <CardTitle>Multi-Agent Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Create unlimited agents for different purposes: tutors, assistants, coaches, and more
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Quick Start</CardTitle>
          <CardDescription className="text-base">
            Get started with Meet.AI in three simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-blue-600 text-white font-bold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create an Agent</h3>
              <p className="text-muted-foreground">
                Go to Agents page and create your first AI agent with custom instructions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-purple-600 text-white font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg">Schedule a Meeting</h3>
              <p className="text-muted-foreground">
                Create a new meeting and select which agent should join
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-8 rounded-full bg-pink-600 text-white font-bold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg">Join & Interact</h3>
              <p className="text-muted-foreground">
                Join the call and interact with your AI agent in real-time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
