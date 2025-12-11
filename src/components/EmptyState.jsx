import React from 'react';
import { Package, FileText, Users, Inbox } from 'lucide-react';

const icons = {
    package: Package,
    file: FileText,
    users: Users,
    inbox: Inbox,
};

export function EmptyState({
    icon = 'inbox',
    title = 'No hay datos',
    description = 'No se encontraron elementos para mostrar',
    action
}) {
    const Icon = icons[icon] || Inbox;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="text-gray-400" size={48} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
}
