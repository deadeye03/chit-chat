"use client";

import { Id } from "../../../convex/_generated/dataModel";

interface TypingIndicatorProps {
  typingUsers: Array<{
    _id: Id<"users">;
    _creationTime: number;
    name: string;
    email: string;
    clerkId: string;
    imageUrl?: string;
    isOnline: boolean;
    lastSeen: number;
  }>;
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const typingText =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing...`
      : typingUsers.length === 2
        ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
        : `${typingUsers.length} people are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <span>{typingText}</span>
      <div className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
          •
        </span>
      </div>
    </div>
  );
}
