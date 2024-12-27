import { Activity, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
    selectedTag: string | null;
    activeFilter: string;
    getTimeSpent: (activeFilter: string) => string;
    filteredByTagTimers: any[];
    getTotalTimeRemaining?: () => string;
    getTotalQueuedTimers?: () => number;
    getTotalCompletedTimers?: () => number;
}

export default function DashboardHeader({
    selectedTag,
    activeFilter,
    getTimeSpent,
    filteredByTagTimers,
    getTotalTimeRemaining
}: DashboardHeaderProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Card */}
            <div className={cn(
                "bg-gradient-to-br from-white to-slate-50",
                "p-4 rounded-xl border shadow-sm",
                "hover:shadow-md transition-all duration-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Current Status</p>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {selectedTag
                                ? `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1).toLowerCase()} - ${selectedTag}`
                                : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1).toLowerCase()}`
                            }
                        </h2>
                    </div>
                </div>
            </div>

            {/* Time Card */}
            <div className={cn(
                "bg-gradient-to-br from-white to-slate-50",
                "p-4 rounded-xl border shadow-sm",
                "hover:shadow-md transition-all duration-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">
                            {(() => {
                                switch (activeFilter) {
                                    case 'COMPLETED':
                                        return 'Time Completed Today'
                                    case 'QUEUED':
                                        return 'Total Time Remaining';
                                    default:
                                        return 'Total Time Spent';
                                }
                            })()}
                        </p>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {activeFilter === 'QUEUED' && getTotalTimeRemaining
                                ? getTotalTimeRemaining()
                                : getTimeSpent(activeFilter)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Count Card */}
            <div className={cn(
                "bg-gradient-to-br from-white to-slate-50",
                "p-4 rounded-xl border shadow-sm",
                "hover:shadow-md transition-all duration-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Hash className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">
                            {(() => {
                                switch (activeFilter) {
                                    case 'ACTIVE':
                                        return 'Active Timers';
                                    case 'COMPLETED':
                                        return 'Completed Timers';
                                    case 'QUEUED':
                                        return 'Queued Timers';
                                    default:
                                        return 'All Timers';
                                }
                            })()}
                        </p>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {filteredByTagTimers.length} {filteredByTagTimers.length === 1 ? 'Timer' : 'Timers'}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}