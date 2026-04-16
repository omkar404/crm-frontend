import { useEffect, useState } from "react";
import { useMailStore } from "../store/mailStore";
import { STATUS_OPTIONS, YES_NO_OPTIONS } from "../api/mailApi";

// ── Status badge colours ──────────────────────────────────────
const STATUS_COLOR = {
  Reached: { bg: "#0d2e1a", text: "#2ecc71", border: "#1a5c35" },
  Bounced:  { bg: "#2e0d0d", text: "#e74c3c", border: "#5c1a1a" },
  Stop:     { bg: "#2e1f0d", text: "#f39c12", border: "#5c3e1a" },
  Enquiry:  { bg: "#0d1a2e", text: "#3498db", border: "#1a395c" },
  "":       { bg: "#1a1e2e", text: "#6b7a99", border: "#252d45" },
};

const SENT_COLOR = {
  Yes: { bg: "#0d2217", text: "#27ae60", border: "#1a4a30" },
  No:  { bg: "#2e1a1a", text: "#c0392b", border: "#5c2e2e" },
  "":  { bg: "#1a1e2e", text: "#6b7a99", border: "#252d45" },
};

// ── Inline dropdown cell ──────────────────────────────────────
function InlineSelect({ id, field, value, options, patchFn }) {
  const [val, setVal] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const colorMap = field === "status" ? STATUS_COLOR : SENT_COLOR;
  const c = colorMap[val] || colorMap[""];

  const handleChange = async (e) => {
    const next = e.target.value;
    setVal(next);
    setSaving(true);
    try {
      await patchFn(id, { [field]: next });
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={val}
      onChange={handleChange}
      disabled={saving}
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: "3px 8px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        outline: "none",
        fontFamily: "inherit",
        opacity: saving ? 0.6 : 1,
        transition: "all 0.2s",
      }}
    >
      <option value="">— none —</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Main Table ────────────────────────────────────────────────
export default function MailTable({ activeTab, onEdit }) {
  const { mails, loading, filters, setFilter, totalPages, quickPatch, removeMail } = useMailStore();
  const [deleting, setDeleting] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const handleDelete = async (id) => {
    if (confirm !== id) { setConfirm(id); return; }
    setDeleting(id);
    await removeMail(id);
    setDeleting(null);
    setConfirm(null);
  };

  // Columns per tab
  const emailCols = ["name", "emailId", "templateType", "templateSubject", "emailDate", "ipAddress", "webTabType", "emailVerified", "emailSent"];
  const statusCols = ["name", "emailId", "templateType", "city", "contactPerson", "emailSent", "status"];

  const cols = activeTab === "email" ? emailCols : statusCols;

  const HEADERS = {
    name: "Company Name",
    emailId: "Email ID",
    templateType: "Template",
    templateSubject: "Subject",
    emailDate: "Date",
    ipAddress: "IP Address",
    webTabType: "Browser",
    emailVerified: "Verified",
    emailSent: "Email Sent",
    status: "Status",
    city: "City",
    contactPerson: "Contact Person",
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const renderCell = (mail, col) => {
    if (col === "emailDate") return <span style={{ color: "#8892b0", fontSize: 12 }}>{formatDate(mail.emailDate)}</span>;

    if (col === "emailSent") return (
      <InlineSelect id={mail._id} field="emailSent" value={mail.emailSent} options={YES_NO_OPTIONS} patchFn={quickPatch} />
    );

    if (col === "emailVerified") return (
      <InlineSelect id={mail._id} field="emailVerified" value={mail.emailVerified} options={YES_NO_OPTIONS} patchFn={quickPatch} />
    );

    if (col === "status") return (
      <InlineSelect id={mail._id} field="status" value={mail.status} options={STATUS_OPTIONS} patchFn={quickPatch} />
    );

    if (col === "templateType" && mail.templateType) {
      return <span style={{ background: "#1a2744", color: "#4d7cfe", border: "1px solid #2a3f6e", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{mail.templateType}</span>;
    }

    if (col === "webTabType" && mail.webTabType) {
      const icons = { chrome: "🌐", edge: "🔷", mozila: "🦊" };
      return <span style={{ fontSize: 12, color: "#8892b0" }}>{icons[mail.webTabType] || ""} {mail.webTabType}</span>;
    }

    if (col === "name") return (
      <span style={{ fontWeight: 600, color: "#c8d3f5", fontSize: 13 }}>
        {mail.name || "—"}
      </span>
    );

    const val = mail[col];
    if (!val) return <span style={{ color: "#3d4a66" }}>—</span>;

    if (col === "emailId") return (
      <a href={`mailto:${val}`} style={{ color: "#4d7cfe", fontSize: 12, textDecoration: "none" }}>{val}</a>
    );

    return <span style={{ color: "#8892b0", fontSize: 13 }}>{String(val).length > 40 ? String(val).slice(0, 40) + "…" : val}</span>;
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <style>{`
        .mail-table { width: 100%; border-collapse: collapse; font-family: 'DM Sans', sans-serif; }
        .mail-table th {
          background: #0a0d18;
          color: #6b7a99;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 11px 14px;
          text-align: left;
          border-bottom: 1px solid #1e2433;
          white-space: nowrap;
          font-family: 'DM Mono', monospace;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .mail-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #10131f;
          vertical-align: middle;
          white-space: nowrap;
        }
        .mail-table tr { transition: background 0.15s; }
        .mail-table tr:hover td { background: #111527; }
        .btn-action {
          background: transparent;
          border: 1px solid #252d45;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .btn-edit { color: #4d7cfe; }
        .btn-edit:hover { background: #1a2744; border-color: #4d7cfe; }
        .btn-del { color: #e74c3c; margin-left: 4px; }
        .btn-del:hover { background: #2e0d0d; border-color: #e74c3c; }
        .btn-del-confirm { color: #fff; background: #c0392b; border-color: #c0392b; }
        .empty-row td { text-align: center; color: #3d4a66; padding: 48px; font-size: 14px; }
        .loading-row td { text-align: center; color: #3d4a66; padding: 48px; }
        .pagination { display: flex; align-items: center; gap: 8px; padding: 14px 4px; justify-content: flex-end; }
        .pg-btn {
          background: #161b2e;
          border: 1px solid #252d45;
          border-radius: 7px;
          color: #c8d3f5;
          padding: 5px 14px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          transition: all 0.2s;
        }
        .pg-btn:disabled { opacity: 0.3; cursor: default; }
        .pg-btn:not(:disabled):hover { border-color: #4d7cfe; color: #4d7cfe; }
        .pg-info { font-size: 12px; color: #6b7a99; font-family: 'DM Mono', monospace; }
      `}</style>

      <table className="mail-table">
        <thead>
          <tr>
            <th>#</th>
            {cols.map((c) => <th key={c}>{HEADERS[c] || c}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="loading-row"><td colSpan={cols.length + 2}>⏳ Loading records…</td></tr>
          ) : mails.length === 0 ? (
            <tr className="empty-row"><td colSpan={cols.length + 2}>No records found</td></tr>
          ) : (
            mails.map((mail, idx) => (
              <tr key={mail._id}>
                <td style={{ color: "#3d4a66", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  {(filters.page - 1) * filters.limit + idx + 1}
                </td>
                {cols.map((c) => <td key={c}>{renderCell(mail, c)}</td>)}
                <td>
                  <button className="btn-action btn-edit" onClick={() => onEdit(mail)}>Edit</button>
                  <button
                    className={`btn-action btn-del${confirm === mail._id ? "-confirm" : ""}`}
                    onClick={() => handleDelete(mail._id)}
                    disabled={deleting === mail._id}
                  >
                    {confirm === mail._id ? "Sure?" : deleting === mail._id ? "…" : "Del"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button className="pg-btn" disabled={filters.page <= 1} onClick={() => setFilter("page", filters.page - 1)}>← Prev</button>
        <span className="pg-info">Page {filters.page} of {totalPages}</span>
        <button className="pg-btn" disabled={filters.page >= totalPages} onClick={() => setFilter("page", filters.page + 1)}>Next →</button>
      </div>
    </div>
  );
}