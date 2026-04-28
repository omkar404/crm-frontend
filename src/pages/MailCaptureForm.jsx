// // ─── MailCaptureForm.jsx (pages/) ───────────────────────────────────────────
// import { useState } from "react";
// import MailTable from "./MailTable";

// const NAV_ITEMS = [
//   { label: "Dashboard", page: "dashboard" },
//   { label: "Lead Table", page: "lead-table" },
//   { label: "Lead Summary", page: "lead-summary" },
//   { label: "Mail Table", page: "mail-table" },
//   { label: "Mail Summary", page: "Mail-summary" },
//   { label: "Update Status", page: "update-status" },   // new
// ];

// // Inside renderPage()
// if (activePage === "update-status") return <UpdateStatus />;

// export default function MailCaptureForm() {
//   const [activePage, setActivePage] = useState("mail-table");

//   const renderPage = () => {
//     if (activePage === "mail-table") return <MailTable />;
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
//         {NAV_ITEMS.find((n) => n.page === activePage)?.label} — Coming soon
//       </div>
//     );
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <aside className="fixed left-0 top-0 h-full w-44 bg-gray-900 text-white flex flex-col py-4 z-10">
//         <div className="px-4 mb-6">
//           <h1 className="text-lg font-bold">CRM Panel</h1>
//         </div>

//         {NAV_ITEMS.map((item) => (
//           <button
//             key={item.page}
//             onClick={() => setActivePage(item.page)}
//             className={`text-left px-4 py-2 text-sm transition-colors ${
//               activePage === item.page
//                 ? "bg-gray-700 text-white"
//                 : "text-gray-400 hover:bg-gray-800 hover:text-white"
//             }`}
//           >
//             {item.label}
//           </button>
//         ))}

//         <div className="mt-auto px-4">
//           <button className="text-sm text-gray-400 hover:text-white">Logout</button>
//         </div>
//       </aside>

//       {/* Content */}
//       <main className="ml-44 flex-1 flex">
//         {renderPage()}
//       </main>
//     </div>
//   );
// }
import { useState } from "react";
import MailTable from "./MailTable";
import MailSummary from "./MailSummary";
import UpdateStatus from "./UpdateStatus";

const NAV_ITEMS = [
  { label: "Dashboard", page: "dashboard" },
  { label: "Lead Table", page: "lead-table" },
  { label: "Lead Summary", page: "lead-summary" },
  { label: "Mail Table", page: "mail-table" },
  { label: "Mail Summary", page: "mail-summary" },
  { label: "Update Status", page: "update-status" },
];

export default function MailCaptureForm() {
  const [activePage, setActivePage] = useState("mail-table");

  const renderPage = () => {
    if (activePage === "mail-table") return <MailTable />;
    if (activePage === "mail-summary") return <MailSummary />;
    if (activePage === "update-status") return <UpdateStatus />;
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        {NAV_ITEMS.find((n) => n.page === activePage)?.label} — Coming soon
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-44 bg-gray-900 text-white flex flex-col py-4 z-10">
        <div className="px-4 mb-6">
          <h1 className="text-lg font-bold">CRM Panel</h1>
        </div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`text-left px-4 py-2 text-sm transition-colors ${
              activePage === item.page
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
        <div className="mt-auto px-4">
          <button className="text-sm text-gray-400 hover:text-white">Logout</button>
        </div>
      </aside>
      <main className="ml-44 flex-1 flex">
        {renderPage()}
      </main>
    </div>
  );
}
