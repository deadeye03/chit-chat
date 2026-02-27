import { Skeleton } from "./skeleton";

export function UserSectionSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Skeleton */}
      <div className="p-4 bg-black w-full flex justify-between items-center shrink-0">
        <Skeleton className="h-8 w-24 bg-gray-700" />
        <Skeleton className="h-6 w-6 rounded-full bg-gray-700" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-4 bg-black shrink-0">
        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
      </div>

      {/* Conversations List Skeleton */}
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 border-b border-border"
          >
            {/* Avatar Skeleton */}
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border">
      {/* Avatar Skeleton */}
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />

      {/* Content Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-full max-w-50" />
      </div>
    </div>
  );
}

export function UserSearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-accent transition-colors border-b border-border">
      {/* Avatar Skeleton */}
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />

      {/* Content Skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      {/* Avatar */}
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />

      {/* Message bubble */}
      <div className="flex flex-col space-y-2 max-w-[70%]">
        <Skeleton className="h-16 w-64 rounded-2xl" />
      </div>
    </div>
  );
}
