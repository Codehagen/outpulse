import { CheckCircle2, SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AgentBasicSettingsProps {
  name: string;
  energyLevel: number;
  voiceId: string;
  personalityTrait: string[];
  onNameChange: (value: string) => void;
  onEnergyLevelChange: (value: number) => void;
  onVoiceIdChange: (value: string) => void;
}

export function AgentBasicSettings({
  name,
  energyLevel,
  voiceId,
  personalityTrait,
  onNameChange,
  onEnergyLevelChange,
  onVoiceIdChange,
}: AgentBasicSettingsProps) {
  return (
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
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="energyLevel">Energy Level</Label>
                  <Badge variant="outline" className="font-normal">
                    {energyLevel}/10
                  </Badge>
                </div>
                <Slider
                  id="energyLevel"
                  min={1}
                  max={10}
                  step={1}
                  value={[energyLevel]}
                  onValueChange={(values) => onEnergyLevelChange(values[0])}
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
                <Select value={voiceId} onValueChange={onVoiceIdChange}>
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
                <Label htmlFor="personalityTraits">Personality Traits</Label>
                <div className="flex gap-2 flex-wrap p-2 border rounded-md min-h-[46px]">
                  {personalityTrait.length > 0 ? (
                    personalityTrait.map((trait, index) => (
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
            Advanced settings include API integrations, compliance settings, and
            more.
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
  );
}
