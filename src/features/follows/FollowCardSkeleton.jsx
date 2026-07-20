import { Skeleton } from '../../components/ui/skeleton';

export default function FollowCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 sm:p-5 bg-card border-primary/10">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Skeleton className="w-10 h-10 rounded-lg bg-muted/20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-16 rounded bg-muted/20" />
            <Skeleton className="h-4 w-40 rounded bg-muted/20" />
            <Skeleton className="h-3 w-28 rounded bg-muted/20" />
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Skeleton className="h-5 w-10 rounded bg-muted/20" />
          <Skeleton className="h-8 w-8 rounded-lg bg-muted/20" />
        </div>
      </div>
    </div>
  );
}
