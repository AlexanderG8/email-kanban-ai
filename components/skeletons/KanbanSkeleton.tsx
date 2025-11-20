"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 h-full overflow-hidden pb-4">
      {/* Three columns */}
      {[1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col h-full min-w-[280px] max-w-[350px] flex-1">
          {/* Column Header */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg border-b bg-gray-50">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-5 w-8 rounded-full" />
          </div>

          {/* Cards Container */}
          <div className="flex-1 bg-gray-50/50 rounded-b-lg border border-t-0 p-2 space-y-2">
            {/* Skeleton cards */}
            {[1, 2, 3].map((card) => (
              <Card key={card}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmailBandejaSkeleton() {
  return (
    <div className="flex flex-col w-72 border-r bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Import Button */}
      <div className="p-3 border-b">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Email List */}
      <div className="p-2 space-y-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="p-2 rounded-lg">
            <div className="flex items-start gap-2">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <EmailBandejaSkeleton />
      <div className="flex-1 p-4 overflow-hidden">
        <KanbanSkeleton />
      </div>
    </div>
  );
}
