"use client";

import { Users } from "lucide-react";

export default function EmptyUsersState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No Users Yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        To start chatting, you need other users in the system. Create another
        account or invite friends to join!
      </p>
      <div className="mt-6 p-4 bg-muted rounded-lg text-left max-w-xs">
        <p className="text-xs font-semibold mb-2">Quick Test Setup:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Open an incognito window</li>
          <li>Sign up with different email</li>
          <li>Search and start chatting!</li>
        </ol>
      </div>
    </div>
  );
}
