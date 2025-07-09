import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="mt-1 h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-1 h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="mt-1 h-4 w-12" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="mt-1 h-4 w-16" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
