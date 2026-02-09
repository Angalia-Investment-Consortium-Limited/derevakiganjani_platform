import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreVertical, Download, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const UsersManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const {
    users,
    total,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    toggleUserStatus,
    deleteUser,
    toggling,
    deleting,
    refresh,
  } = useUserManagement();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    refresh();
  }, [roleFilter, statusFilter, searchQuery, refresh]);

  const handleSuspendUser = async (userId: string, userName: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleUserStatus(userId, newStatus);
      
      toast({
        title: t(newStatus ? 'userActivated' : 'userSuspended'),
        description: `${userName} ${t(newStatus ? 'hasBeenActivated' : 'hasBeenSuspended')}`,
      });
      
      refresh();
    } catch (err: any) {
      toast({
        title: t('error'),
        description: err?.message || t('failedToUpdateUserStatus'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      
      toast({
        title: t('userDeleted'),
        description: `${userToDelete.name} ${t('hasBeenDeleted')}`,
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refresh();
    } catch (err: any) {
      toast({
        title: t('error'),
        description: err?.message || t('failedToDeleteUser'),
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    toast({
      title: t('exportStarted'),
      description: t('exportingUserData'),
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Employer': return 'default';
      case 'Driver': return 'secondary';
      default: return 'outline';
    }
  };

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('User Management')}</h1>
              <p className="text-muted-foreground mt-1">{t('Mange Users Description')}</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">
                  {t('failedToLoadUsers')}: {error}
                </p>
                <Button onClick={refresh}>{t('retry')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('usersManagement')}</h1>
            <p className="text-muted-foreground mt-1">{t('manageUsersDescription')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
            <Button onClick={() => navigate('/admin/users/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addUser')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('allUsers')}</CardTitle>
            <CardDescription>
              {t('viewAndManageAllUsers', { total: total.toString() })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchByNamePhoneEmail')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t('filterByRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRoles')}</SelectItem>
                  <SelectItem value="driver">{t('driver')}</SelectItem>
                  <SelectItem value="employer">{t('employer')}</SelectItem>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="suspended">{t('suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('createdOn')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t('noUsersFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.mobile_no || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(user.user_type || '')}>
                            {user.user_type || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.created_on ? new Date(user.created_on).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={toggling}>
                                {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                {t('edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSuspendUser(user.id, user.full_name, user.enabled)}
                              >
                                {user.status === 'Active' ? t('suspend') : t('activate')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(user.id, user.full_name)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('showing', { count: users.length.toString(), total: total.toString() })}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0 || isLoading}
                  >
                    {t('previous')}
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {t('page')} {currentPage + 1} {t('of')} {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                  >
                    {t('next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteUserConfirmation', { name: userToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('deleting')}...
                </>
              ) : (
                t('delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default UsersManagement;
