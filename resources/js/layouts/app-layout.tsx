import { Outlet } from 'react-router-dom';
import NavigationSimple from '@/components/NavigationSimple';

interface AppLayoutProps {
    breadcrumbs?: any[];
}

export default ({ breadcrumbs, ...props }: AppLayoutProps) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <NavigationSimple />
        <main className="max-w-7xl mx-auto">
            <Outlet />
        </main>
    </div>
);
