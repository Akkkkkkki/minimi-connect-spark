export interface ActivityCardProps {
    id: string;
    title: string;
    description: string;
    location: string;
    city?: string;
    country?: string;
    date: string;
    time: string;
    participants: {
        current: number;
        max: number;
    };
    tags: string[];
    imageUrl?: string;
    isParticipant?: boolean;
    status?: 'upcoming' | 'completed';
    activity_type?: string;
    startDateISO?: string;
}
declare const ActivityCard: ({ id, title, description, location, city, country, date, time, participants, tags, imageUrl, isParticipant, status, }: ActivityCardProps) => import("react/jsx-runtime").JSX.Element;
export default ActivityCard;
