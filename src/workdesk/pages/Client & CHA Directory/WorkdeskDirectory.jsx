import { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Eye, EyeOff, Key, CreditCard } from "lucide-react";
import workdeskAxios from "@/api/workdeskAxios";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";

import AddClientModal from "./AddClientModal";
import AddChaModal from "./AddChaModal";
import DscMovementModal from "./DscMovementModal";

export default function WorkdeskDirectory() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [clients, setClients] = useState([]);
  const [chas, setChas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddCha, setShowAddCha] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [activeClientForDSC, setActiveClientForDSC] = useState(null);

  const [tab, setTab] = useState("clients");
  const [search, setSearch] = useState("");
  const [showPasswords, setShowPasswords] = useState({});

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [clientRes, chaRes] = await Promise.all([
        workdeskAxios.get("/clients"),
        workdeskAxios.get("/chas"),
      ]);

      setClients(Array.isArray(clientRes?.data?.data) ? clientRes.data.data : []);
      // setChas(Array.isArray(chaRes?.data?.data) ? chaRes.data.data : []);
      setChas(Array.isArray(chaRes?.data) ? chaRes.data : []);

    } catch (err) {
      console.error("Directory fetch failed", err);
      setClients([]);
      setChas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      [c.name, c.clientId, c.chaName]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [clients, search]);

  const togglePassword = (id) => {
    setShowPasswords((p) => ({ ...p, [id]: !p[id] }));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-2xl font-bold text-slate-800">
            Client & CHA Directory
          </h2>

          {isAdmin && (
            <div className="flex gap-2">
              {tab === "clients" && (
                <button
                  onClick={() => {
                    setEditingClient(null);
                    setShowAddClient(true);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  + New Client
                </button>
              )}
              {tab === "chas" && (
                <button
                  onClick={() => setShowAddCha(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  + New CHA
                </button>
              )}
            </div>
          )}
        </div>

        {/* MODALS */}
        {showAddClient && (
          <AddClientModal
            chas={chas}
            client={editingClient}
            onSuccess={() => fetchData()}
            onClose={() => {
              setShowAddClient(false);
              setEditingClient(null);
            }}
          />
        )}

        {showAddCha && (
          <AddChaModal
            onSuccess={() => fetchData()}
            onClose={() => setShowAddCha(false)}
          />
        )}
        {activeClientForDSC && (
          <DscMovementModal
            client={activeClientForDSC}
            onClose={() => {
              setActiveClientForDSC(null);
              fetchData();
            }}
          />
        )}

        {/* TABS + SEARCH */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTab("clients")}
              className={`px-6 py-2 rounded-md text-sm font-medium ${tab === "clients"
                ? "bg-indigo-600 text-white"
                : "text-gray-500"
                }`}
            >
              Clients
            </button>
            <button
              onClick={() => setTab("chas")}
              className={`px-6 py-2 rounded-md text-sm font-medium ${tab === "chas"
                ? "bg-indigo-600 text-white"
                : "text-gray-500"
                }`}
            >
              CHAs
            </button>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="pl-10 w-full border rounded-lg p-2 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && <div className="text-center text-sm">Loading...</div>}

        {/* CLIENTS */}
        {tab === "clients" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredClients || []).map((client) => (
              <div
                key={client._id}
                className="bg-white border rounded-xl p-6 shadow-sm relative"
              >
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setShowAddClient(true);
                    }}
                    className="absolute top-4 right-4"
                  >
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                  {client.clientId}
                </span>

                <h3 className="mt-2 font-bold text-lg truncate">
                  {client.name}
                </h3>

                <div className="text-xs text-gray-500 mt-2">
                  {client.source === "CHA"
                    ? `CHA: ${client.chaName}`
                    : "Direct Client"}
                </div>

                {/* CONTACT */}
                <div className="text-xs mt-3">
                  <div className="font-bold">{client.contactPerson}</div>
                  <div>{client.contactMobile}</div>
                  <div className="truncate">{client.contactEmail}</div>
                </div>

                {/* CREDENTIALS */}
                <div className="bg-gray-50 p-2 rounded mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Key className="w-3 h-3" /> Credentials
                    </span>
                    <button onClick={() => togglePassword(client._id)}>
                      {showPasswords[client._id] ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                    <div>
                      DGFT: {client.dgftLogin}
                    </div>
                    <div>
                      {showPasswords[client._id]
                        ? client.dgftPassword
                        : "••••••"}
                    </div>
                    <div>
                      ICEGATE: {client.icegateLogin}
                    </div>
                    <div>
                      {showPasswords[client._id]
                        ? client.icegatePassword
                        : "••••••"}
                    </div>
                  </div>
                </div>

                {/* DSC */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <div>
                      <div className="text-xs font-bold">
                        {client.dscHolder}
                      </div>
                      <div className="text-[10px] text-orange-600">
                        Exp:{" "}
                        {client.dscExpiry
                          ? new Date(client.dscExpiry).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveClientForDSC(client)}
                    className={`text-[10px] px-2 py-1 rounded border ${client.dscStatus === "Inward"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                      }`}
                  >
                    {client.dscStatus}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHA TABLE */}
        {tab === "chas" && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">CHA Company Name</th>
                  <th className="px-6 py-3 text-left">Contact Person</th>
                  <th className="px-6 py-3 text-left">Mobile / Contact</th>
                  <th className="px-6 py-3 text-left">Email ID</th>
                </tr>
              </thead>
              <tbody>
                {(chas || []).map((cha) => (
                  <tr key={cha._id} className="border-t">
                    <td className="px-6 py-3 font-bold">{cha.chaname}</td>
                    <td className="px-6 py-3">{cha.contactPerson}</td>
                    <td className="px-6 py-3">{cha.mobile}</td>
                    <td className="px-6 py-3">{cha.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
