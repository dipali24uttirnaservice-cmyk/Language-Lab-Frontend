"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

import { assessmentApi } from "@/services/assessment/assessmentApi";
import StatusModal from "@/components/molecules/StatusModal";

export default function BulkUploadAssessment() {
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

  // =====================================================
  // CLOSE STATUS MODAL
  // =====================================================

  const closeStatusModal = () => {
    setStatusData((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // =====================================================
  // EXCEL FILE CHANGE
  // =====================================================

  const handleExcelChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["xlsx", "xls"].includes(extension)) {
      setStatusData({
        open: true,
        type: "error",
        title: "Invalid File",
        message: "Please select a valid .xlsx or .xls file.",
      });

      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewData([]);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          setStatusData({
            open: true,
            type: "error",
            title: "Invalid Excel",
            message: "No worksheet found in the selected Excel file.",
          });

          return;
        }

        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        if (!jsonData.length) {
          setStatusData({
            open: true,
            type: "error",
            title: "Empty File",
            message: "The selected Excel file does not contain any records.",
          });

          setPreviewData([]);
          return;
        }

        setPreviewData(jsonData);
      } catch (error) {
        console.error("Excel Preview Error:", error);

        setStatusData({
          open: true,
          type: "error",
          title: "Invalid Excel",
          message: "Unable to read the selected Excel file.",
        });

        setPreviewData([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // =====================================================
  // BULK UPLOAD ASSESSMENTS
  // =====================================================

  const uploadAssessments = async () => {
    if (!selectedFile) {
      setStatusData({
        open: true,
        type: "error",
        title: "File Required",
        message: "Please select an Excel file.",
      });

      return;
    }

    if (!previewData.length) {
      setStatusData({
        open: true,
        type: "error",
        title: "No Records",
        message: "The selected Excel file does not contain any records.",
      });

      return;
    }

    try {
      setLoading(true);

      const userData = JSON.parse(
        Cookies.get("userData") || "{}"
      );

      const instituteId =
        userData?.institute?.id ||
        userData?.institute?._id ||
        userData?.institute_id;

      const formData = new FormData();

      // IMPORTANT:
      // Change "assessmentExcel" if your backend
      // expects a different field name.
      formData.append("assessmentExcel", selectedFile);

      if (instituteId) {
        formData.append("institute_id", instituteId);
      }

      await assessmentApi.bulkUploadAssessments(formData);

      setStatusData({
        open: true,
        type: "success",
        title: "Upload Successful",
        message: `${previewData.length} assessment records uploaded successfully.`,
      });
    } catch (error) {
      console.error("Bulk Assessment Upload Error:", error);

      setStatusData({
        open: true,
        type: "error",
        title: "Upload Failed",
        message:
          error?.response?.data?.message ||
          "Unable to upload assessments.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD SAMPLE EXCEL
  // =====================================================

  const downloadSampleExcel = () => {
    const link = document.createElement("a");

    link.href = "/assessment_sample.xlsx";
    link.download = "assessment_sample.xlsx";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // =====================================================
  // CLOSE PAGE
  // =====================================================

  const handleClose = () => {
    router.push("/institute-dashboard/assessment");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-8">

      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 text-white">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <div className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-1">
                  Assessment Management
                </div>

                <h1 className="text-3xl font-bold">
                  Bulk Upload Assessments
                </h1>

                <p className="text-orange-100 mt-1">
                  Upload an Excel file to add multiple assessments at once.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-3">

                {/* SAMPLE EXCEL */}

                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="
                    bg-white
                    text-orange-600
                    px-4
                    py-2.5
                    rounded-xl
                    font-semibold
                    hover:bg-orange-50
                    transition
                    shadow-sm
                  "
                >
                  ↓ Download Sample Excel
                </button>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    bg-white/20
                    hover:bg-white/30
                    px-4
                    py-2.5
                    rounded-xl
                    transition
                    font-semibold
                  "
                >
                  ✕ Close
                </button>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* BODY */}
          {/* ================================================= */}

          <div className="p-8">

            {/* ================================================= */}
            {/* UPLOAD BOX */}
            {/* ================================================= */}

            <div
              className="
                border-2
                border-dashed
                border-orange-300
                rounded-2xl
                p-10
                text-center
                hover:border-orange-500
                hover:bg-orange-50/30
                transition
              "
            >

              <div className="text-6xl mb-4">
                📄
              </div>

              <h2 className="text-xl font-bold text-slate-700">
                Select Assessment Excel File
              </h2>

              <p className="text-slate-500 mt-2 mb-6">
                Supported formats: .xlsx, .xls
              </p>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelChange}
                className="
                  border
                  border-slate-300
                  rounded-xl
                  p-3
                  w-full
                  max-w-lg
                  mx-auto
                  bg-white
                  cursor-pointer
                  text-sm
                "
              />

              {selectedFile && (
                <div className="mt-4">

                  <p className="text-sm font-semibold text-slate-700">
                    Selected File
                  </p>

                  <p className="text-sm text-orange-600 mt-1">
                    {selectedFile.name}
                  </p>

                </div>
              )}

            </div>

            {/* ================================================= */}
            {/* PREVIEW */}
            {/* ================================================= */}

            {previewData.length > 0 && (

              <div className="mt-10">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                  <div>

                    <h2 className="text-2xl font-bold text-slate-700">
                      Assessment Preview
                    </h2>

                    <p className="text-slate-500">
                      {previewData.length} assessments ready for upload
                    </p>

                  </div>

                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold w-fit">
                    {previewData.length} Records
                  </span>

                </div>

                {/* TABLE */}

                <div className="rounded-2xl border border-slate-200 overflow-auto max-h-[500px] shadow-sm">

                  <table className="w-full text-sm">

                    <thead className="sticky top-0 bg-orange-500 text-white z-10">

                      <tr>

                        <th className="px-5 py-4 text-left font-semibold whitespace-nowrap">
                          #
                        </th>

                        {Object.keys(previewData[0]).map((key) => (

                          <th
                            key={key}
                            className="px-5 py-4 text-left font-semibold whitespace-nowrap"
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
                          className="
                            border-b
                            border-slate-100
                            even:bg-orange-50
                            hover:bg-orange-100
                            transition
                          "
                        >

                          <td className="px-5 py-3 font-bold text-slate-400">
                            {index + 1}
                          </td>

                          {Object.keys(previewData[0]).map((key) => (

                            <td
                              key={key}
                              className="
                                px-5
                                py-3
                                whitespace-nowrap
                                text-slate-700
                              "
                            >
                              {String(row?.[key] ?? "")}
                            </td>

                          ))}

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

            {/* ================================================= */}
            {/* NO PREVIEW */}
            {/* ================================================= */}

            {!previewData.length && selectedFile && (

              <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200">

                <p className="text-sm font-semibold text-amber-700">
                  No assessment records found in this file.
                </p>

                <p className="text-xs text-amber-600 mt-1">
                  Please check your Excel file and upload it again.
                </p>

              </div>

            )}

          </div>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <div className="border-t bg-slate-50 px-8 py-5">

            <div className="flex flex-col sm:flex-row justify-end gap-4">

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="
                  px-6
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  hover:bg-slate-100
                  transition
                  font-semibold
                  text-slate-700
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading || !selectedFile || !previewData.length}
                onClick={uploadAssessments}
                className="
                  px-8
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-orange-500
                  to-amber-500
                  hover:from-orange-600
                  hover:to-amber-600
                  hover:scale-[1.02]
                  transition
                  text-white
                  font-semibold
                  shadow-lg
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  disabled:hover:scale-100
                "
              >
                {loading
                  ? "Uploading..."
                  : "Upload Assessments"}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* STATUS MODAL */}
      {/* ================================================= */}

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() => {
          const wasSuccess = statusData.type === "success";

          closeStatusModal();

          if (wasSuccess) {
            router.push("/institute-dashboard/assessment");
          }
        }}
      />

    </div>
  );
}