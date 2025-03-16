"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus } from "lucide-react";
import { languages } from "@/lib/languages";

interface MultiLanguageSelectorProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  excludeLanguage?: string;
  disabled?: boolean;
}

export function MultiLanguageSelector({
  values,
  onValuesChange,
  excludeLanguage,
  disabled = false,
}: MultiLanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  const removeLanguage = (langCode: string) => {
    onValuesChange(values.filter((code) => code !== langCode));
  };

  const addLanguage = (langCode: string) => {
    if (!values.includes(langCode)) {
      onValuesChange([...values, langCode]);
    }
    setOpen(false);
  };

  // Filter out already selected languages and excluded language
  const availableLanguages = languages.filter(
    (lang) => !values.includes(lang.code) && lang.code !== excludeLanguage
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {values.length > 0 ? (
          values.map((langCode) => {
            const language = languages.find((l) => l.code === langCode);
            return (
              <Badge key={langCode} variant="secondary" className="gap-1">
                <span className="mr-1">{language?.flag}</span>
                {language?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => removeLanguage(langCode)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            No additional languages selected
          </p>
        )}
      </div>

      {availableLanguages.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 gap-1 w-fit h-8"
              disabled={disabled}
            >
              <Plus className="h-3.5 w-3.5" />
              Add language
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search language..." />
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {availableLanguages.map((language) => (
                    <CommandItem
                      key={language.code}
                      value={language.code}
                      onSelect={addLanguage}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{language.flag}</span>
                        <span>{language.name}</span>
                        {language.native &&
                          language.native !== language.name && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {language.native}
                            </span>
                          )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
