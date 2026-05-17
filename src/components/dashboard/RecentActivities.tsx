
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Type Definitions ---
interface TestAttempt {
    id: string;
    categoryTitle: string;
    startTime?: { toDate: () => Date };
    score?: number;
    passMark: number;
    answers?: object;
    isPassed?: boolean;
}

// --- Data Fetching Hook ---
const useRecentActivities = (userId: string | undefined) => {
    return useQuery<TestAttempt[], Error>({
        queryKey: ['recentActivities', userId],
        queryFn: async () => {
            if (!userId) return [];

            const attemptsRef = collection(db, 'test_attempts');
            // Corrected the query to use 'userId' instead of 'user_id'
            const q = query(
                attemptsRef,
                where('userId', '==', userId),
                orderBy('startTime', 'desc'), // Order by startTime
                limit(5)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as TestAttempt));
        },
        enabled: !!userId,
    });
};

const RecentActivities: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: activities = [], isLoading, error } = useRecentActivities(user?.uid);
    const { t } = useLanguage();

    const handleActivityClick = (activityId: string) => {
        navigate(`/jitesti/results/${activityId}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('recentActivityTitle') || 'Recent Activity'}</CardTitle>
                <CardDescription>{t('recentActivityDesc') || 'Your latest interactions with our services'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading && (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {error && (
                        <p className="text-center text-red-500 py-8">
                            Failed to load recent activity: {error.message}
                        </p>
                    )}

                    {!isLoading && !error && activities.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            {t('noRecentActivity') || 'No recent Jitesti activities found.'}
                        </p>
                    )}

                    {!isLoading && activities.map((activity) => {
                        const isCompleted = activity.score !== undefined && activity.score !== null;
                        const totalQuestions = activity.answers ? Object.keys(activity.answers).length : 0;
                        const scoreCount = activity.score || 0;
                        const percentage = totalQuestions > 0 ? Math.round((scoreCount / totalQuestions) * 100) : 0;
                        const isPassed = activity.isPassed !== undefined ? activity.isPassed : percentage >= activity.passMark;
                        const status = isCompleted ? (isPassed ? t('passed') || 'Passed' : t('failed') || 'Failed') : t('pending') || 'Pending';

                        return (
                            <div 
                                key={activity.id} 
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleActivityClick(activity.id)}
                            >
                                <div className="flex-1">
                                    <p className="font-medium">Jitesti - {activity.categoryTitle}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.startTime?.toDate ? activity.startTime.toDate().toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isCompleted && (
                                        <span className="text-sm font-medium">
                                           {percentage}%
                                        </span>
                                    )}
                                    <Badge variant={status === t('passed') || status === 'Passed' ? 'default' : status === t('pending') || status === 'Pending' ? 'secondary' : 'destructive'}>
                                        {status}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentActivities;
