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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const UsersManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

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

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [userToMessage, setUserToMessage] = useState<{ id: string; name: string; role: string; email: string } | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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
        description: err?.message || t('Failed To Update User Status'),
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
        title: t('User Deleted'),
        description: `${userToDelete.name} ${t('Has Been Deleted')}`,
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refresh();
    } catch (err: any) {
      toast({
        title: t('error'),
        description: err?.message || t('Failed To Delete User'),
        variant: 'destructive',
      });
    }
  };

  const handleSendMessageClick = (userId: string, userName: string, role: string, email: string) => {
    setUserToMessage({ id: userId, name: userName, role, email });
    setMessageContent('');
    setMessageDialogOpen(true);
  };

  const handleSendMessageConfirm = async () => {
    if (!userToMessage || !messageContent.trim() || !currentUser?.uid) return;

    try {
      setIsSendingMessage(true);
      
      const isEmployer = userToMessage.role === 'Employer';

      if (isEmployer) {
        const ticketRef = doc(collection(db, 'employer_tickets'));
        await setDoc(ticketRef, {
          subject: "Message from Admin",
          description: messageContent,
          status: "Open",
          employerId: userToMessage.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        const msgRef = doc(collection(db, 'employer_tickets', ticketRef.id, 'messages'));
        await setDoc(msgRef, {
          senderId: currentUser.uid,
          senderRole: 'admin',
          senderName: 'Admin',
          text: messageContent,
          createdAt: Timestamp.now()
        });
      } else {
        const ticketRef = doc(collection(db, 'license_requests'));
        await setDoc(ticketRef, {
          subject: "Message from Admin",
          details: "Please see admin response.",
          adminNotes: messageContent,
          status: "in-review",
          userId: userToMessage.id,
          email: userToMessage.email || 'N/A',
          fullName: userToMessage.name || 'N/A',
          submittedOn: Timestamp.now(),
          lastUpdated: Timestamp.now()
        });
      }

      // Create system notification
      await setDoc(doc(collection(db, 'notifications')), {
        type: 'SYSTEM',
        status: 'PENDING',
        userId: userToMessage.id,
        title: 'New Message from Support',
        message: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
        createdAt: Timestamp.now(),
        read: false,
        isRead: false
      });

      // Create email notification
      if (userToMessage.email && userToMessage.email !== 'N/A') {
        await setDoc(doc(collection(db, 'mail')), {
          to: userToMessage.email,
          message: {
            subject: 'New Support Message from Dereva Kiganjani',
            html: `<p>Hello ${userToMessage.name},</p><p>You have received a new message from the admin team:</p><p><em>"${messageContent}"</em></p><p>Please open the Dereva Kiganjani app to view the full details and respond if necessary.</p>`,
            text: `Hello ${userToMessage.name},\n\nYou have received a new message from the admin team:\n\n"${messageContent}"\n\nPlease open the Dereva Kiganjani app to view the full details.`
          }
        });
      }

      toast({
        title: 'Message Sent',
        description: `Your message has been sent to ${userToMessage.name}.`,
      });

      setMessageDialogOpen(false);
      setUserToMessage(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleExport = () => {
    toast({
      title: t('Export Started'),
      description: t('Exporting User Data'),
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
                  {t('Failed To Load Users')}: {error}
                </p>
                <Button onClick={refresh}>{t('Retry')}</Button>
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
            <h1 className="text-3xl font-bold">{t('Users Management')}</h1>
            <p className="text-muted-foreground mt-1">{t('Manage Users Description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('Export')}
            </Button>
            <Button onClick={() => navigate('/admin/users/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Add User')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('All Users')}</CardTitle>
            <CardDescription>
              {t('View And Manage All Users', { total: total.toString() })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('Search By Name Phone Email')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t('Filter By Role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Roles')}</SelectItem>
                  <SelectItem value="driver">{t('Driver')}</SelectItem>
                  <SelectItem value="employer">{t('Employer')}</SelectItem>
                  <SelectItem value="admin">{t('Admin')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Statuses')}</SelectItem>
                  <SelectItem value="active">{t('Active')}</SelectItem>
                  <SelectItem value="suspended">{t('Suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('Email')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('Created On')}</TableHead>
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
                        {t('No Users Found')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                        <TableCell>{user.mobile_no || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(user.roles?.[0] || '')}>
                            {user.roles?.join(', ') || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}
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
                                onClick={() => handleSendMessageClick(user.id, user.full_name || 'User', user.roles?.[0] || 'Driver', user.email || '')}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                {t('Send Message') || 'Send Message'}
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
                  {t('Showing', { count: users.length.toString(), total: total.toString() })}
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
            <AlertDialogTitle>{t('Are You Sure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Delete User Confirmation', { name: userToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('Deleting')}...
                </>
              ) : (
                t('Delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Start a new conversation with {userToMessage?.name}. They will be able to reply from their support section.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)} disabled={isSendingMessage}>
              Cancel
            </Button>
            <Button onClick={handleSendMessageConfirm} disabled={isSendingMessage}>
              {isSendingMessage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersManagement;