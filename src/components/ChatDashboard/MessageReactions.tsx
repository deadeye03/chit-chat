"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";

interface MessageReactionsProps {
  messageId: Id<"messages">;
  reactions: Array<{ emoji: string; count: number; userIds: Array<string> }>;
  currentUserId: Id<"users">;
  isOwnMessage?: boolean;
}

const AVAILABLE_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export default function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  isOwnMessage = false,
}: MessageReactionsProps) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleReaction = async (emoji: string) => {
    try {
      await toggleReaction({
        messageId,
        userId: currentUserId,
        emoji,
      });
      setShowPicker(false);
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showPicker]);

  return (
    <div className="relative">
      {/* Existing reactions */}
      <div className="flex flex-wrap gap-1 items-center">
        {reactions.map((reaction) => {
          const userReacted = reaction.userIds.includes(
            currentUserId as string,
          );
          return (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                userReacted
                  ? "bg-primary/20 border border-primary"
                  : "bg-muted hover:bg-muted/80 border border-transparent"
              }`}
            >
              <span>{reaction.emoji}</span>
              <span className="text-[10px] font-medium">{reaction.count}</span>
            </button>
          );
        })}

        {/* Add reaction button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
        >
          <span className="text-xs">+</span>
        </button>
      </div>

      {/* Emoji picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className={`absolute bottom-full mb-2 bg-background border border-border rounded-lg shadow-lg p-2 flex gap-2 z-10 ${
            isOwnMessage ? "right-0" : "left-0"
          }`}
        >
          {AVAILABLE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
