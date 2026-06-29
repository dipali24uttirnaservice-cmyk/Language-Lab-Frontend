"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import { studentApi } from "@/services/student/studentApi";
import StatusModal from "@/components/molecules/StatusModal";

export default function BulkUploadStudent() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusData, setStatusData] = useState({
  open: false,
  type: "success",
  title: "",
  message: "",
});

  const handleExcelChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setPreviewData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const uploadStudents = async () => {
    if (!selectedFile) {
setStatusData({
  open: true,
  type: "error",
  title: "File Required",
  message: "Please select an Excel file.",
});
return;      return;
    }

    try {
      setLoading(true);

      const userData = JSON.parse(
        Cookies.get("userData") || "{}"
      );

      const formData = new FormData();

      formData.append("studentExcel", selectedFile);

      formData.append(
        "institute_id",
        userData?.institute?.id ||
          userData?.institute?._id
      );

      await studentApi.bulkUploadStudents(formData);

setStatusData({
  open: true,
  type: "success",
  title: "Upload Successful",
  message: "Students uploaded successfully.",
});

setTimeout(() => {
  router.push("/institute-dashboard/students");
}, 1500);
      router.push("/institute-dashboard/students");
    } catch (error) {
     setStatusData({
  open: true,
  type: "error",
  title: "Upload Failed",
  message:
    error?.response?.data?.message ||
    "Upload failed.",
});
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="max-w-7xl mx-auto px-6 py-8">

    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 text-white flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Bulk Upload Students
          </h1>

          <p className="text-orange-100 mt-1">
            Upload an Excel file to add multiple students at once.
          </p>
        </div>

        <button
          onClick={() =>
            router.push("/institute-dashboard/students")
          }
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition"
        >
          ✕ Close
        </button>

      </div>

      {/* Body */}

      <div className="p-8">

        {/* Upload Box */}

        <div className="border-2 border-dashed border-orange-300 rounded-2xl p-10 text-center hover:border-orange-500 transition">

          <div className="text-6xl mb-4">
            📄
          </div>

          <h2 className="text-xl font-bold text-slate-700">
            Select Excel File
          </h2>

          <p className="text-slate-500 mt-2 mb-6">
            Supported formats: .xlsx , .xls
          </p>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelChange}
            className="border rounded-xl p-3 w-full max-w-lg mx-auto"
          />

        </div>

        {/* Preview */}

        {previewData.length > 0 && (

          <div className="mt-10">

            <div className="flex justify-between items-center mb-5">

              <div>

                <h2 className="text-2xl font-bold text-slate-700">
                  Preview
                </h2>

                <p className="text-slate-500">
                  {previewData.length} Students Ready for Upload
                </p>

              </div>

              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
                {previewData.length} Records
              </span>

            </div>

            <div className="rounded-2xl border overflow-auto max-h-[500px] shadow">

              <table className="w-full text-sm">

                <thead className="sticky top-0 bg-orange-500 text-white">

                  <tr>

                    {Object.keys(previewData[0]).map((key) => (

                      <th
                        key={key}
                        className="px-5 py-4 text-left font-semibold"
                      >
                        {key}
                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {previewData.map((row, index) => (

                    <tr
                      key={index}
                      className="border-b even:bg-orange-50 hover:bg-orange-100 transition"
                    >

                      {Object.values(row).map((value, i) => (

                        <td
                          key={i}
                          className="px-5 py-3 whitespace-nowrap"
                        >
                          {String(value)}
                        </td>

                      ))}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* Footer */}

      <div className="border-t bg-slate-50 px-8 py-5 flex justify-end gap-4">

        <button
          onClick={() =>
            router.push("/institute-dashboard/students")
          }
          className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          onClick={uploadStudents}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-105 transition text-white font-semibold shadow-lg disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : "Upload Students"}
        </button>

      </div>

    </div>

    <StatusModal
      open={statusData.open}
      type={statusData.type}
      title={statusData.title}
      message={statusData.message}
      onClose={() =>
        setStatusData((prev) => ({
          ...prev,
          open: false,
        }))
      }
    />

  </div>
);
}