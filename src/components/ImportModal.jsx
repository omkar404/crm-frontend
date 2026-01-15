import { useRef } from "react";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { successToast, errorToast } from "@/utils/customToast";
import api from "../api/axios";
// i want to validate alert as i given to the backend as user can get what type of error it is
export default function ImportModal({ open, setOpen, onImported }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [skippedRows, setSkippedRows] = useState([]);

  const resetModalState = () => {
    setFile(null);
    setSkippedRows([]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const getSkipReasonsSummary = (skippedDetails = []) => {
    const reasonSet = new Set();

    skippedDetails.forEach((row) => {
      row.reasons.forEach((r) => reasonSet.add(r));
    });

    return Array.from(reasonSet);
  };

  const handleUpload = async () => {
    if (!file) {
      errorToast("Please select an Excel file");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploading(true);

      const res = await api.post("api/auth/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { imported, skipped, skippedDetails } = res.data;

      setSkippedRows(skippedDetails || []);

      if (imported > 0 && skipped === 0) {
        successToast(`Successfully imported ${imported} leads`);
      } else if (imported > 0 && skipped > 0) {
        const reasons = getSkipReasonsSummary(skippedDetails);
        // successToast(
        //   `Imported ${imported}, skipped ${skipped}. Reasons: ${reasons.join(", ")}`
        // );
        successToast(
          `Imported ${imported} leads, skipped ${skipped}. See skipped rows for details.`
        );
      } else if (imported === 0 && skipped > 0) {
        const reasons = getSkipReasonsSummary(skippedDetails);
        errorToast(
          `All rows skipped (${skipped}). Reason: ${reasons.join(", ")}`
        );
      } else {
        errorToast("Nothing was imported");
      }

      setFile(null);

      if (skippedDetails?.length === 0) {
        resetModalState();
        setOpen(false);
        onImported?.();
      }
    } catch (err) {
      console.error(err);
      errorToast(
        err?.response?.data?.error || err?.message || "Failed to import file"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetModalState(); // 🔥 RESET ON CLOSE
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent className="max-w-md rounded-xl bg-white shadow-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Upload size={18} /> Import Leads
          </DialogTitle>
        </DialogHeader>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50">
          {file ? (
            <p className="text-gray-700">{file.name}</p>
          ) : (
            <p className="text-gray-500 text-sm">
              Drag & drop your Excel/CSV file here or{" "}
              <label className="text-blue-600 cursor-pointer">
                browse
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between mt-4">
          <a
            href="https://api.eximinq.co.in/api/auth/sample"
            download
            className="text-blue-600 underline text-sm"
          >
            Download Sample File
          </a>

          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                resetModalState();
                setOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={!file || uploading}
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>

        {/* Skipped rows table (separate block) */}
        {skippedRows.length > 0 && (
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className="bg-red-50 px-4 py-2 font-semibold text-red-700">
              Skipped Rows (Fix these and re-upload)
            </div>

            <div className="max-h-56 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Excel Row</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Mobile</th>
                    <th className="p-2 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {skippedRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">{row.name || "-"}</td>
                      <td className="p-2">{row.email || "-"}</td>
                      <td className="p-2">{row.mobileNo || "-"}</td>
                      <td className="p-2 text-red-600">
                        {row.reasons.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
