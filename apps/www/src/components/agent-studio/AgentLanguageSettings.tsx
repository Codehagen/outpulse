import { BookOpen, Server } from "lucide-react";
import { LanguageSelector } from "@/components/ui/language-selector";
import { MultiLanguageSelector } from "@/components/ui/multi-language-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AgentLanguageSettingsProps {
  language: string;
  additionalLanguages: string[];
  onLanguageChange: (value: string) => void;
  onAdditionalLanguagesChange: (values: string[]) => void;
}

export function AgentLanguageSettings({
  language,
  additionalLanguages,
  onLanguageChange,
  onAdditionalLanguagesChange,
}: AgentLanguageSettingsProps) {
  return (
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
          <LanguageSelector value={language} onValueChange={onLanguageChange} />
        </CardContent>
      </Card>

      {/* Additional Languages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-4 w-4" /> Additional Languages
          </CardTitle>
          <CardDescription>
            Specify additional languages that the caller will be able to choose
            from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiLanguageSelector
            values={additionalLanguages}
            onValuesChange={onAdditionalLanguagesChange}
            excludeLanguage={language}
          />
        </CardContent>
      </Card>
    </div>
  );
}
