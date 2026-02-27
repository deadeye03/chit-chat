"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function useUserSync() {
  const { isLoaded, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);
  const updateOnlineStatus = useMutation(api.users.updateOnlineStatus);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip",
  );

  // Sync user on load
  useEffect(() => {
    if (isLoaded && isAuthenticated && user) {
      void syncUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.username || "Anonymous",
        imageUrl: user.imageUrl,
      });
    }
  }, [isLoaded, isAuthenticated, user, syncUser]);

  // Update online status
  useEffect(() => {
    if (currentUser?._id) {
      void updateOnlineStatus({
        userId: currentUser._id,
        isOnline: true,
      });

      // Set offline on unmount
      return () => {
        void updateOnlineStatus({
          userId: currentUser._id,
          isOnline: false,
        });
      };
    }
  }, [currentUser?._id, updateOnlineStatus]);

  // Update online status periodically (heartbeat)
  useEffect(() => {
    if (currentUser?._id) {
      const interval = setInterval(() => {
        void updateOnlineStatus({
          userId: currentUser._id,
          isOnline: true,
        });
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser?._id, updateOnlineStatus]);

  return { currentUser, isLoaded: isLoaded && !!currentUser };
}
