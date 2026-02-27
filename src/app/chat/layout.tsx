import React from "react";

function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen max-h-screen[calc(100vh-4rem)] pt-16">
      {children}
    </div>
  );
}

export default ChatLayout;
