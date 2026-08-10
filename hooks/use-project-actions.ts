"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/generated/prisma";

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function useProjectActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createProject = async (name: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to create project");
        return false;
      }
      
      // Navigate to the new workspace
      const slug = generateSlug(data.name || name);
      router.push(`/editor/${data.id}-${slug}`);
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const renameProject = async (id: string, newName: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to rename project");
        return false;
      }
      
      router.refresh();
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async (id: string, isActiveWorkspace: boolean = false): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete project");
        return false;
      }
      
      if (isActiveWorkspace) {
        router.push("/editor");
      } else {
        router.refresh();
      }
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    setError, // allow manual clearing of errors
    createProject,
    renameProject,
    deleteProject,
  };
}
