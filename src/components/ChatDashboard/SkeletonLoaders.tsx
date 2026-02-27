export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border animate-pulse">
      <div className="w-12 h-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-12 bg-muted rounded-2xl w-3/4" />
      </div>
    </div>
  );
}

export function UserSearchSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border animate-pulse">
      <div className="w-12 h-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
