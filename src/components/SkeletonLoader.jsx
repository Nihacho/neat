import React from 'react';

export function SkeletonLoader({ type = 'table', rows = 5 }) {
    if (type === 'table') {
        return (
            <div className="animate-pulse space-y-3">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    return null;
}
