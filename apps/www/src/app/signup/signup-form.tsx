"use client";

import { useState } from "react";

import { signUp } from "../../../utils/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password);

      if (result.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Account created successfully!");
        // Redirect directly to dashboard since we're not doing email confirmation
        router.push("/pulse");
      }
    } catch (error) {
      toast.error("An error occurred during signup");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return <div>{/* Render your form here */}</div>;
}
