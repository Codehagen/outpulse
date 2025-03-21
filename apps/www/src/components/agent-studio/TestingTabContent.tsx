import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  RefreshCw,
  Headphones,
  Mic,
  Volume2,
  Wand2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackgroundWave } from "./background-wave";
import { ConvAI } from "./ConvAI";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestingTabContentProps {
  agentVoiceId: string;
}

export function TestingTabContent({ agentVoiceId }: TestingTabContentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"test-call" | "history">(
    "test-call"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Add the background wave effect */}
      <div className="h-[80vh] relative overflow-hidden rounded-xl border bg-black/5">
        <div className="absolute inset-0 overflow-hidden">
          <BackgroundWave />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex flex-col h-full">
            {/* Simplified tab header to match the image */}
            <div className="border-b border-gray-200">
              <div className="flex w-full">
                <div className="flex w-full max-w-md">
                  <button
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-5 flex-1 text-sm font-medium border-b-2",
                      activeTab === "test-call"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground"
                    )}
                    onClick={() => setActiveTab("test-call")}
                  >
                    <Phone className="h-4 w-4" />
                    Test Call
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-5 flex-1 text-sm font-medium border-b-2",
                      activeTab === "history"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground"
                    )}
                    onClick={() => setActiveTab("history")}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Call History
                  </button>
                </div>
              </div>
            </div>

            {/* Test Call Tab Content */}
            {activeTab === "test-call" && (
              <div className="flex-1 p-6">
                <div className="flex h-full flex-col">
                  <div className="mb-8">
                    <Card className="bg-card/70 backdrop-blur-sm border-muted/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex gap-2 items-center">
                          <Phone className="h-5 w-5" />
                          Place a Test Call
                        </CardTitle>
                        <CardDescription>
                          Enter a phone number to test your agent with a real
                          call
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1">
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="bg-background/70"
                            />
                          </div>
                          <Button
                            className="gap-2"
                            disabled={!phoneNumber.trim()}
                          >
                            <Phone className="h-4 w-4" />
                            Call Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <ConvAI />
                  </div>

                  <div className="mt-auto">
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex gap-2 items-center">
                          <Headphones className="h-5 w-5" />
                          Testing Instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-lg bg-muted/30 p-3 flex gap-3 items-start">
                            <Mic className="h-5 w-5 text-primary mt-0.5" />
                            <div className="space-y-1 flex-1">
                              <p className="font-medium text-sm">
                                Speak naturally to your agent
                              </p>
                              <p className="text-xs text-muted-foreground">
                                This is a live test environment that simulates a
                                real phone call. Your microphone will be used to
                                talk to the agent.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-lg bg-muted/30 p-3 flex gap-3 items-start">
                            <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                            <div className="space-y-1 flex-1">
                              <p className="font-medium text-sm">
                                Agent responds with voice
                              </p>
                              <p className="text-xs text-muted-foreground">
                                The agent will respond with voice using the
                                selected voice profile and personality traits
                                you've configured.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-lg bg-muted/30 p-3 flex gap-3 items-start">
                            <Wand2 className="h-5 w-5 text-primary mt-0.5" />
                            <div className="space-y-1 flex-1">
                              <p className="font-medium text-sm">
                                Test your scenarios
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Try different conversation paths to see how your
                                agent handles various scenarios. End the call
                                when you're done testing.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Call History Tab Content */}
            {activeTab === "history" && (
              <div className="flex-1 p-6">
                <div className="flex h-full flex-col items-center justify-center">
                  <Card className="max-w-md w-full bg-card/50 backdrop-blur-sm border-muted/40">
                    <CardHeader>
                      <CardTitle>Call History</CardTitle>
                      <CardDescription>
                        View recordings and analytics of your test calls
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                      <RefreshCw className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                      <p className="text-muted-foreground text-center">
                        No test calls have been recorded yet
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Test calls will appear here once you start making them
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setActiveTab("test-call")}
                      >
                        <Phone className="h-4 w-4" />
                        Make a Test Call
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center">
        <Badge variant="outline" className="text-xs flex gap-1.5 items-center">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          Agent Voice: {agentVoiceId}
        </Badge>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Your agent uses the conversation flow you've designed and responds
          with natural language. Changes to your agent will be reflected in test
          calls after saving.
        </p>
      </div>
    </motion.div>
  );
}
