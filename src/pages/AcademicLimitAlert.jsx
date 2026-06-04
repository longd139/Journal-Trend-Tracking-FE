import * as React from "react";
import { ShieldAlert } from "lucide-react";

export function AcademicLimitAlert({ userRole = "academic", searchCount = 0, maxLimit = 10 }) {
  if (userRole !== "academic") return null;

  return (
    <div className="bg-amber-950/40 border border-amber-500/30 text-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm mb-5">
      <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold text-sm">Gói Tài Khoản Academic User</p>
        <p className="text-xs text-amber-300/80 leading-relaxed">
          Bạn đã sử dụng <strong className="text-amber-400">{searchCount}</strong>/{maxLimit} lượt tìm kiếm trong tháng này. 
          Nâng cấp lên gói <span className="underline font-bold text-amber-300 cursor-pointer hover:text-amber-100">Researcher</span> để mở khóa bộ lọc nâng cao.
        </p>
      </div>
    </div>
  );
}