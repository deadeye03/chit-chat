"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserSync } from "@/hooks/useUserSync";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserSearchSkeleton } from "./SkeletonLoaders";
import EmptyUsersState from "./EmptyUsersState";

interface UserSearchResultsProps {
  searchQuery: string;
}

export default function UserSearchResults({
  searchQuery,
}: UserSearchResultsProps) {
  const { currentUser } = useUserSync();
  const searchResults = useQuery(
    api.users.searchUsers,
    currentUser?._id && searchQuery
      ? { searchTerm: searchQuery, currentUserId: currentUser._id }
      : "skip",
  );
  const createOrGetConversation = useMutation(
    api.conversations.createOrGetConversation,
  );
  const router = useRouter();

  console.log("current user is", currentUser);
  console.log("search results are", searchResults);

  if (!currentUser) {
    return (
      <div className="flex flex-col">
        {[1, 2, 3].map((i) => (
          <UserSearchSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!searchResults) {
    return (
      <div className="flex flex-col">
        {[1, 2, 3].map((i) => (
          <UserSearchSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (searchResults.length === 0) {
    return searchQuery ? (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm">No users found</p>
        <p className="text-xs mt-2">Try a different search term</p>
      </div>
    ) : (
      <EmptyUsersState />
    );
  }

  const handleUserClick = async (userId: string) => {
    try {
      await createOrGetConversation({
        participantIds: [currentUser._id, userId as any],
      });
      router.push(`/chat/${userId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground">
        SEARCH RESULTS
      </div>
      {searchResults.map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserClick(user._id)}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors border-b border-border"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Online indicator */}
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-sm">{user.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
