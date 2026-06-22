"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import PaginationButton from "../atoms/PaginationButton";

export default function Pagination({
  page,
  totalPages,
  setPage,
}) {
  return (
    <div className="flex items-center gap-2">

      <PaginationButton
        disabled={page === 1}
        onClick={() =>
          setPage(page - 1)
        }
      >
        <ChevronLeft size={16} />
      </PaginationButton>

      {Array.from(
        { length: totalPages },
        (_, i) => (
          <PaginationButton
            key={i}
            active={page === i + 1}
            onClick={() =>
              setPage(i + 1)
            }
          >
            {i + 1}
          </PaginationButton>
        )
      )}

      <PaginationButton
        disabled={page === totalPages}
        onClick={() =>
          setPage(page + 1)
        }
      >
        <ChevronRight size={16} />
      </PaginationButton>

    </div>
  );
}