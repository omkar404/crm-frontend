export default function ClientGrid({ isAdmin }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* map clients here later */}
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-bold">Client Card</h3>

        {isAdmin && (
          <button className="text-sm text-blue-600 mt-2">
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
