import { useTranslation } from 'react-i18next';
import * as React from "react";
import { Calendar, Layers, Quote, X, Check } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";

// Generate year range — from 1960 to current year (academic papers)
const currentYear = new Date().getFullYear();
const START_YEAR = 1960;
const YEARS = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) =>
  String(currentYear - i),
);

// Available "To" years — must be >= selected "From" year
const getToYears = (fromYear) => {
  if (!fromYear) return YEARS;
  return YEARS.filter((y) => Number(y) >= Number(fromYear));
};

// Available "From" years — must be <= selected "To" year
const getFromYears = (toYear) => {
  if (!toYear) return YEARS;
  return YEARS.filter((y) => Number(y) <= Number(toYear));
};

export function AdvancedFilter({
 filters,
 setFilters,
 clearFilters,
 onApply,
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

 const hasActiveFilters = (filters.fields?.length > 0) || filters.pubYearFrom || filters.pubYearTo || filters.minCitations || filters.isOpenAccess || (filters.quartile?.length > 0);

 return (
  <div className="bg-[#0F0F0F] border border-primary/10 rounded-2xl p-5 space-y-5 shadow-lg shadow-black/40">
   {/* Header */}
   <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Filters</span>
    {hasActiveFilters && (
     <button
      type="button"
      onClick={clearFilters}
      className="text-[10px] font-medium text-primary/50 hover:text-primary transition-colors flex items-center gap-1"
     >
      <X size={11} /> Clear all
     </button>
    )}
   </div>

   {/* Filter Row */}
   <div className="flex flex-wrap items-end gap-3">
    {/* Year Range */}
    <div className="space-y-1.5">
     <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
      <Calendar size={11} /> Year
     </label>
     <div className="flex items-center gap-1.5">
      <Select
       value={filters.pubYearFrom || ""}
       onValueChange={(v) => setFilters((p) => ({ ...p, pubYearFrom: v }))}
      >
       <SelectTrigger className="w-[90px] h-[32px] px-2.5 py-0 text-[11px] bg-card border-primary/10 text-foreground hover:border-primary/20 focus:ring-0 rounded-lg [&>svg]:hidden">
        <SelectValue placeholder="From" />
       </SelectTrigger>
       <SelectContent className="max-h-[180px] bg-card border-primary/10 text-foreground rounded-xl">
        {getFromYears(filters.pubYearTo).map((year) => (
         <SelectItem key={year} value={year} className="text-[11px] cursor-pointer">{year}</SelectItem>
        ))}
       </SelectContent>
      </Select>
      <span className="text-gray-600 text-[11px]">–</span>
      <Select
       value={filters.pubYearTo || ""}
       onValueChange={(v) => setFilters((p) => ({ ...p, pubYearTo: v }))}
      >
       <SelectTrigger className="w-[90px] h-[32px] px-2.5 py-0 text-[11px] bg-card border-primary/10 text-foreground hover:border-primary/20 focus:ring-0 rounded-lg [&>svg]:hidden">
        <SelectValue placeholder="To" />
       </SelectTrigger>
       <SelectContent className="max-h-[180px] bg-card border-primary/10 text-foreground rounded-xl">
        {getToYears(filters.pubYearFrom).map((year) => (
         <SelectItem key={year} value={year} className="text-[11px] cursor-pointer">{year}</SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>
    </div>

    {/* Min Citations */}
    <div className="space-y-1.5">
     <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
      <Quote size={11} /> Citations ≥
     </label>
     <input
      type="number"
      placeholder="0"
      value={filters.minCitations || ""}
      onChange={(e) => setFilters(p => ({ ...p, minCitations: e.target.value }))}
      className="w-[100px] h-[32px] px-2.5 py-0 text-[11px] bg-card border border-primary/10 rounded-lg text-foreground placeholder:text-gray-600 outline-none focus:border-primary/30 transition-colors"
     />
    </div>

    {/* Open Access */}
    <div className="flex items-center gap-2 pb-0.5 self-end">
     <Checkbox
      id="filter-oa"
      checked={!!filters.isOpenAccess}
      onCheckedChange={(checked) => setFilters(p => ({ ...p, isOpenAccess: !!checked }))}
     />
     <label htmlFor="filter-oa" className="text-[11px] font-medium text-gray-400 cursor-pointer select-none">
      {t('filters.openAccessOnly') || 'Open Access only'}
     </label>
    </div>
   </div>

   {/* Quartile Filter */}
   <div className="space-y-1.5 pt-1 border-t border-primary/5">
    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
     <Layers size={11} /> Journal Quartile
    </label>
    <div className="flex items-center gap-3">
     {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
      const qColors = { Q1: '#34D399', Q2: '#F59E0B', Q3: '#FB923C', Q4: '#EF4444' };
      const isChecked = (filters.quartile || []).includes(q);
      return (
       <label key={q} className="flex items-center gap-1.5 cursor-pointer select-none">
        <Checkbox
         checked={isChecked}
         onCheckedChange={() => {
          setFilters((p) => {
           const current = p.quartile || [];
           const next = current.includes(q)
            ? current.filter((x) => x !== q)
            : [...current, q];
           return { ...p, quartile: next };
          });
         }}
        />
        <span
         className="text-[11px] font-semibold"
         style={{ color: isChecked ? qColors[q] : '#6B7280' }}
        >
         {q}
        </span>
       </label>
      );
     })}
    </div>
   </div>

   {/* Research Fields */}
   {fieldData.length > 0 && (
    <div className="space-y-2 pt-1 border-t border-primary/5">
     <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
      <Layers size={11} /> {t('filters.researchField') || 'Research Fields'}
     </label>
     <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {fieldData.map((f) => (
       <div key={f.n} className="flex items-center gap-1.5">
        <Checkbox
         id={`field-${f.n}`}
         checked={(filters.fields || []).includes(f.n)}
         onCheckedChange={() => handleFieldToggle(f.n)}
        />
        <label htmlFor={`field-${f.n}`} className="text-[11px] text-gray-400 cursor-pointer select-none hover:text-foreground transition-colors">
         {f.n}
        </label>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Apply Button */}
   <div className="flex justify-end pt-1">
    <Button
     onClick={onApply}
     size="sm"
     className="h-7 px-4 text-[11px] font-semibold rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/80 text-white gap-1.5"
    >
     <Check size={12} />
     Apply Filters
    </Button>
   </div>
  </div>
 );
}
