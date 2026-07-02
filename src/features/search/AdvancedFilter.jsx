import { useTranslation } from 'react-i18next';
import * as React from "react";
import { Filter, Calendar, Layers, Quote, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Generate year range — from 1950 to current year
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

 return (
 <Card className="bg-[#101010] border-[#DEDBC8]/5 relative overflow-hidden h-fit rounded-xl shadow-sm ">
  <CardHeader className="pb-3 border-b border-gray-200 border-[#DEDBC8]/5 ">
  <div className="flex items-center justify-between">
   <CardTitle className="text-xs text-[#E1E0CC] flex items-center gap-2 uppercase tracking-wider font-bold">
   <Filter size={13} className="text-[#DEDBC8] dark:text-blue-400" /> {t('filters.title')}
   </CardTitle>
   <button
   type="button"
   onClick={clearFilters}
   className="text-[11px] text-gray-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
   >
   {t('filters.clearAll')}
   </button>
  </div>
  </CardHeader>

  <CardContent className="space-y-5 pt-4">
  {/* ── Year Range ── */}
  <div className="space-y-2">
   <label className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
   <Calendar size={13} /> {t('filters.yearRange')}
   </label>
   <div className="grid grid-cols-2 gap-2">
   {/* Start Year */}
   <div className="relative">
    <Select
     value={filters.startYear || ""}
     onValueChange={(v) => setFilters((p) => ({ ...p, startYear: v }))}
    >
     <SelectTrigger className="w-full h-[34px] px-2.5 py-0 text-xs bg-[#121824]/60 border-[#DEDBC8]/5 text-slate-200 hover:border-[#DEDBC8]/20 focus:ring-0 rounded-md [&>svg]:hidden">
      <SelectValue placeholder={t('filters.startYear')} />
     </SelectTrigger>
     <SelectContent className="max-h-[200px] bg-[#101010] border-[#DEDBC8]/10 text-[#E1E0CC] rounded-xl">
      {YEARS.map((year) => (
       <SelectItem key={year} value={year} className="text-xs cursor-pointer">
        {year}
       </SelectItem>
      ))}
     </SelectContent>
    </Select>
    {filters.startYear && (
     <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setFilters((p) => ({ ...p, startYear: '' })); }}
      className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
     >
      <X size={11} />
     </button>
    )}
   </div>

   {/* End Year */}
   <div className="relative">
    <Select
     value={filters.endYear || ""}
     onValueChange={(v) => setFilters((p) => ({ ...p, endYear: v }))}
    >
     <SelectTrigger className="w-full h-[34px] px-2.5 py-0 text-xs bg-[#121824]/60 border-[#DEDBC8]/5 text-slate-200 hover:border-[#DEDBC8]/20 focus:ring-0 rounded-md [&>svg]:hidden">
      <SelectValue placeholder={t('filters.endYear')} />
     </SelectTrigger>
     <SelectContent className="max-h-[200px] bg-[#101010] border-[#DEDBC8]/10 text-[#E1E0CC] rounded-xl">
      {YEARS.map((year) => (
       <SelectItem key={year} value={year} className="text-xs cursor-pointer">
        {year}
       </SelectItem>
      ))}
     </SelectContent>
    </Select>
    {filters.endYear && (
     <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setFilters((p) => ({ ...p, endYear: '' })); }}
      className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
     >
      <X size={11} />
     </button>
    )}
   </div>
   </div>
  </div>

  <div className="space-y-2">
   <label className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
   <Layers size={13} /> {t('filters.researchField')}
   </label>
   <div className="space-y-2.5 pt-1">
   {fieldData.map((f) => (
    <div key={f.n} className="flex items-center space-x-2.5">
    <Checkbox
     id={`field-${f.n}`}
     checked={(filters.fields || []).includes(f.n)}
     onCheckedChange={() => handleFieldToggle(f.n)}
    />
    <label htmlFor={`field-${f.n}`} className="text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer select-none">
     {f.n}
    </label>
    </div>
   ))}
   </div>
  </div>

  <div className="space-y-2">
   <label className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
   <Quote size={13} /> {t('filters.minCitations')}
   </label>
   <input
   type="number"
   placeholder="e.g., 500"
   value={filters.minCitations || ""}
   onChange={(e) => setFilters(p => ({ ...p, minCitations: e.target.value }))}
   className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#121824]/60 border border-gray-200 border-[#DEDBC8]/5 rounded-md text-xs text-gray-900 dark:text-slate-200 outline-none focus:border-blue-500/50"
   />
  </div>

  <div className="flex items-center justify-between pt-2 border-t border-gray-200 border-[#DEDBC8]/5">
   <label htmlFor="filter-oa" className="text-xs font-medium text-gray-600 dark:text-slate-400 cursor-pointer">{t('filters.openAccessOnly')}</label>
   <Checkbox
   id="filter-oa"
   checked={!!filters.openAccess}
   onCheckedChange={(checked) => setFilters(p => ({ ...p, openAccess: !!checked }))}
   />
  </div>
  </CardContent>
 </Card>
 );
}
