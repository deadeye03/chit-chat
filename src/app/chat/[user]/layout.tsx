import UsersSection from "@/components/ChatDashboard/UsersSection";
import { UserSectionSkeleton } from "@/components/ui/UserSectionSkeleton";
import { ReactNode, Suspense } from "react";

function UserChatLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full flex h-full items-start bg-linear-to-br from-blue-50 via-background to-purple-50 dark:from-neutral-900 dark:via-background dark:to-neutral-800">
      <div className="w-full h-full mx-auto flex flex-col md:flex-row min-h-screen[calc(100vh-64px)]">
        {/* Users Section */}
        <div className="w-full h-full md:w-1/3 lg:w-1/4 bg-black p-2 hidden md:block">
          <Suspense fallback={<UserSectionSkeleton />}>
            <UsersSection />
          </Suspense>
        </div>
        {children}
      </div>
    </main>
  );
}

export default UserChatLayout;
