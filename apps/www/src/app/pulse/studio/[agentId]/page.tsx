"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Play,
  Phone,
  Settings as SettingsIcon,
  ChevronDown,
  HelpCircle,
  Headphones,
  Mic,
  Volume2,
  RefreshCw,
  Wand2,
  CornerDownLeft,
  BookOpen,
  Code,
  CheckCircle2,
  UserCircle,
  Server,
} from "lucide-react";
import ConversationFlowDesigner from "@/components/agent-studio/conversation-flow-designer";
import { getAgent } from "@/actions/agents/get-agent";
import { updateAgent } from "@/actions/agents/update-agent";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelector } from "@/components/ui/language-selector";
import { MultiLanguageSelector } from "@/components/ui/multi-language-selector";
import { TestCall } from "@/components/agent-studio/test-call";
import { BackgroundWave } from "@/components/agent-studio/background-wave";
import { ConvAI } from "@/components/agent-studio/ConvAI";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  voiceId: string;
  personalityTrait: string[];
  energyLevel: number;
  speakingStyle?: string | null;
  updatedAt: string | Date;
  language?: string;
  additionalLanguages?: string[];
}

export default function AgentDetail() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const [activeTab, setActiveTab] = useState("agent");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    async function loadAgent() {
      try {
        setIsLoading(true);
        const agentData = await getAgent(agentId);
        setAgent(agentData);
        setError(null);
        setIsDirty(false);
      } catch (err) {
        console.error("Failed to load agent:", err);
        setError("Failed to load agent data");
        setAgent(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadAgent();
  }, [agentId]);

  const updateAgentField = (
    field: keyof Agent,
    value: string | number | string[]
  ) => {
    if (!agent) return;
    setAgent({ ...agent, [field]: value });
    setIsDirty(true);
  };

  const handleSaveChanges = async () => {
    if (!agent) return;

    setIsSaving(true);
    try {
      const result = await updateAgent({
        id: agent.id,
        name: agent.name,
        description: agent.description || undefined,
        voiceId: agent.voiceId,
        personalityTrait: agent.personalityTrait,
        energyLevel: agent.energyLevel,
        speakingStyle: agent.speakingStyle || undefined,
        language: agent.language || "en",
        additionalLanguages: agent.additionalLanguages || [],
      });

      if (result.success) {
        toast.success("Agent updated successfully");
        setIsDirty(false);
      } else {
        toast.error(result.error || "Failed to update agent");
      }
    } catch (err) {
      console.error("Failed to update agent:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container max-w-screen-2xl space-y-6 px-4 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <Skeleton className="h-10 w-full max-w-md rounded-lg" />

        <div className="h-[750px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (!agent || error) {
    return (
      <div className="container flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="bg-muted mb-4 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
            <UserCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            The agent you are looking for does not exist or you don't have
            permission to view it.
          </p>
          <Link href="/pulse/studio">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Agent Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl space-y-6 px-4 py-6">
      {/* Header Section */}
      <div className="space-y-2">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/pulse">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/pulse/studio">Agent Studio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{agent.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Link href="/pulse/studio">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-muted-foreground">
              {agent.description ? (
                <span className="line-clamp-1">{agent.description}</span>
              ) : (
                "No description provided"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden md:flex gap-1 items-center font-normal"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Last edited {new Date(agent.updatedAt).toLocaleDateString()}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving || !isDirty}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isDirty ? "Save Changes" : "Saved"}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {!isDirty && (
                  <TooltipContent>
                    <p>All changes are saved</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        defaultValue="agent"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger
                value="agent"
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <UserCircle className="h-4 w-4" />
                Agent Settings
              </TabsTrigger>
              <TabsTrigger
                value="flow"
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Code className="h-4 w-4" />
                Conversation Flow
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Phone className="h-4 w-4" />
                Test & Preview
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Flow Tab */}
        <TabsContent value="flow" className="m-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-[750px]"
          >
            <div className="h-full rounded-lg border bg-card overflow-hidden">
              <ConversationFlowDesigner agentId={agentId} />
            </div>
          </motion.div>
        </TabsContent>

        {/* Agent Settings Tab */}
        <TabsContent value="agent" className="m-0 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Language Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agent Language Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Agent Language
                  </CardTitle>
                  <CardDescription>
                    Choose the default language the agent will communicate in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LanguageSelector
                    value={agent.language || "en"}
                    onValueChange={(lang) => updateAgentField("language", lang)}
                  />
                </CardContent>
              </Card>

              {/* Additional Languages */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-4 w-4" /> Additional Languages
                  </CardTitle>
                  <CardDescription>
                    Specify additional languages that the caller will be able to
                    choose from.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MultiLanguageSelector
                    values={agent.additionalLanguages || []}
                    onValuesChange={(langs) =>
                      updateAgentField("additionalLanguages", langs)
                    }
                    excludeLanguage={agent.language}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Messages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Message */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CornerDownLeft className="h-4 w-4" /> First Message
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            This is the first message your agent will say when
                            answering a call. It sets the tone for the
                            conversation.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>
                    The first message the agent will say. If empty, the agent
                    will wait for the user to start the conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Hello, this is [Agent Name]. How can I help you today?"
                    className="min-h-[120px] resize-y"
                    value={agent.speakingStyle || ""}
                    onChange={(e) =>
                      updateAgentField("speakingStyle", e.target.value)
                    }
                  />
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-4 w-4" /> System Prompt
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The system prompt determines your agent's persona
                            and provides context for the conversation.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>
                    The system prompt is used to determine the persona of the
                    agent and the context of the conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="You are a helpful assistant..."
                    className="min-h-[120px] resize-y"
                    value={agent.description || ""}
                    onChange={(e) =>
                      updateAgentField("description", e.target.value)
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Basic Settings & Advanced Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Agent Settings */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Basic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Agent Name</Label>
                        <Input
                          id="name"
                          value={agent.name}
                          onChange={(e) =>
                            updateAgentField("name", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="energyLevel">Energy Level</Label>
                          <Badge variant="outline" className="font-normal">
                            {agent.energyLevel}/10
                          </Badge>
                        </div>
                        <Slider
                          id="energyLevel"
                          min={1}
                          max={10}
                          step={1}
                          value={[agent.energyLevel]}
                          onValueChange={(values) =>
                            updateAgentField("energyLevel", values[0])
                          }
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Calm</span>
                          <span>Energetic</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="voiceType">Voice Type</Label>
                        <Select
                          value={agent.voiceId}
                          onValueChange={(value) =>
                            updateAgentField("voiceId", value)
                          }
                        >
                          <SelectTrigger id="voiceType">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alloy">Alloy</SelectItem>
                            <SelectItem value="echo">Echo</SelectItem>
                            <SelectItem value="fable">Fable</SelectItem>
                            <SelectItem value="nova">Nova</SelectItem>
                            <SelectItem value="shimmer">Shimmer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="personalityTraits">
                          Personality Traits
                        </Label>
                        <div className="flex gap-2 flex-wrap p-2 border rounded-md min-h-[46px]">
                          {agent.personalityTrait.length > 0 ? (
                            agent.personalityTrait.map((trait, index) => (
                              <Badge key={index} variant="secondary">
                                {trait}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No personality traits defined
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings Panel */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" /> Advanced
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Advanced settings include API integrations, compliance
                    settings, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                  <Button variant="outline" className="w-full gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Configure Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="m-0">
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
                <Tabs defaultValue="test-call" className="flex flex-col h-full">
                  <div className="border-b bg-background/80 backdrop-blur-sm">
                    <div className="container flex h-14 items-center px-4">
                      <div className="flex flex-1 items-center justify-between">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                          <TabsTrigger value="test-call" className="gap-2">
                            <Phone className="h-4 w-4" />
                            Test Call
                          </TabsTrigger>
                          <TabsTrigger value="history" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Call History
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </div>
                  </div>

                  <TabsContent value="test-call" className="flex-1 p-6">
                    <div className="flex h-full flex-col">
                      <div className="mb-8">
                        <Card className="bg-card/70 backdrop-blur-sm border-muted/40">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex gap-2 items-center">
                              <Phone className="h-5 w-5" />
                              Place a Test Call
                            </CardTitle>
                            <CardDescription>
                              Enter a phone number to test your agent with a
                              real call
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-3 items-center">
                              <div className="flex-1">
                                <Input
                                  type="tel"
                                  placeholder="+1 (555) 123-4567"
                                  value={phoneNumber}
                                  onChange={(e) =>
                                    setPhoneNumber(e.target.value)
                                  }
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
                                    This is a live test environment that
                                    simulates a real phone call. Your microphone
                                    will be used to talk to the agent.
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
                                    selected voice profile and personality
                                    traits you've configured.
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
                                    Try different conversation paths to see how
                                    your agent handles various scenarios. End
                                    the call when you're done testing.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="flex-1 p-6">
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
                            Test calls will appear here once you start making
                            them
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => {
                              const element = document.querySelector(
                                '[value="test-call"]'
                              );
                              if (element instanceof HTMLElement) {
                                element.click();
                              }
                            }}
                          >
                            <Phone className="h-4 w-4" />
                            Make a Test Call
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center justify-center">
              <Badge
                variant="outline"
                className="text-xs flex gap-1.5 items-center"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Agent Voice: {agent.voiceId}
              </Badge>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Your agent uses the conversation flow you've designed and
                responds with natural language. Changes to your agent will be
                reflected in test calls after saving.
              </p>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
