import { ApiKeysForm } from "@/components/settings/api-keys-form";

export default function ApiSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground">
          Configure your Twilio and ElevenLabs API credentials to enable voice
          calls.
        </p>
      </div>
      <ApiKeysForm />
    </div>
  );
}
