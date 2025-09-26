import { Outlet } from 'react-router-dom';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout() {
    return (
        <AuthLayoutTemplate title="Authentification" description="Connexion sécurisée">
            <Outlet />
        </AuthLayoutTemplate>
    );
}
