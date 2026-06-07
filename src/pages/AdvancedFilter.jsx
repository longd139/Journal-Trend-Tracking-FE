import * as React from "react";
import { Filter, SlidersHorizontal, Calendar, Layers, Quote } from "lucide-react";
// Import chuẩn xác theo cấu trúc thư mục của bạn
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";

export function AdvancedFilter({ 
  userRole = "academic", 
  filters, 
  setFilters, 
  clearFilters, 
  fieldData = [] 
}) {
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
    <Card className="bg-[#1B2235] border-white/5 relative overflow-hidden h-fit rounded-xl shadow-sm">
      {userRole === "academic" && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
          <SlidersHorizontal className="w-6 h-6 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-slate-300">Feature Locked</p>
          <p className="text-[11px] text-slate-500 mt-1 px-4 leading-relaxed">
            Advanced filtering by year and citations is exclusive to Premium Researchers.
          </p>
        </div>
      )}

      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-white flex items-center gap-2 uppercase tracking-wider font-bold">
            <Filter size={13} className="text-blue-400" /> Advanced Filter
          </CardTitle>
          <button 
            type="button"
            onClick={clearFilters} 
            className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Calendar size={13} /> Publication Year
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="From" 
              value={filters.startYear || ""}
              onChange={(e) => setFilters(p => ({ ...p, startYear: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[#121824]/60 border border-white/5 rounded-md text-xs text-slate-200 outline-none focus:border-blue-500/50"
            />
            <input 
              type="number" 
              placeholder="To" 
              value={filters.endYear || ""}
              onChange={(e) => setFilters(p => ({ ...p, endYear: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[#121824]/60 border border-white/5 rounded-md text-xs text-slate-200 outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Layers size={13} /> Research Field
          </label>
          <div className="space-y-2.5 pt-1">
            {fieldData.map((f) => (
              <div key={f.n} className="flex items-center space-x-2.5">
                <Checkbox 
                  id={`field-${f.n}`}
                  checked={(filters.fields || []).includes(f.n)}
                  onCheckedChange={() => handleFieldToggle(f.n)}
                />
                <label htmlFor={`field-${f.n}`} className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  {f.n}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Quote size={13} /> Minimum Citations
          </label>
          <input 
            type="number" 
            placeholder="e.g., 500" 
            value={filters.minCitations || ""}
            onChange={(e) => setFilters(p => ({ ...p, minCitations: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-[#121824]/60 border border-white/5 rounded-md text-xs text-slate-200 outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <label htmlFor="filter-oa" className="text-xs font-medium text-slate-400 cursor-pointer">Open Access articles only</label>
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