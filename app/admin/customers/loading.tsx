export default function CustomersLoading() {
    return (
        <div className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters skeleton */}
            <div className="border rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Table skeleton */}
            <div className="border rounded-lg">
                <div className="p-6 border-b">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                                </div>
                                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
