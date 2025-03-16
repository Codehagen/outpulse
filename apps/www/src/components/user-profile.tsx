"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateProfile } from "@/actions/users/update-profile";
import { signOut } from "@/actions/users/sign-out";

interface UserProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isAdmin: boolean;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [isLoading, setIsLoading] = useState(false);

  // Get initials for avatar fallback
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || user.email[0].toUpperCase();

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const result = await updateProfile({
        name,
        image: imageUrl || null,
      });

      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || ""} alt={user.name || user.email} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            {!isEditing ? (
              <div className="space-y-1">
                <h3 className="text-xl font-medium">
                  {user.name || "Anonymous User"}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Administrator
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <Input
                    id="image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-x-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                Edit Profile
              </Button>
              <Button variant="destructive" onClick={handleSignOut} size="sm">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                size="sm"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
