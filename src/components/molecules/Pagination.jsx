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

  const pagesPerGroup = 5;

  const currentGroup = Math.ceil(
    page / pagesPerGroup
  );

  const startPage =
    (currentGroup - 1) * pagesPerGroup + 1;

  const endPage = Math.min(
    startPage + pagesPerGroup - 1,
    totalPages
  );


  const pages = Array.from(
    {
      length: endPage - startPage + 1,
    },
    (_, index) => startPage + index
  );


  return (
    <div className="flex items-center gap-2">

      {/* Previous Group */}
      <PaginationButton
        disabled={startPage === 1}
        onClick={() =>
          setPage(startPage - 1)
        }
      >
        <ChevronLeft size={16} />
      </PaginationButton>


      {/* Pages */}
      {pages.map((item) => (
        <PaginationButton
          key={item}
          active={page === item}
          onClick={() =>
            setPage(item)
          }
        >
          {item}
        </PaginationButton>
      ))}


      {/* Next Group */}
      <PaginationButton
        disabled={endPage === totalPages}
        onClick={() =>
          setPage(endPage + 1)
        }
      >
        <ChevronRight size={16} />
      </PaginationButton>

    </div>
  );
}