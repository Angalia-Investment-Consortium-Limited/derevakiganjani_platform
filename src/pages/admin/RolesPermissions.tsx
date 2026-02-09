import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRoles } from '@/hooks/useRoles';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const RolesPermissions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { roles, permissions, isLoading, error, refresh, updateRolePermissions } = useRoles();

  const handlePermissionToggle = async (roleId: string, permissionId: string, isChecked: boolean) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const currentPermissions = role.permissions || [];
    const newPermissions = isChecked
      ? [...currentPermissions, permissionId]
      : currentPermissions.filter(p => p !== permissionId);

    try {
      await updateRolePermissions(roleId, newPermissions);
      toast({ title: t('success'), description: t('permissionsUpdatedSuccessfully') });
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || t('failedToUpdatePermissions'), variant: 'destructive' });
      // Revert UI change on failure
      refresh();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{t('failedToLoadRoles')}: {error}</p>
          <Button onClick={refresh}>{t('retry')}</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('rolesAndPermissions')}</h1>
          <p className="text-muted-foreground mt-1">{t('rolesAndPermissionsDescription')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('permissionMatrix')}</CardTitle>
            <CardDescription>{t('permissionMatrixDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px] font-semibold">{t('feature')}</TableHead>
                    {roles.map(role => (
                      <TableHead key={role.id} className="text-center font-semibold">{role.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <div>{permission.name}</div>
                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={role.id} className="text-center">
                          <Switch
                            checked={role.permissions?.includes(permission.id)}
                            onCheckedChange={(isChecked) => handlePermissionToggle(role.id, permission.id, isChecked)}
                            aria-label={`Toggle ${permission.name} for ${role.name}`}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4"><strong>{t('note')}:</strong> {t('permissionMatrixNote')}</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RolesPermissions;
