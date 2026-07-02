"use client";

import { useMemo, useState } from "react";

import TableToolbar from "../molecules/TableToolbar";
import Pagination from "../molecules/Pagination";

export default function DataTable({
  title,
  columns,
  data,
  search,
  setSearch,
  onAdd,
  onBulkUpload,
  loading,

  segment,
  setSegment,
  year,
  setYear,
  segmentOptions,
  yearOptions,
   selectedStudents,
  onSelectStudent,
  onSelectAll,
    showSelection,

}){

  const [page, setPage] =
    useState(1);

  const pageSize =5;

 const filteredData = data;

  const totalPages = Math.ceil(
    filteredData.length /
      pageSize
  );

  const paginatedData =
    filteredData.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

   const allCurrentPageSelected =
  paginatedData.length > 0 &&
  paginatedData.every((student) =>
    selectedStudents.includes(student._id)
  );
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">

  <TableToolbar
  title={title}
  search={search}
  setSearch={setSearch}
  onAdd={onAdd}
  onBulkUpload={onBulkUpload}

  segment={segment}
  setSegment={setSegment}
  year={year}
  setYear={setYear}

  segmentOptions={segmentOptions}
  yearOptions={yearOptions}
/>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

  <thead className="bg-slate-100">
  <tr>
    {showSelection && (
      <th className="p-4 w-12">
        <input
          type="checkbox"
          checked={allCurrentPageSelected}
          onChange={() => onSelectAll(paginatedData)}
        />
      </th>
    )}

   <th className="p-4 text-left uppercase text-xs font-black tracking-wider w-20">
  Sr. No.
</th>

    {columns.map((column) => (
      <th
        key={column.key}
        className="p-4 text-left uppercase text-xs font-black tracking-wider"
      >
        {column.title}
      </th>
    ))}
  </tr>
</thead>

          <tbody>

           {paginatedData.map((row, index) => {
  const serialNo = (page - 1) * pageSize + index + 1;

  return (
                <tr
                   key={row.id || row._id || index}
                  className="
                    border-t
                    hover:bg-slate-50
                  "
                >
                  {showSelection && (
    <td className="p-4">
      <input
        type="checkbox"
        checked={selectedStudents.includes(row._id)}
        
        onChange={() => onSelectStudent(row._id)}
      />
    </td>
  )}

 <td className="p-4 font-semibold text-slate-600">
  {serialNo}
</td>
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

             );
})}
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