"use client";

import { useMemo, useState } from "react";

import TableToolbar from "../molecules/TableToolbar";
import Pagination from "../molecules/Pagination";

export default function DataTable({
  columns,
  data,
  title,
  onAdd,
}) {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const pageSize =5;

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      JSON.stringify(row)
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );
  }, [data, search]);

  const totalPages = Math.ceil(
    filteredData.length /
      pageSize
  );

  const paginatedData =
    filteredData.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">

     <TableToolbar
  title={title}
  search={search}
  setSearch={setSearch}
  onAdd={onAdd}
/>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

     <thead className="bg-slate-100">   
              <tr className="bg-slate-100">

              {columns.map(
                (column) => (
                  <th
                    key={column.key}
                    className="
                      p-4
                      text-left
                      uppercase
                      text-xs
                      font-black
                      tracking-wider
                    "
                  >
                    {column.title}
                  </th>
                )
              )}

            </tr>
          </thead>

          <tbody>

            {paginatedData.map(
              (row, index) => (
                <tr
                  key={index}
                  className="
                    border-t
                    hover:bg-slate-50
                  "
                >
                  {columns.map(
                    (column) => (
                      <td
                        key={
                          column.key
                        }
                        className="p-4"
                      >
                        {column.render
                          ? column.render(
                              row
                            )
                          : row[
                              column.key
                            ]}
                      </td>
                    )
                  )}
                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      <div className="p-4 border-t flex justify-between items-center">

        <span className="text-sm text-slate-500">
          Showing{" "}
          {paginatedData.length} of{" "}
          {
            filteredData.length
          } records
        </span>

        <Pagination
          page={page}
          totalPages={
            totalPages
          }
          setPage={setPage}
        />

      </div>

    </div>
  );
}