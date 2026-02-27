import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-background to-purple-50 dark:from-neutral-900 dark:via-background dark:to-neutral-800">
      <SignUp />
    </div>
  );
}
