import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History, Clock, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { upgradeAPI } from './api';

const STATUS_STYLES = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_ICONS = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

export default function UpgradeRequestsSection() {
  const { t } = useTranslation('common');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const res = await upgradeAPI.getMyRequests({ page, size: 10 });
        if (!cancelled) {
          setRequests(res.content || []);
          setTotalPages(res.totalPages || 0);
        }
      } catch (err) {
        console.warn('Failed to load upgrade requests:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <History size={24} className="mx-auto text-gray-600 mb-2" />
        <p className="text-xs text-gray-500">No upgrade requests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const StatusIcon = STATUS_ICONS[req.status] || Clock;
        return (
          <div
            key={req.requestId}
            className="p-4 rounded-xl border border-[#DEDBC8]/6 bg-[#0A0D14]/50 space-y-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[req.status] || 'bg-gray-500/10 text-gray-400'}`}>
                  <StatusIcon size={10} />
                  {req.status}
                </span>
              </div>
              <span className="text-[10px] text-gray-500">
                {new Date(req.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500">Field: </span>
                <span className="text-[#E1E0CC]">{req.researchField}</span>
              </div>
              <div>
                <span className="text-gray-500">Position: </span>
                <span className="text-[#E1E0CC]">{req.position}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Institution: </span>
                <span className="text-[#E1E0CC]">{req.institution}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
              "{req.reason}"
            </p>
            {req.adminNote && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#0A0D14] border border-[#DEDBC8]/5">
                <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Admin note:</p>
                <p className="text-[11px] text-gray-400">{req.adminNote}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#DEDBC8]/10 text-[#E1E0CC] disabled:opacity-30 hover:bg-[#DEDBC8]/20 transition-all"
          >
            Previous
          </button>
          <span className="text-[10px] text-gray-500">{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#DEDBC8]/10 text-[#E1E0CC] disabled:opacity-30 hover:bg-[#DEDBC8]/20 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
