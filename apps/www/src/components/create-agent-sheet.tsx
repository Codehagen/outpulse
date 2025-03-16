"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CreateAgentInput, createAgent } from "@/actions/agents/create-agent";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  template: z.enum(["blank", "support", "math", "video_game"]),
});

type TemplateType = "blank" | "support" | "math" | "video_game";

// Template configurations
const templates: Record<
  TemplateType,
  {
    title: string;
    icon: React.ReactNode;
    description: string;
    agentData: Omit<CreateAgentInput, "name"> & { description?: string };
  }
> = {
  blank: {
    title: "Blank template",
    icon: <div className="text-2xl">🧩</div>,
    description:
      "Start with a blank template and customize your agent to suit your needs.",
    agentData: {
      description: "",
      voiceId: "alloy",
      personalityTrait: ["Professional"],
      energyLevel: 5,
      speakingStyle: "Conversational",
      language: "en",
      additionalLanguages: [],
    },
  },
  support: {
    title: "Support agent",
    icon: <div className="text-2xl">👨‍💼</div>,
    description:
      "Talk to Eric, a dedicated support agent who is always ready to resolve any issues.",
    agentData: {
      description: "A helpful customer support agent",
      voiceId: "shimmer",
      personalityTrait: ["Helpful", "Professional", "Patient"],
      energyLevel: 6,
      speakingStyle: "Supportive",
      language: "en",
      additionalLanguages: [],
    },
  },
  math: {
    title: "Math tutor",
    icon: <div className="text-2xl">🧮</div>,
    description:
      "Speak with Matilda, a mathematics tutor who can help you with your studies.",
    agentData: {
      description: "A knowledgeable math tutor",
      voiceId: "nova",
      personalityTrait: ["Educational", "Patient", "Encouraging"],
      energyLevel: 5,
      speakingStyle: "Educational",
      language: "en",
      additionalLanguages: [],
    },
  },
  video_game: {
    title: "Video game character",
    icon: <div className="text-2xl">🧙‍♂️</div>,
    description:
      "Speak with a mysterious wizard who offers ancient wisdom to aid you on your journey.",
    agentData: {
      description: "A wise and mysterious video game character",
      voiceId: "echo",
      personalityTrait: ["Mysterious", "Wise", "Enigmatic"],
      energyLevel: 7,
      speakingStyle: "Theatrical",
      language: "en",
      additionalLanguages: [],
    },
  },
};

export function CreateAgentSheet() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      template: "blank",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedTemplate) return;

    setIsSubmitting(true);

    try {
      const template = templates[values.template];
      const agentData: CreateAgentInput = {
        name: values.name,
        voiceId: template.agentData.voiceId || "alloy",
        personalityTrait: template.agentData.personalityTrait || [
          "Professional",
        ],
        energyLevel: template.agentData.energyLevel || 5,
        description: template.agentData.description,
        speakingStyle: template.agentData.speakingStyle,
        language: template.agentData.language || "en",
        additionalLanguages: template.agentData.additionalLanguages || [],
      };

      const result = await createAgent(agentData);

      if (result.success && result.agentId) {
        setIsOpen(false);
        router.push(`/pulse/studio/${result.agentId}`);
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectTemplate = (template: TemplateType) => {
    setSelectedTemplate(template);
    form.setValue("template", template);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create an AI agent</SheetTitle>
          <SheetDescription>
            Give your new agent a name and choose a template to get started
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent name</FormLabel>
                  <FormControl>
                    <Input placeholder="Customer support agent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="text-sm font-medium">Choose a template</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(templates).map(([key, template]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === key
                        ? "border-primary ring-2 ring-primary"
                        : "hover:border-input hover:shadow-md"
                    }`}
                    onClick={() => selectTemplate(key as TemplateType)}
                  >
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {template.icon}
                        <div className="font-medium">{template.title}</div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !selectedTemplate}
              className="w-full"
            >
              {isSubmitting ? "Creating agent..." : "Create agent"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
