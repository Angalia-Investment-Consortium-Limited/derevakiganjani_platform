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
import { useUserManagement } from '@/hooks/useUsers';
import useDebounce from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const UsersManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, translations } = useLanguage();

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

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Refresh data when debounced search changes
  useEffect(() => {
    refresh();
  }, [debouncedSearchQuery, roleFilter, statusFilter, currentPage, refresh]);

  const handleSuspendUser = async (userId: string, userName: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleUserStatus(userId, newStatus);
      
      toast({
        title: newStatus ? translations.userActivated : translations.userSuspended,
        description: `${userName} ` + (newStatus ? translations.hasBeenActivated : translations.hasBeenSuspended),
      });
      
      // Refresh the list
      refresh();
    } catch (err: any) {
      toast({
        title: translations.error,
        description: err?.message || translations.failedToUpdateUserStatus,
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
        title: translations.userDeleted,
        description: `${userToDelete.name} ` + translations.hasBeenDeleted,
      });
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // Refresh the list
      refresh();
    } catch (err: any) {
      toast({
        title: translations.error,
        description: err?.message || translations.failedToDeleteUser,
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    toast({
      title: translations.exportStarted,
      description: translations.exportingUserData,
    });
    // TODO: Implement actual export logic
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'destructive';
      case 'Employer':
        return 'default';
      case 'Driver':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Show error state
  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{translations.usersManagement}</h1>
              <p className="text-muted-foreground mt-1">{translations.manageUsersDescription}</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">
                  {translations.failedToLoadUsers}: {typeof error === 'string' ? error : error?.message || 'Unknown error'}
                </p>
                <Button onClick={refresh}>{translations.retry}</Button>
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
            <h1 className="text-3xl font-bold">{translations.usersManagement}</h1>
            <p className="text-muted-foreground mt-1">{translations.manageUsersDescription}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {translations.export}
            </Button>
            <Button onClick={() => navigate('/admin/users/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {translations.addUser}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{translations.allUsers}</CardTitle>
            <CardDescription>
              {translations.viewAndManageAllUsers.replace('{total}', total.toString())}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={translations.searchByNamePhoneEmail}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={translations.filterByRole} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translations.allRoles}</SelectItem>
                  <SelectItem value="driver">{translations.driver}</SelectItem>
                  <SelectItem value="employer">{translations.employer}</SelectItem>
                  <SelectItem value="admin">{translations.admin}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={translations.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translations.allStatuses}</SelectItem>
                  <SelectItem value="active">{translations.active}</SelectItem>
                  <SelectItem value="suspended">{translations.suspended}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{translations.name}</TableHead>
                    <TableHead>{translations.phone}</TableHead>
                    <TableHead>{translations.email}</TableHead>
                    <TableHead>{translations.role}</TableHead>
                    <TableHead>{translations.status}</TableHead>
                    <TableHead>{translations.createdOn}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton
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
                        {translations.noUsersFound}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
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
                                {toggling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                {translations.edit}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSuspendUser(user.id, user.name, user.enabled)}
                              >
                                {user.status === 'Active' ? translations.suspend : translations.activate}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(user.id, user.name)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {translations.delete}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {translations.showing.replace('{count}', users.length.toString()).replace('{total}', total.toString())}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0 || isLoading}
                  >
                    {translations.previous}
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {translations.page} {currentPage + 1} {translations.of} {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                  >
                    {translations.next}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.areYouSure}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.deleteUserConfirmation.replace('{name}', userToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{translations.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {translations.deleting}...
                </>
              ) : (
                translations.delete
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default UsersManagement;
