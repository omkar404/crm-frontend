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

export default function ImportModal({ open, setOpen, onImported }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setUploading(true);
      const res = await api.post("api/auth/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      successToast(res.data.message || "Imported successfully");
      setFile(null);
      setOpen(false);
      onImported();
    } catch (err) {
      console.error(err);
      errorToast(err?.response?.data?.error || "Failed to import");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                <input type="file" accept=".xlsx,.csv" onChange={handleFileSelect} className="hidden" />
              </label>
            </p>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <a href="https://crm-backend-6aw1.onrender.com/api/auth/sample" download className="text-blue-600 underline text-sm">
            Download Sample File
          </a>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => { setFile(null); setOpen(false); }}>
              Cancel
            </Button>
            <Button disabled={!file || uploading} onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
