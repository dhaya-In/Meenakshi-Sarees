// pages/admin/AppointmentsManager.jsx
import { useState, useEffect, useCallback } from "react";
import { Phone, Calendar, MessageSquare, Clock, CheckCircle2, XCircle, Scissors } from "lucide-react";
import { api } from "../../utils/api.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { formatDate } from "../../utils/helpers.js";

const STATUS_STYLES = {
  pending:   { label: "New",       chip: "bg-gold/15 text-gold-dark",     dot: "bg-gold" },
  confirmed: { label: "Confirmed", chip: "bg-blue-50 text-blue-600",      dot: "bg-blue-500" },
  completed: { label: "Completed", chip: "bg-emerald-50 text-emerald-600",dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", chip: "bg-red-50 text-red-500",        dot: "bg-red-400" },
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function AppointmentsManager() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/appointments");
      setAppointments(data.appointments || []);
    } catch (err) {
      toast(err.message || "Failed to load appointments.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      toast(`Marked as ${STATUS_STYLES[status].label.toLowerCase()}.`, "success");
    } catch (err) {
      toast(err.message || "Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal flex items-center gap-2">
            <Scissors size={22} className="text-rose" />
            Stitching Appointments
          </h2>
          <p className="text-sm text-charcoal-muted">
            {appointments.length} total
            {pendingCount > 0 && (
              <span className="ml-2 text-gold-dark font-medium">· {pendingCount} new</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => {
          const count = f === "all" ? appointments.length : appointments.filter((a) => a.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 capitalize
                ${filter === f ? "bg-rose text-white border-rose shadow-rose" : "bg-white text-charcoal-muted border-gold/20 hover:border-rose/40"}`}
            >
              {f === "pending" ? "New" : f} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-charcoal-muted text-sm">Loading appointments…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-luxury border border-gold/10 text-center py-16 text-charcoal-muted">
          <Scissors size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No appointments {filter !== "all" ? `marked "${filter}"` : "yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl shadow-luxury border border-gold/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Status dot + main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`} />
                    <p className="font-semibold text-charcoal">{appt.name}</p>
                    <span className={`badge ${style.chip}`}>{style.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-charcoal-muted">
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} /> {appt.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Scissors size={13} /> {appt.service}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} /> {formatDate(appt.preferred_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} /> Booked {formatDate(appt.created_at)}
                    </span>
                  </div>
                  {appt.notes && (
                    <p className="flex items-start gap-1.5 text-xs text-charcoal mt-2 bg-cream rounded-lg px-3 py-2">
                      <MessageSquare size={13} className="flex-shrink-0 mt-0.5 text-charcoal-muted" />
                      {appt.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {appt.status === "pending" && (
                    <>
                      <button
                        disabled={updatingId === appt.id}
                        onClick={() => updateStatus(appt.id, "confirmed")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Confirm
                      </button>
                      <button
                        disabled={updatingId === appt.id}
                        onClick={() => updateStatus(appt.id, "cancelled")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} /> Decline
                      </button>
                    </>
                  )}
                  {appt.status === "confirmed" && (
                    <button
                      disabled={updatingId === appt.id}
                      onClick={() => updateStatus(appt.id, "completed")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Mark Completed
                    </button>
                  )}
                  <a
                    href={`https://wa.me/91${appt.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#1a9c4a] hover:bg-[#25D366]/20 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
