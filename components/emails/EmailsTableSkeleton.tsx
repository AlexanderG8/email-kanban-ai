export function EmailsTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar skeleton */}
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />

              <div className="flex-1 min-w-0 space-y-2">
                {/* Name skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                {/* Email skeleton */}
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>

            {/* Badge skeleton */}
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
          </div>

          {/* Subject skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            {/* Snippet skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
