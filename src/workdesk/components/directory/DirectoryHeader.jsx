export default function DirectoryHeader({ isAdmin, tab }) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Client & CHA Directory</h1>

      {isAdmin && (
        <div>
          {tab === "clients" && (
            <button className="btn-primary">+ New Client</button>
          )}
          {tab === "chas" && (
            <button className="btn-primary">+ New CHA</button>
          )}
        </div>
      )}
    </div>
  );
}
