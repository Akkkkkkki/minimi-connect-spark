interface ActivityListProps {
    onSelectActivity: (id: string) => void;
    statusFilter?: 'upcoming' | 'completed';
}
declare const ActivityList: ({ onSelectActivity, statusFilter }: ActivityListProps) => import("react/jsx-runtime").JSX.Element;
export default ActivityList;
