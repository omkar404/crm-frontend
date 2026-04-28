import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { successToast, errorToast } from "@/utils/customToast";
import api from "../api/axios";

const entityConfig = {
  leads: {
    title: "Import Leads",
    uploadPath: "/api/auth/import",
    samplePath: "/api/auth/sample",
    accept: ".xlsx,.csv",
    successLabel: "leads",
  },
  mails: {
    title: "Import Mails",
    uploadPath: "/api/mail/import",
    samplePath: "/api/mail/sample",
    accept: ".xlsx,.csv",
    successLabel: "mails",
  },
};

export default function ImportModal({
  open,
  setOpen,
  onImported,
  entity = "leads",
}) {
  const config = entityConfig[entity] || entityConfig.leads;
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [skippedRows, setSkippedRows] = useState([]);
  const fileInputRef = useRef(null);

  const resetModalState = () => {
    setFile(null);
    setSkippedRows([]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const getSkipReasonsSummary = (skippedDetails = []) => {
    const reasonSet = new Set();

    skippedDetails.forEach((row) => {
      const reasons = row.reasons || (row.reason ? [row.reason] : []);
      reasons.forEach((reason) => reasonSet.add(reason));
    });

    return Array.from(reasonSet);
  };

  const handleUpload = async () => {
    if (!file) {
      errorToast("Please select an Excel or CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await api.post(config.uploadPath, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { imported = 0, skipped = 0, skippedDetails = [] } = response.data || {};
      setSkippedRows(skippedDetails);

      if (imported > 0 && skipped === 0) {
        successToast(`Successfully imported ${imported} ${config.successLabel}`);
      } else if (imported > 0 && skipped > 0) {
        successToast(
          `Imported ${imported} ${config.successLabel}, skipped ${skipped}. See skipped rows for details.`
        );
      } else if (imported === 0 && skipped > 0) {
        const reasons = getSkipReasonsSummary(skippedDetails);
        errorToast(`All rows skipped (${skipped}). Reason: ${reasons.join(", ")}`);
      } else {
        errorToast("Nothing was imported");
      }

      if (skippedDetails.length === 0) {
        resetModalState();
        setOpen(false);
        onImported?.();
      }
    } catch (err) {
      console.error(err);
      errorToast(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to import file"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      setDownloadingSample(true);
      const response = await api.get(config.samplePath, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = entity === "mails" ? "sample-mails.xlsx" : "sample-leads.xlsx";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      errorToast("Failed to download sample file");
    } finally {
      setDownloadingSample(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetModalState();
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent className="max-w-md rounded-xl border border-gray-200 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Upload size={18} /> {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:bg-gray-50">
          {file ? (
            <p className="text-gray-700">{file.name}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Drag and drop your Excel or CSV file here or{" "}
              <label className="cursor-pointer text-blue-600">
                browse
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={config.accept}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDownloadSample}
            disabled={downloadingSample}
            className="px-0 text-blue-600 hover:bg-transparent hover:text-blue-700"
          >
            <Download size={16} />
            {downloadingSample ? "Downloading..." : "Download Sample File"}
          </Button>

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

        {skippedRows.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border">
            <div className="bg-red-50 px-4 py-2 font-semibold text-red-700">
              Skipped Rows
            </div>

            <div className="max-h-56 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Row</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {skippedRows.map((row, index) => {
                    const reasons = row.reasons || (row.reason ? [row.reason] : []);
                    return (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.rowNumber || "-"}</td>
                        <td className="p-2">{row.name || row.contactName || "-"}</td>
                        <td className="p-2">{row.email || row.contactEmail || "-"}</td>
                        <td className="p-2">{row.mobileNo || row.phone || "-"}</td>
                        <td className="p-2 text-red-600">{reasons.join(", ")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
