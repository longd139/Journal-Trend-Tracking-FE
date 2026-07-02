import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";

export function AcademicLimitAlert({ userRole = "academic_user", searchCount = 0, maxLimit = 10 }) {
 const { t } = useTranslation('common');

 if (userRole !== "academic_user") return null;

 return (
 <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm mb-5 ">
  <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
  <div className="space-y-1">
  <p className="font-semibold text-sm">{t('sidebar.unverified')}</p>
  <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
   You have used <strong className="text-amber-700 dark:text-amber-400">{searchCount}</strong>/{maxLimit} searches this month. Upgrade to unlock advanced filters.
  </p>
  </div>
 </div>
 );
}
