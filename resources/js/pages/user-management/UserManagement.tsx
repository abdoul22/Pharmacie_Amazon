import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  LoaderCircle
} from 'lucide-react';
import { useAuthContext, User as AuthUser } from '@/contexts/AuthContextSimple';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
  status: string;
  status_label: string;
  last_login_formatted: string;
  created_at_formatted: string;
  permissions: string[];
  approved_by?: number;
  approved_at?: string;
  suspended_by?: number;
  suspended_at?: string;
  suspension_reason?: string;
}

interface Role {
  value: string;
  label: string;
  description: string;
  permissions_count: number;
}

interface UserStats {
  total_users: number;
  pending_approval: number;
  approved_users: number;
  roles_distribution: {
    superadmin: number;
    admin: number;
    pharmacien: number;
    vendeur: number;
    caissier: number;
  };
}

export default function UserManagement() {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // États des modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  // Charger les données
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      console.log('UserManagement - Token:', token ? 'exists' : 'none');
      console.log('UserManagement - Token value:', token ? token.substring(0, 20) + '...' : 'none');
      console.log('UserManagement - localStorage token:', localStorage.getItem('auth_token'));
      console.log('UserManagement - sessionStorage token:', sessionStorage.getItem('auth_token'));
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      // Forcer un plus grand nombre par page et tri récent d'abord
      params.append('per_page', '50');
      params.append('sort', 'created_at');
      params.append('direction', 'desc');

      const response = await fetch(`/api/user-management/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }

      const data = await response.json();
      const usersArray = data?.data?.data ?? data?.data ?? [];
      console.log('UserManagement - API users count:', Array.isArray(usersArray) ? usersArray.length : 'n/a');
      if (Array.isArray(usersArray) && usersArray[0]) {
        console.log('UserManagement - First user sample:', {
          id: usersArray[0].id,
          email: usersArray[0].email,
          role: usersArray[0].role,
          is_approved: usersArray[0].is_approved,
        });
      }
      setUsers(usersArray);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const response = await fetch('/api/user-management/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
    }
  };

  const handleApproveUser = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setActionLoading('approve');
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/user-management/users/${selectedUser.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'approbation');
      }

      await loadUsers();
      setApproveModalOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading('suspend');
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/user-management/users/${selectedUser.id}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reason: suspensionReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suspension');
      }

      await loadUsers();
      setSuspendModalOpen(false);
      setSelectedUser(null);
      setSuspensionReason('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setActionLoading('role-change');
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/user-management/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de rôle');
      }

      await loadUsers();
      setRoleChangeModalOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading('delete');
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/user-management/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      await loadUsers();
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.status) {
      return <Badge variant="outline">Inconnu</Badge>;
    }

    switch (user.status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Suspendu</Badge>;
      case 'active':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    if (!role) {
      return <Badge className="bg-gray-500 text-white">Inconnu</Badge>;
    }

    const roleColors: { [key: string]: string } = {
      superadmin: 'bg-red-500',
      admin: 'bg-purple-500',
      pharmacien: 'bg-blue-500',
      vendeur: 'bg-green-500',
      caissier: 'bg-orange-500',
    };

    return (
      <Badge className={`${roleColors[role] || 'bg-gray-500'} text-white`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Accès non autorisé. Seuls les SuperAdmin peuvent gérer les utilisateurs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Approbation, attribution des rôles et gestion des comptes utilisateurs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending_approval}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SuperAdmin</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.roles_distribution.superadmin}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="superadmin">SuperAdmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pharmacien">Pharmacien</SelectItem>
                <SelectItem value="vendeur">Vendeur</SelectItem>
                <SelectItem value="caissier">Caissier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            Gérez les utilisateurs, leurs rôles et leur statut d'approbation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.last_login_formatted}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.created_at_formatted}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {user.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedUser(user);
                              setApproveModalOpen(true);
                            }}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {user.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setRoleChangeModalOpen(true);
                              setSelectedRole(user.role);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {user.status !== 'suspended' && user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setSuspendModalOpen(true);
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {user.id !== currentUser?.id && user.role !== 'superadmin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal d'approbation */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver l'utilisateur</DialogTitle>
            <DialogDescription>
              Attribuer un rôle à {selectedUser?.name} et approuver son compte.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rôle à attribuer</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleApproveUser}
              disabled={!selectedRole || actionLoading === 'approve'}
            >
              {actionLoading === 'approve' ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suspension */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'utilisateur</DialogTitle>
            <DialogDescription>
              Suspendre le compte de {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Raison de la suspension (optionnel)</label>
              <Input
                placeholder="Ex: Violation des règles..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleSuspendUser}
              disabled={actionLoading === 'suspend'}
            >
              {actionLoading === 'suspend' ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal changement de rôle */}
      <Dialog open={roleChangeModalOpen} onOpenChange={setRoleChangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nouveau rôle</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleChangeRole}
              disabled={!selectedRole || actionLoading === 'role-change'}
            >
              {actionLoading === 'role-change' ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              ⚠️ Cette action est irréversible. Supprimer définitivement {selectedUser?.name} ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
