import { useTranslation } from 'react-i18next';
import * as React from "react";
import { Calendar, Layers, Quote, X } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const currentYear = new Date().getFullYear();
const START_YEAR = 1950;
const YEARS = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) =>
  String(currentYear - i),
);

export function AdvancedFilter({
  filters,
  setFilters,
  clearFilters,
  fieldData = []
}) {
  const { t } = useTranslation('search');

  const handleFieldToggle = (fieldName) => {
    setFilters((prev) => {
      const currentFields = prev.fields || [];
      const nextFields = currentFields.includes(fieldName)
        ? currentFields.filter((f) => f !== fieldName)
        : [...currentFields, fieldName];
      return { ...prev, fields: nextFields };
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    v => v && (!Array.isArray(v) || v.length > 0) && v !== false
  );

  return (
    <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] ring-1 ring-white/[0.04]">
      <div className="rounded-[calc(1rem-1.5px)] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(12,12,20,0.98))' }}>
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#DEDBC8]/[0.02] blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
            {t('filters.title')}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-semibold text-gray-500 hover:text-red-400 transition-colors duration-300 flex items-center gap-1"
            >
              <X size={11} strokeWidth={1.5} />
              {t('filters.clearAll')}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 relative z-10">
          {/* ── Year Range ── */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500 flex items-center gap-1.5">
              <Calendar size={12} strokeWidth={1.5} />
              {t('filters.yearRange')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.startYear || ""}
                onValueChange={(v) => setFilters((p) => ({ ...p, startYear: v }))}
              >
                <SelectTrigger className="w-full h-[34px] px-3 py-0 text-xs rounded-xl
                  !bg-[#0F1219] !border !border-white/[0.06] !text-[#E1E0CC]
                  hover:!border-white/[0.12] focus:ring-1 focus:ring-[#DEDBC8]/10
                  transition-all duration-300 data-[placeholder]:!text-gray-500
                  [&>svg:last-child]:hidden">
                  <SelectValue placeholder={t('filters.startYear')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] !bg-[#131721] !border !border-white/[0.08] !text-[#E1E0CC] rounded-xl shadow-2xl shadow-black/40">
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year} className="text-xs cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.endYear || ""}
                onValueChange={(v) => setFilters((p) => ({ ...p, endYear: v }))}
              >
                <SelectTrigger className="w-full h-[34px] px-3 py-0 text-xs rounded-xl
                  !bg-[#0F1219] !border !border-white/[0.06] !text-[#E1E0CC]
                  hover:!border-white/[0.12] focus:ring-1 focus:ring-[#DEDBC8]/10
                  transition-all duration-300 data-[placeholder]:!text-gray-500
                  [&>svg:last-child]:hidden">
                  <SelectValue placeholder={t('filters.endYear')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] !bg-[#131721] !border !border-white/[0.08] !text-[#E1E0CC] rounded-xl shadow-2xl shadow-black/40">
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year} className="text-xs cursor-pointer data-[highlighted]:!bg-white/[0.06] data-[highlighted]:!text-[#E1E0CC]">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Research Fields ── */}
          {fieldData.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500 flex items-center gap-1.5">
                <Layers size={12} strokeWidth={1.5} />
                {t('filters.researchField')}
              </label>
              <div className="space-y-2">
                {fieldData.map((f) => (
                  <div key={f.n} className="flex items-center space-x-3 px-3 py-2 rounded-xl
                    hover:bg-white/[0.02] transition-colors duration-200">
                    <Checkbox
                      id={`field-${f.n}`}
                      checked={(filters.fields || []).includes(f.n)}
                      onCheckedChange={() => handleFieldToggle(f.n)}
                    />
                    <label
                      htmlFor={`field-${f.n}`}
                      className="text-[12px] font-medium text-[#E1E0CC]/80 cursor-pointer select-none flex-1"
                    >
                      {f.n}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Min Citations ── */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500 flex items-center gap-1.5">
              <Quote size={12} strokeWidth={1.5} />
              {t('filters.minCitations')}
            </label>
            <input
              type="number"
              placeholder="e.g., 500"
              value={filters.minCitations || ""}
              onChange={(e) => setFilters(p => ({ ...p, minCitations: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl text-xs
                bg-[#0F1219] border border-white/[0.06] text-[#E1E0CC]
                placeholder:text-gray-500 outline-none
                focus:border-[#DEDBC8]/20 focus:ring-1 focus:ring-[#DEDBC8]/10
                transition-all duration-300"
            />
          </div>

          {/* ── Open Access Toggle ── */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
            <label
              htmlFor="filter-oa"
              className="text-[12px] font-medium text-[#E1E0CC]/70 cursor-pointer"
            >
              {t('filters.openAccessOnly')}
            </label>
            <Checkbox
              id="filter-oa"
              checked={!!filters.openAccess}
              onCheckedChange={(checked) => setFilters(p => ({ ...p, openAccess: !!checked }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
