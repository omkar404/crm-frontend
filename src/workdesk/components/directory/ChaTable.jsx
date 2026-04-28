export default function ChaTable() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">CHA Name</th>
            <th className="px-6 py-3">Contact</th>
            <th className="px-6 py-3">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-6 py-4">—</td>
            <td className="px-6 py-4">—</td>
            <td className="px-6 py-4">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
