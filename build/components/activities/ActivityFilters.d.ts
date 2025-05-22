interface ActivityFiltersProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: Record<string, string | string[]>) => void;
}
declare const ActivityFilters: ({ onSearch, onFilterChange }: ActivityFiltersProps) => import("react/jsx-runtime").JSX.Element;
export default ActivityFilters;
