"use client";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import SearchBar from "./SearchBar";
import ConversationList from "./ConversationList";
import UserSearchResults from "./UserSearchResults";
import CreateGroupChatModal from "./CreateGroupChatModal";
import { useSearchParams } from "next/navigation";

const UsersSection = () => {
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  return (
    <div className="flex flex-col h-full">
      {/* Header section */}
      <div className="p-4 bg-black w-full flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-white">Chats</h2>
        <PlusCircle
          className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors"
          onClick={() => setShowGroupModal(true)}
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-black shrink-0">
        <SearchBar loading={loading} setLoading={setLoading} />
      </div>

      {/* Conversations or Search Results */}
      <div className="flex-1 overflow-y-auto ">
        {searchQuery ? (
          <UserSearchResults searchQuery={searchQuery} />
        ) : (
          <ConversationList />
        )}
      </div>

      {/* Group Chat Modal */}
      <CreateGroupChatModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />
    </div>
  );
};

export default UsersSection;
