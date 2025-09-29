import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContextSimple';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    clearError();
    
    // Validation basique
    const newErrors: ValidationErrors = {};
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const success = await login({
        email: formData.email,
        password: formData.password,
        remember: formData.remember,
      });
      
      if (success) {
        console.log('Login successful, redirecting to /app/pharmacy');
        navigate('/app/pharmacy');
      } else {
        console.log('Login failed');
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Erreur de connexion' });
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">🏥</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Amazon Pharmacie - Système de gestion moderne
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Erreur générale */}
              {(errors.general || error) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general || error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pharmacie.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => handleInputChange('remember', Boolean(checked))}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Se souvenir de moi
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Links */}
              <div className="flex flex-col space-y-2 text-center text-sm">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Mot de passe oublié ?
                </Link>
                
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-gray-600">Pas encore de compte ?</span>
                  <Link 
                    to="/auth/register" 
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Test Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-blue-800">
              <p className="font-semibold mb-2">🧪 Mode Test</p>
              <div className="space-y-1">
                <p><strong>Email:</strong> admin@pharmacie.com</p>
                <p><strong>Mot de passe:</strong> password</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}