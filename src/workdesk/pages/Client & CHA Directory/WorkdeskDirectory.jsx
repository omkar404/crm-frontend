import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Eye, EyeOff, Key, Pencil, Search, Users2 } from "lucide-react";

import workdeskAxios from "@/api/workdeskAxios";
import { getWorkdeskClientSecretsApi } from "@/api/workdesk.api";
import {
  WorkdeskEmptyState,
  WorkdeskInput,
  WorkdeskPage,
  WorkdeskPill,
  WorkdeskSection,
  WorkdeskSegment,
  WorkdeskStatCard,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";

import AddChaModal from "./AddChaModal";
import AddClientModal from "./AddClientModal";
import DscMovementModal from "./DscMovementModal";

export default function WorkdeskDirectory() {
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [clients, setClients] = useState([]);
  const [chas, setChas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddCha, setShowAddCha] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [activeClientForDSC, setActiveClientForDSC] = useState(null);
  const [activeCha, setActiveCha] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [pagination, setPagination] = useState({
    allRecords: { page: 1, pageSize: 10 },
    allDirectClients: { page: 1, pageSize: 10 },
    allChas: { page: 1, pageSize: 10 },
    allChaCompanies: { page: 1, pageSize: 10 },
    clientsTab: { page: 1, pageSize: 10 },
    chasTab: { page: 1, pageSize: 10 },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientRes, chaRes] = await Promise.all([
        workdeskAxios.get("/clients?limit=1000"),
        workdeskAxios.get("/chas"),
      ]);
      setClients(Array.isArray(clientRes?.data?.data) ? clientRes.data.data : []);
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

  useEffect(() => {
    setPagination((current) => ({
      allRecords: { ...current.allRecords, page: 1 },
      allDirectClients: { ...current.allDirectClients, page: 1 },
      allChas: { ...current.allChas, page: 1 },
      allChaCompanies: { ...current.allChaCompanies, page: 1 },
      clientsTab: { ...current.clientsTab, page: 1 },
      chasTab: { ...current.chasTab, page: 1 },
    }));
  }, [search, tab]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      [client.name, client.clientId, client.chaName, client.contactPerson, client.contactEmail]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [clients, search]);

  const filteredChas = useMemo(() => {
    return chas.filter((cha) =>
      [cha.chaname, cha.cdcrBase, cha.contactPerson, cha.mobile, cha.email]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [chas, search]);

  const filteredChaClients = useMemo(
    () => filteredClients.filter((client) => client.source === "CHA"),
    [filteredClients]
  );

  const filteredDirectClients = useMemo(
    () => filteredClients.filter((client) => client.source === "Direct"),
    [filteredClients]
  );

  const unifiedDirectoryRecords = useMemo(() => {
    const directRecords = filteredDirectClients.map((client) => ({
      id: `direct-${client._id}`,
      type: "Direct Client",
      name: client.name,
      code: client.clientId,
      relation: "Direct",
      contactPerson: client.contactPerson || "-",
      contactValue: client.contactEmail || client.contactMobile || "-",
    }));

    const chaRecords = filteredChas.map((cha) => ({
      id: `cha-${cha._id}`,
      type: "CHA",
      name: cha.chaname,
      code: cha.cdcrBase,
      relation: "CHA Master",
      contactPerson: cha.contactPerson || "-",
      contactValue: cha.email || cha.mobile || "-",
      onOpen: () => setActiveCha(cha),
    }));

    const chaCompanyRecords = filteredChaClients.map((client) => ({
      id: `cha-company-${client._id}`,
      type: "CHA Client Company",
      name: client.name,
      code: client.clientId,
      relation: client.chaName ? `Under ${client.chaName}` : "Under CHA",
      contactPerson: client.contactPerson || "-",
      contactValue: client.contactEmail || client.contactMobile || "-",
    }));

    return [...directRecords, ...chaRecords, ...chaCompanyRecords];
  }, [filteredChaClients, filteredChas, filteredDirectClients]);

  const visibleResultCount = useMemo(() => {
    if (tab === "clients") return filteredClients.length;
    if (tab === "chas") return filteredChas.length;
    return filteredDirectClients.length + filteredChas.length + filteredChaClients.length;
  }, [filteredChaClients.length, filteredChas.length, filteredClients.length, filteredDirectClients.length, tab]);

  const togglePassword = (id) => {
    setShowPasswords((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleRevealSecrets = async (client) => {
    if (!showPasswords[client._id] && isAdmin) {
      const secrets = await getWorkdeskClientSecretsApi(client._id);
      setClients((prev) => prev.map((item) => (item._id === client._id ? { ...item, ...secrets } : item)));
    }
    togglePassword(client._id);
  };

  const handleEdit = async (client) => {
    if (!isAdmin) return;
    const secrets = await getWorkdeskClientSecretsApi(client._id);
    setEditingClient({ ...client, ...secrets });
    setShowAddClient(true);
  };

  const updatePagination = (key, patch) => {
    setPagination((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch,
      },
    }));
  };

  const paginateItems = (items, config) => {
    const pageSize = Number(config?.pageSize) || 10;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(config?.page || 1, 1), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      page: safePage,
      pageSize,
      totalPages,
      totalItems: items.length,
      visibleItems: items.slice(start, start + pageSize),
      startIndex: items.length === 0 ? 0 : start + 1,
      endIndex: Math.min(start + pageSize, items.length),
    };
  };

  const pagedAllRecords = useMemo(
    () => paginateItems(unifiedDirectoryRecords, pagination.allRecords),
    [pagination.allRecords, unifiedDirectoryRecords]
  );
  const pagedAllDirectClients = useMemo(
    () => paginateItems(filteredDirectClients, pagination.allDirectClients),
    [filteredDirectClients, pagination.allDirectClients]
  );
  const pagedAllChas = useMemo(
    () => paginateItems(filteredChas, pagination.allChas),
    [filteredChas, pagination.allChas]
  );
  const pagedAllChaCompanies = useMemo(
    () => paginateItems(filteredChaClients, pagination.allChaCompanies),
    [filteredChaClients, pagination.allChaCompanies]
  );
  const pagedClientsTab = useMemo(
    () => paginateItems(filteredClients, pagination.clientsTab),
    [filteredClients, pagination.clientsTab]
  );
  const pagedChasTab = useMemo(
    () => paginateItems(filteredChas, pagination.chasTab),
    [filteredChas, pagination.chasTab]
  );

  const renderClientGrid = (items, titleTone = "default") => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {items.map((client) => (
          <ClientCard
            key={client._id}
            client={client}
            isAdmin={isAdmin}
            titleTone={titleTone}
            secretsVisible={Boolean(showPasswords[client._id])}
            onEdit={handleEdit}
            onRevealSecrets={handleRevealSecrets}
            onOpenDsc={setActiveClientForDSC}
          />
        ))}
      </div>
    );
  };

  return (
    <WorkdeskPage
      eyebrow="Relationship Directory"
      title="A more polished and trustworthy directory for clients, CHAs, and credentials"
      description="This directory now reads like a premium operations registry, with clearer cards, smarter spacing, and stronger presentation for sensitive account details."
      actions={
        isAdmin ? (
          <div className="flex flex-wrap gap-3">
            {(tab === "all" || tab === "clients") && (
              <button
                type="button"
                onClick={() => {
                  setEditingClient(null);
                  setShowAddClient(true);
                }}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                New Client
              </button>
            )}
            {(tab === "all" || tab === "chas") && (
              <button
                type="button"
                onClick={() => setShowAddCha(true)}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                New CHA
              </button>
            )}
          </div>
        ) : null
      }
      hero={
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-3">
            <WorkdeskStatCard
              label="Clients"
              value={clients.length}
              caption="Managed client records"
              icon={Users2}
              accent="blue"
            />
            <WorkdeskStatCard
              label="CHAs"
              value={chas.length}
              caption="Linked customs partners"
              icon={Users2}
              accent="slate"
            />
            <WorkdeskStatCard
              label="Visible Results"
              value={visibleResultCount}
              caption="Current search outcome"
              icon={Search}
              accent="teal"
            />
          </div>

          <div className="rounded-[30px] border border-slate-900/90 bg-[linear-gradient(135deg,#111827_0%,#1f2937_46%,#0f766e_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              Records Experience
            </div>
            <h3 className="mt-2 text-2xl font-bold">Cleaner credentials, stronger confidence</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Quickly move between relationship records, operational contacts, and credential access without visual clutter.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <WorkdeskPill tone="dark">
                {isAdmin ? "Admin control enabled" : "Protected staff access"}
              </WorkdeskPill>
              <WorkdeskPill tone="info">
                {tab === "clients" ? "Client cards" : tab === "chas" ? "CHA registry" : "Unified directory"}
              </WorkdeskPill>
            </div>
          </div>
        </div>
      }
    >
      {showAddClient ? (
        <AddClientModal
          chas={chas}
          client={editingClient}
          onSuccess={() => fetchData()}
          onClose={() => {
            setShowAddClient(false);
            setEditingClient(null);
          }}
        />
      ) : null}

      {showAddCha ? <AddChaModal onSuccess={() => fetchData()} onClose={() => setShowAddCha(false)} /> : null}

      {activeClientForDSC ? (
        <DscMovementModal
          client={activeClientForDSC}
          onClose={() => {
            setActiveClientForDSC(null);
            fetchData();
          }}
        />
      ) : null}

      {activeCha ? (
        <ChaDetailsModal
          cha={activeCha}
          associatedCompanies={clients.filter((client) => client.chaId === activeCha._id)}
          onClose={() => setActiveCha(null)}
        />
      ) : null}

      <WorkdeskSection
        title="Browse Directory"
        description="Switch between the unified All view, client records, and CHA records while keeping search and actions within one calm workspace."
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <WorkdeskSegment options={["all", "clients", "chas"]} value={tab} onChange={setTab} />

          <div className="relative w-full xl:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <WorkdeskInput
              className="pl-11"
              placeholder={
                tab === "clients"
                  ? "Search clients, IDs, or CHA"
                  : tab === "chas"
                  ? "Search CHA details"
                  : "Search clients, CDCR IDs, or CHA details"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </WorkdeskSection>

      {loading ? <p className="text-sm text-slate-500">Loading directory...</p> : null}

      {tab === "all" ? (
        <div className="space-y-5">
          {filteredDirectClients.length === 0 && filteredChas.length === 0 && filteredChaClients.length === 0 && !loading ? (
            <WorkdeskEmptyState
              title="No directory records found"
              description="Try a broader search or add direct clients, CHA records, and linked CHA companies to populate the unified directory."
            />
          ) : null}

          <WorkdeskSection
            title="All Directory Records"
            description="A compact combined view of direct clients, CHA records, and companies created under a CHA."
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <WorkdeskPill tone="dark">{pagedAllRecords.totalItems} total records</WorkdeskPill>
                <PaginationControls
                  page={pagedAllRecords.page}
                  pageSize={pagedAllRecords.pageSize}
                  totalPages={pagedAllRecords.totalPages}
                  totalItems={pagedAllRecords.totalItems}
                  startIndex={pagedAllRecords.startIndex}
                  endIndex={pagedAllRecords.endIndex}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={(page) => updatePagination("allRecords", { page })}
                  onPageSizeChange={(pageSize) =>
                    updatePagination("allRecords", { page: 1, pageSize })
                  }
                />
              </div>
            }
          >
            {unifiedDirectoryRecords.length === 0 ? (
              <WorkdeskEmptyState
                title="No combined records found"
                description="Direct clients, CHAs, and CHA-linked companies will appear here together."
              />
            ) : (
              <AllDirectoryTable records={pagedAllRecords.visibleItems} />
            )}
          </WorkdeskSection>

          <WorkdeskSection
            title="All Direct Clients"
            description="Direct client records shown in the polished card layout for quick browsing and credential access."
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <WorkdeskPill tone="default">{pagedAllDirectClients.totalItems} direct clients</WorkdeskPill>
                <PaginationControls
                  page={pagedAllDirectClients.page}
                  pageSize={pagedAllDirectClients.pageSize}
                  totalPages={pagedAllDirectClients.totalPages}
                  totalItems={pagedAllDirectClients.totalItems}
                  startIndex={pagedAllDirectClients.startIndex}
                  endIndex={pagedAllDirectClients.endIndex}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={(page) => updatePagination("allDirectClients", { page })}
                  onPageSizeChange={(pageSize) =>
                    updatePagination("allDirectClients", { page: 1, pageSize })
                  }
                />
              </div>
            }
          >
            {filteredDirectClients.length === 0 ? (
              <WorkdeskEmptyState
                title="No direct clients found"
                description="Direct client records will appear here automatically once created."
              />
            ) : (
              renderClientGrid(pagedAllDirectClients.visibleItems, "teal")
            )}
          </WorkdeskSection>

          <WorkdeskSection
            title="All CHAs"
            description="Master CHA records with their base CDCR numbers."
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <WorkdeskPill tone="info">{pagedAllChas.totalItems} CHA records</WorkdeskPill>
                <PaginationControls
                  page={pagedAllChas.page}
                  pageSize={pagedAllChas.pageSize}
                  totalPages={pagedAllChas.totalPages}
                  totalItems={pagedAllChas.totalItems}
                  startIndex={pagedAllChas.startIndex}
                  endIndex={pagedAllChas.endIndex}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={(page) => updatePagination("allChas", { page })}
                  onPageSizeChange={(pageSize) =>
                    updatePagination("allChas", { page: 1, pageSize })
                  }
                />
              </div>
            }
          >
            {filteredChas.length === 0 ? (
              <WorkdeskEmptyState
                title="No CHA records found"
                description="CHA partners will appear here once created."
              />
            ) : (
              <ChaTable chas={pagedAllChas.visibleItems} onOpen={setActiveCha} />
            )}
          </WorkdeskSection>

          <WorkdeskSection
            title="All Client Companies Under CHA"
            description="Every company created under a CHA is shown here in the same card format, including entries like CDCR-503-1."
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <WorkdeskPill tone="warning">{pagedAllChaCompanies.totalItems} CHA-linked companies</WorkdeskPill>
                <PaginationControls
                  page={pagedAllChaCompanies.page}
                  pageSize={pagedAllChaCompanies.pageSize}
                  totalPages={pagedAllChaCompanies.totalPages}
                  totalItems={pagedAllChaCompanies.totalItems}
                  startIndex={pagedAllChaCompanies.startIndex}
                  endIndex={pagedAllChaCompanies.endIndex}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={(page) => updatePagination("allChaCompanies", { page })}
                  onPageSizeChange={(pageSize) =>
                    updatePagination("allChaCompanies", { page: 1, pageSize })
                  }
                />
              </div>
            }
          >
            {filteredChaClients.length === 0 ? (
              <WorkdeskEmptyState
                title="No CHA-linked client companies found"
                description="Companies created under any CHA will appear here automatically."
              />
            ) : (
              renderClientGrid(pagedAllChaCompanies.visibleItems, "teal")
            )}
          </WorkdeskSection>

        </div>
      ) : tab === "clients" ? (
        filteredClients.length === 0 && !loading ? (
          <WorkdeskEmptyState
            title="No clients found"
            description="Try a broader search or add a new client record to start building the directory."
          />
        ) : (
          <WorkdeskSection
            title="Client Registry"
            description="Browse all direct and CHA-linked client companies in a cleaner paginated card layout."
            aside={
              <PaginationControls
                page={pagedClientsTab.page}
                pageSize={pagedClientsTab.pageSize}
                totalPages={pagedClientsTab.totalPages}
                totalItems={pagedClientsTab.totalItems}
                startIndex={pagedClientsTab.startIndex}
                endIndex={pagedClientsTab.endIndex}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={(page) => updatePagination("clientsTab", { page })}
                onPageSizeChange={(pageSize) =>
                  updatePagination("clientsTab", { page: 1, pageSize })
                }
              />
            }
          >
            {renderClientGrid(pagedClientsTab.visibleItems, "teal")}
          </WorkdeskSection>
        )
      ) : filteredChas.length === 0 && !loading ? (
        <WorkdeskEmptyState
          title="No CHA records found"
          description="Search with broader terms or add a new CHA partner to populate the registry."
        />
      ) : (
        <WorkdeskSection
          title="CHA Registry"
          description="A neater table presentation for relationship and contact details."
          aside={
            <div className="flex flex-wrap items-center gap-2">
              <WorkdeskPill tone="info">{pagedChasTab.totalItems} visible partners</WorkdeskPill>
              <PaginationControls
                page={pagedChasTab.page}
                pageSize={pagedChasTab.pageSize}
                totalPages={pagedChasTab.totalPages}
                totalItems={pagedChasTab.totalItems}
                startIndex={pagedChasTab.startIndex}
                endIndex={pagedChasTab.endIndex}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={(page) => updatePagination("chasTab", { page })}
                onPageSizeChange={(pageSize) =>
                  updatePagination("chasTab", { page: 1, pageSize })
                }
              />
            </div>
          }
        >
          <ChaTable chas={pagedChasTab.visibleItems} onOpen={setActiveCha} />
        </WorkdeskSection>
      )}
    </WorkdeskPage>
  );
}

function PaginationControls({
  page,
  pageSize,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500">
        {totalItems === 0 ? "0 records" : `${startIndex}-${endIndex} of ${totalItems}`}
      </span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-xs font-semibold text-slate-600">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

function ChaTable({ chas, onOpen }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50/90 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4 text-left">CHA Company</th>
              <th className="px-5 py-4 text-left">CDCR No</th>
              <th className="px-5 py-4 text-left">Contact Person</th>
              <th className="px-5 py-4 text-left">Mobile / Contact</th>
              <th className="px-5 py-4 text-left">Email ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {chas.map((cha) => (
              <tr key={cha._id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  <button
                    type="button"
                    onClick={() => onOpen(cha)}
                    className="text-left transition hover:text-sky-700"
                  >
                    {cha.chaname}
                  </button>
                </td>
                <td className="px-5 py-4 text-slate-700">{cha.cdcrBase || "-"}</td>
                <td className="px-5 py-4 text-slate-700">{cha.contactPerson || "-"}</td>
                <td className="px-5 py-4 text-slate-700">{cha.mobile || "-"}</td>
                <td className="px-5 py-4 text-slate-700">{cha.email || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllDirectoryTable({ records }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-slate-50/90 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4 text-left">Type</th>
              <th className="px-5 py-4 text-left">Company / Record</th>
              <th className="px-5 py-4 text-left">CDCR No</th>
              <th className="px-5 py-4 text-left">Relationship</th>
              <th className="px-5 py-4 text-left">Contact Person</th>
              <th className="px-5 py-4 text-left">Email / Mobile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <WorkdeskPill
                    tone={
                      record.type === "CHA"
                        ? "info"
                        : record.type === "CHA Client Company"
                        ? "warning"
                        : "default"
                    }
                  >
                    {record.type}
                  </WorkdeskPill>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {record.onOpen ? (
                    <button
                      type="button"
                      onClick={record.onOpen}
                      className="text-left transition hover:text-sky-700"
                    >
                      {record.name}
                    </button>
                  ) : (
                    record.name
                  )}
                </td>
                <td className="px-5 py-4 text-slate-700">{record.code || "-"}</td>
                <td className="px-5 py-4 text-slate-700">{record.relation || "-"}</td>
                <td className="px-5 py-4 text-slate-700">{record.contactPerson || "-"}</td>
                <td className="px-5 py-4 text-slate-700">{record.contactValue || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CredentialItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 break-all text-xs font-medium text-slate-800">{value || "-"}</div>
    </div>
  );
}

function ClientCard({
  client,
  isAdmin,
  titleTone = "default",
  secretsVisible,
  onEdit,
  onRevealSecrets,
  onOpenDsc,
}) {
  const titleToneClassMap = {
    default: "bg-[linear-gradient(135deg,rgba(244,247,248,0.96)_0%,rgba(236,244,242,0.96)_100%)]",
    teal: "bg-[linear-gradient(135deg,rgba(239,250,250,0.98)_0%,rgba(229,246,244,0.96)_55%,rgba(236,249,246,0.94)_100%)]",
  };

  return (
    <div
      className="overflow-hidden rounded-[28px] border border-white/80 bg-white/92 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
    >
      <div
        className={[
          "border-b border-slate-200/80 px-5 py-5",
          titleToneClassMap[titleTone] || titleToneClassMap.default,
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <WorkdeskPill tone="default">{client.clientId}</WorkdeskPill>
            <h3 className="mt-3 text-xl font-bold text-slate-950">{client.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {client.source === "CHA" ? `CHA: ${client.chaName}` : "Direct Client"}
            </p>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => onEdit(client)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Primary Contact
          </div>
          <div className="mt-3 text-base font-semibold text-slate-900">
            {client.contactPerson || "-"}
          </div>
          <div className="mt-1 text-sm text-slate-600">{client.contactMobile || "-"}</div>
          <div className="mt-1 truncate text-sm text-slate-500">{client.contactEmail || "-"}</div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,1)_0%,rgba(240,249,255,1)_100%)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Key className="h-4 w-4 text-sky-600" />
              Credentials
            </div>
            <button
              type="button"
              onClick={() => onRevealSecrets(client)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-600"
            >
              {secretsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <CredentialItem label="DGFT Login" value={client.dgftLogin} />
            <CredentialItem
              label="DGFT Password"
              value={secretsVisible ? client.dgftPassword : "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"}
            />
            <CredentialItem label="ICEGATE Login" value={client.icegateLogin} />
            <CredentialItem
              label="ICEGATE Password"
              value={secretsVisible ? client.icegatePassword : "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"}
            />
          </div>

          {Array.isArray(client.additionalPortalCredentials) &&
          client.additionalPortalCredentials.length > 0 ? (
            <div className="mt-4 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Additional Portal Credentials
              </div>
              <div className="grid gap-3">
                {client.additionalPortalCredentials.map((credential, index) => (
                  <div
                    key={`${client._id}-portal-${index}`}
                    className="rounded-2xl border border-white/80 bg-white/90 p-3"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {credential.portalName || `Portal ${index + 1}`}
                    </div>
                    <div className="mt-2 text-xs font-medium text-slate-800">
                      User ID: {credential.userId || "-"}
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-800">
                      Password: {secretsVisible ? credential.password || "-" : "••••••••"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold text-slate-900">{client.dscHolder || "-"}</div>
              <div className="text-xs text-slate-500">
                Exp: {client.dscExpiry ? new Date(client.dscExpiry).toLocaleDateString() : "-"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenDsc(client)}
            className={[
              "rounded-full px-3 py-2 text-xs font-semibold",
              client.dscStatus === "Inward"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700",
            ].join(" ")}
          >
            {client.dscStatus || "Unknown"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChaDetailsModal({ cha, associatedCompanies = [], onClose }) {
  const fields = [
    { label: "CHA Company", value: cha.chaname },
    { label: "CDCR No", value: cha.cdcrBase },
    { label: "Contact Person", value: cha.contactPerson },
    { label: "Mobile Number", value: cha.mobile },
    { label: "Email ID", value: cha.email },
    { label: "Office Address", value: cha.officeAddress },
    { label: "Remarks", value: cha.remarks },
    {
      label: "Created On",
      value: cha.createdAt ? new Date(cha.createdAt).toLocaleString("en-IN") : "",
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[88vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[linear-gradient(135deg,rgba(244,247,248,0.96)_0%,rgba(236,244,242,0.96)_100%)] px-4 py-3 sm:px-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">CHA Details</div>
            <h3 className="mt-1.5 text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">
              {cha.chaname}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{cha.cdcrBase || "-"}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className={field.label === "Office Address" || field.label === "Remarks" ? "md:col-span-2" : ""}
              >
                <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {field.label}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-900">
                    {field.value || "-"}
                  </div>
                </div>
              </div>
            ))}

            <div className="md:col-span-2">
              <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Associated Companies
                </div>

                {associatedCompanies.length === 0 ? (
                  <div className="mt-2 text-sm font-medium text-slate-900">-</div>
                ) : (
                  <div className="mt-3 grid gap-2.5">
                    {associatedCompanies.map((company) => (
                      <div
                        key={company._id}
                        className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {company.clientId || "-"}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">{company.name || "-"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
