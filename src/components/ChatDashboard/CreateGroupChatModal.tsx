"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserSync } from "@/hooks/useUserSync";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupChatModal({
  isOpen,
  onClose,
}: CreateGroupChatModalProps) {
  const { currentUser } = useUserSync();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const allUsers = useQuery(
    api.users.getAllUsers,
    currentUser ? { currentUserId: currentUser._id } : "skip",
  );

  const searchResults = useQuery(
    api.users.searchUsers,
    currentUser && searchTerm
      ? { searchTerm, currentUserId: currentUser._id }
      : "skip",
  );

  const createConversation = useMutation(
    api.conversations.createOrGetConversation,
  );
  const router = useRouter();

  const displayUsers = searchTerm ? searchResults : allUsers;

  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim() || selectedUsers.length < 2) {
      return;
    }

    try {
      const conversationId = await createConversation({
        participantIds: [currentUser._id, ...selectedUsers] as any,
        isGroup: true,
        name: groupName,
      });
      router.push(`/chat/${conversationId}`);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background dark:bg-accent-foreground rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create Group Chat</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Group Name */}
          <div>
            <label className="text-sm font-medium">Group Name</label>
            <Input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Search Members */}
          <div>
            <label className="text-sm font-medium">Add Members</label>
            <Input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Selected Count */}
          {selectedUsers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedUsers.length} member
              {selectedUsers.length !== 1 ? "s" : ""} selected
            </p>
          )}

          {/* User List */}
          <div className="space-y-2">
            {displayUsers && displayUsers.length > 0 ? (
              displayUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user._id)
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {selectedUsers.includes(user._id) && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">✓</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 2}
            className="flex-1"
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
}
