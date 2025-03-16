"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save } from "lucide-react";
import { updateApiKeys } from "@/actions/user/update-api-keys";
import { getApiKeys } from "@/actions/user/get-api-keys";

export function ApiKeysForm() {
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    async function loadApiKeys() {
      try {
        const result = await getApiKeys();
        if (result.success) {
          setTwilioAccountSid(result.twilioAccountSid || "");
          setTwilioAuthToken(result.twilioAuthToken || "");
          setTwilioPhoneNumber(result.twilioPhoneNumber || "");
          setElevenLabsApiKey(result.elevenLabsApiKey || "");
        }
      } catch (error) {
        console.error("Failed to load API keys:", error);
        toast.error("Failed to load API keys");
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadApiKeys();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateApiKeys({
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
        elevenLabsApiKey,
      });

      if (result.success) {
        toast.success("API settings saved successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <div>Loading API settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Twilio Configuration</CardTitle>
          <CardDescription>
            Connect your Twilio account to enable voice calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="twilioAccountSid">Account SID</Label>
            <Input
              id="twilioAccountSid"
              value={twilioAccountSid}
              onChange={(e) => setTwilioAccountSid(e.target.value)}
              placeholder="AC..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="twilioAuthToken">Auth Token</Label>
            <Input
              id="twilioAuthToken"
              type="password"
              value={twilioAuthToken}
              onChange={(e) => setTwilioAuthToken(e.target.value)}
              placeholder="Your Twilio auth token"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="twilioPhoneNumber">Phone Number</Label>
            <Input
              id="twilioPhoneNumber"
              value={twilioPhoneNumber}
              onChange={(e) => setTwilioPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ElevenLabs Configuration</CardTitle>
          <CardDescription>
            Connect your ElevenLabs account for AI voice generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="elevenLabsApiKey">API Key</Label>
            <Input
              id="elevenLabsApiKey"
              type="password"
              value={elevenLabsApiKey}
              onChange={(e) => setElevenLabsApiKey(e.target.value)}
              placeholder="Your ElevenLabs API key"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? (
          <>Saving...</>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
