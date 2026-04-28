export default function DirectoryTabs({
  tab,
  setTab,
  search,
  setSearch
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="flex bg-white border rounded-lg">
        <button
          onClick={() => setTab("clients")}
          className={`px-6 py-2 ${
            tab === "clients" ? "bg-indigo-600 text-white" : "text-gray-500"
          }`}
        >
          Client Directory
        </button>
        <button
          onClick={() => setTab("chas")}
          className={`px-6 py-2 ${
            tab === "chas" ? "bg-indigo-600 text-white" : "text-gray-500"
          }`}
        >
          CHA Master
        </button>
      </div>

      <input
        className="border rounded-lg p-2 text-sm"
        placeholder="Search Directory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
