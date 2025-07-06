import { Skeleton } from "../../components/ui/skeleton";

export default function FlowEditorSkeleton() {
  return (
    <div className="flex h-screen">
      <aside className="hidden lg:flex w-80 border-r p-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
  );
}
