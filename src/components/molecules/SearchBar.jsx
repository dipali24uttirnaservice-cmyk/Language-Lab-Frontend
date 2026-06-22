"use client";

import SearchInput from "../atoms/SearchInput";

export default function SearchBar({
  value,
  onChange,
}) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search students..."
    />
  );
}