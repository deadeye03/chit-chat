"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { Input } from "../ui/input";
import { Loader2Icon, Search } from "lucide-react";

const SearchBar = ({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const params = useSearchParams();
  const searchUser = params.get("search") || "";
  const [search, setSearch] = useState(searchUser);
  const router = useRouter();
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setSearch(e.target.value);
    setTimeout(() => {
      router.push(`/chat?search=${e.target.value}`);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="w-full relative">
      <Input
        type="text"
        placeholder="Search or start a new chat"
        value={search}
        onChange={handleSearch}
        className=""
      />
      <div className="absolute transform -translate-y-1/2 top-1/2 right-3">
        {loading ? (
          <Loader2Icon className="animate-spin w-5 h-5 text-blue-500" />
        ) : (
          <Search className="w-5 h-5 text-gray-500" />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
