import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Custom format function for dates
const formatDate = (timestamp: any) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
};

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail Dialog State
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch latest 200 logs
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(200));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(fetchedLogs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching audit logs: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
          log.action?.toLowerCase().includes(lowerQuery) ||
          log.targetId?.toLowerCase().includes(lowerQuery) ||
          log.targetCollection?.toLowerCase().includes(lowerQuery)
      );
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    return 'outline';
  };

  const handleViewDetails = (log: any) => {
      setSelectedLog(log);
      setIsDialogOpen(true);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground mt-1">Review system and administrator actions in real-time.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Action History</CardTitle>
            <CardDescription>Recent changes across critical collections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex md:w-[300px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Action, ID, Collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead className="w-[100px] text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No audit logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{formatDate(log.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={getActionColor(log.action || '')}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{log.targetCollection?.replace('_', ' ')}</TableCell>
                        <TableCell className="font-mono text-xs">{log.targetId}</TableCell>
                        <TableCell className="text-center">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(log)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Audit Log Details</DialogTitle>
                    <DialogDescription>Detailed view of exactly what changed under this action.</DialogDescription>
                </DialogHeader>
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-bold">Action:</span> {selectedLog.action}</div>
                            <div><span className="font-bold">Collection:</span> {selectedLog.targetCollection}</div>
                            <div><span className="font-bold">Target ID:</span> <span className="font-mono">{selectedLog.targetId}</span></div>
                            <div><span className="font-bold">Time:</span> {formatDate(selectedLog.timestamp)}</div>
                        </div>
                        <div>
                            <span className="font-bold text-sm">Payload / Changes:</span>
                            <pre className="mt-2 bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono">
                                {JSON.stringify(selectedLog.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
