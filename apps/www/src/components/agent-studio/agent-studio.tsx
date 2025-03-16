"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import ConversationFlowDesigner from "./conversation-flow-designer";

export default function AgentStudio() {
  const [agent, setAgent] = useState({
    name: "Call Flow Designer",
    description: "Create and manage conversation flows for AI calling agents",
    language: "en",
    additionalLanguages: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [testJson, setTestJson] = useState("");
  const [businessName, setBusinessName] = useState("OurBusinessName");
  const [prospectName, setProspectName] = useState("ProspectBusinessName");
  const [agentName, setAgentName] = useState("Johannes");
  const [phoneNumber, setPhoneNumber] = useState("+1234567890");

  // Tool configuration state
  const [toolConfig, setToolConfig] = useState({
    toolType: "webhook",
    name: "sendDiscordNotification",
    description:
      "Use this tool to send important call information to the Discord channel. Use when call details need to be shared with the team, like when a customer expresses interest or provides contact information.",
    method: "POST",
    url: "http://localhost:3000/api/discord-webhook",
    headers: [],
    pathParams: [],
    queryParams: [],
    bodyParams: [
      {
        disable: false,
        identifier: "message",
        dataType: "string",
        required: true,
        valueType: "LLM Prompt",
        description:
          "Extract the most important information from the conversation to send as a notification. Include customer preferences, contact details, or expressions of interest. Format it as a concise summary that would be useful for a sales team.",
      },
    ],
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  // Function to handle JSON output from the ConversationFlowDesigner
  const handleJsonOutput = (json: string) => {
    setTestJson(json);
  };

  // Update values in the test JSON when fields change
  useEffect(() => {
    // This would typically make an API call to regenerate the JSON
    // Here we're just ensuring the values are in sync with the parent component
    if (testJson) {
      try {
        const jsonObj = JSON.parse(testJson);
        if (jsonObj && typeof jsonObj === "object") {
          // We could modify the JSON here if needed
        }
      } catch (e) {
        console.error("Invalid JSON:", e);
      }
    }
  }, [businessName, prospectName, agentName, phoneNumber]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">{agent.description}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Flow"}
        </Button>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="flow">Conversation Flow</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="flow">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Flow Designer</CardTitle>
              <CardDescription>
                Design your agent's conversation flow with a visual editor
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ConversationFlowDesigner onJsonOutput={handleJsonOutput} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Configure language settings and view the generated prompt JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Language settings */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Agent Language</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the default language the agent will communicate in.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-4 bg-blue-900 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="absolute w-full h-0.5 bg-white rotate-90"></div>
                        </div>
                      </div>
                      <span>English</span>
                    </div>

                    <Select
                      value={agent.language}
                      onValueChange={(value) =>
                        setAgent({ ...agent, language: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mt-6">
                      Additional Languages
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Specify additional languages that the caller will be able
                      to choose from. Currently, the language needs to be
                      specified upfront and cannot be detected automatically
                      mid-conversation.
                    </p>

                    <Button variant="outline" className="mt-4">
                      Add additional languages
                    </Button>
                  </div>
                </div>

                {/* JSON Output */}
                <div className="space-y-4 mt-8">
                  <div>
                    <h3 className="text-lg font-medium">Generated JSON</h3>
                    <p className="text-sm text-muted-foreground">
                      This JSON can be used with your API to set up the
                      conversation.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Your Business Name</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
                          // We'll rely on the useEffect to update JSON output
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prospect-name">
                        Prospect Business Name
                      </Label>
                      <Input
                        id="prospect-name"
                        value={prospectName}
                        onChange={(e) => {
                          setProspectName(e.target.value);
                          // We'll rely on the useEffect to update JSON output
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agent-name">Agent Name</Label>
                      <Input
                        id="agent-name"
                        value={agentName}
                        onChange={(e) => {
                          setAgentName(e.target.value);
                          // We'll rely on the useEffect to update JSON output
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <Input
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          // We'll rely on the useEffect to update JSON output
                        }}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[40vh]">
                      {testJson}
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(testJson)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Tools Configuration</CardTitle>
              <CardDescription>
                Configure tools that your agent can use during calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Edit tool</h3>
                  <div className="grid gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="tool-type">Tool type</Label>
                      <Select
                        value={toolConfig.toolType}
                        onValueChange={(value) =>
                          setToolConfig({ ...toolConfig, toolType: value })
                        }
                      >
                        <SelectTrigger id="tool-type">
                          <SelectValue placeholder="Select a tool type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webhook">Webhook</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        A webhook tool allows the agent to extract specific
                        information from the call and send it to your server.
                      </p>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-base font-medium mb-2">
                        Configuration
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Describe to the LLM how and when to use the tool.
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tool-name">Name</Label>
                          <Input
                            id="tool-name"
                            value={toolConfig.name}
                            onChange={(e) =>
                              setToolConfig({
                                ...toolConfig,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tool-description">Description</Label>
                          <Textarea
                            id="tool-description"
                            value={toolConfig.description}
                            onChange={(e) =>
                              setToolConfig({
                                ...toolConfig,
                                description: e.target.value,
                              })
                            }
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="method">Method</Label>
                          <Select
                            value={toolConfig.method}
                            onValueChange={(value) =>
                              setToolConfig({ ...toolConfig, method: value })
                            }
                          >
                            <SelectTrigger id="method">
                              <SelectValue placeholder="Select HTTP method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="url">URL</Label>
                          <Input
                            id="url"
                            value={toolConfig.url}
                            onChange={(e) =>
                              setToolConfig({
                                ...toolConfig,
                                url: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Headers</Label>
                            <Button variant="outline" size="sm">
                              Add header
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Define headers that will be sent with the request
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Body parameters</Label>
                          {toolConfig.bodyParams.map((param, index) => (
                            <div
                              key={index}
                              className="border rounded-md p-4 space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={!param.disable}
                                    onCheckedChange={(checked) => {
                                      const newParams = [
                                        ...toolConfig.bodyParams,
                                      ];
                                      newParams[index].disable = !checked;
                                      setToolConfig({
                                        ...toolConfig,
                                        bodyParams: newParams,
                                      });
                                    }}
                                  />
                                  <Label>Enable</Label>
                                </div>
                                <Button variant="ghost" size="sm">
                                  Delete
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`param-${index}-identifier`}>
                                  Identifier
                                </Label>
                                <Input
                                  id={`param-${index}-identifier`}
                                  value={param.identifier}
                                  onChange={(e) => {
                                    const newParams = [
                                      ...toolConfig.bodyParams,
                                    ];
                                    newParams[index].identifier =
                                      e.target.value;
                                    setToolConfig({
                                      ...toolConfig,
                                      bodyParams: newParams,
                                    });
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`param-${index}-dataType`}>
                                    Data type
                                  </Label>
                                  <Select
                                    value={param.dataType}
                                    onValueChange={(value) => {
                                      const newParams = [
                                        ...toolConfig.bodyParams,
                                      ];
                                      newParams[index].dataType = value;
                                      setToolConfig({
                                        ...toolConfig,
                                        bodyParams: newParams,
                                      });
                                    }}
                                  >
                                    <SelectTrigger
                                      id={`param-${index}-dataType`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">
                                        String
                                      </SelectItem>
                                      <SelectItem value="number">
                                        Number
                                      </SelectItem>
                                      <SelectItem value="boolean">
                                        Boolean
                                      </SelectItem>
                                      <SelectItem value="object">
                                        Object
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`param-${index}-valueType`}>
                                    Value Type
                                  </Label>
                                  <Select
                                    value={param.valueType}
                                    onValueChange={(value) => {
                                      const newParams = [
                                        ...toolConfig.bodyParams,
                                      ];
                                      newParams[index].valueType = value;
                                      setToolConfig({
                                        ...toolConfig,
                                        bodyParams: newParams,
                                      });
                                    }}
                                  >
                                    <SelectTrigger
                                      id={`param-${index}-valueType`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="LLM Prompt">
                                        LLM Prompt
                                      </SelectItem>
                                      <SelectItem value="Static">
                                        Static
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`param-${index}-description`}>
                                  Description
                                </Label>
                                <Textarea
                                  id={`param-${index}-description`}
                                  value={param.description}
                                  onChange={(e) => {
                                    const newParams = [
                                      ...toolConfig.bodyParams,
                                    ];
                                    newParams[index].description =
                                      e.target.value;
                                    setToolConfig({
                                      ...toolConfig,
                                      bodyParams: newParams,
                                    });
                                  }}
                                  className="min-h-[100px]"
                                />
                                <p className="text-sm text-muted-foreground">
                                  This field will be passed to the LLM and
                                  should describe in detail how to extract the
                                  data from the transcript.
                                </p>
                              </div>
                            </div>
                          ))}

                          <Button variant="outline" className="w-full mt-2">
                            Add property
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
