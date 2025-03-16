"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiKeys } from "@/actions/user/get-api-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TestCallProps {
  agentId: string;
}

export function TestCall({ agentId }: TestCallProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState<boolean | null>(null);
  const [isCheckingApiKeys, setIsCheckingApiKeys] = useState(true);

  useEffect(() => {
    async function checkApiKeys() {
      try {
        setIsCheckingApiKeys(true);
        const result = await getApiKeys();

        // Check if user has configured all required Twilio API keys
        setHasApiKeys(
          result.success &&
            !!result.twilioAccountSid &&
            !!result.twilioAuthToken &&
            !!result.twilioPhoneNumber &&
            !!result.elevenLabsApiKey
        );
      } catch (error) {
        console.error("Failed to check API keys:", error);
        setHasApiKeys(false);
      } finally {
        setIsCheckingApiKeys(false);
      }
    }

    checkApiKeys();
  }, []);

  // Format phone number to ensure it has a plus sign
  const formatPhoneNumber = (number: string): string => {
    // Remove any non-digit characters
    const digits = number.replace(/\D/g, "");

    // If there's no plus sign at the start, add it
    if (!number.startsWith("+")) {
      return `+${digits}`;
    }

    return `+${digits}`;
  };

  const handleTestCall = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    setIsLoading(true);

    try {
      const response = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          agentId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Call initiated successfully");
      } else {
        toast.error(data.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Error initiating test call:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingApiKeys) {
    return <div className="text-center py-4">Checking API credentials...</div>;
  }

  if (hasApiKeys === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Missing API Credentials</AlertTitle>
        <AlertDescription>
          You need to configure your Twilio and ElevenLabs API credentials
          before making test calls.
          <div className="mt-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/settings/api">Configure API Settings</a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <Button onClick={handleTestCall} disabled={isLoading}>
          <Phone className="mr-2 h-4 w-4" />
          {isLoading ? "Calling..." : "Test Call"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter a phone number in E.164 format (e.g., +1234567890). The + will be
        added automatically if omitted.
      </p>
    </div>
  );
}
