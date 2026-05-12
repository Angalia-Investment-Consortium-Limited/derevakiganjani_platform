import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ReceiptViewer from '@/components/shared/ReceiptViewer';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const MyReceipts: React.FC = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [serviceFilter, setServiceFilter] = useState<string>('All Services');
  const [dateFilter, setDateFilter] = useState<string>('All Time');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchReceipts = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'test_attempts'), 
          where('userId', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        const userName = user.full_name || 'Unknown User';
        
        const fetchedReceipts = snapshot.docs
          .map(doc => {
            const data = doc.data();
            if (!['started', 'completed', 'passed', 'failed'].includes(data.status)) {
              return null;
            }
            
            return {
              id: `rcpt_${doc.id}`,
              originalId: doc.id,
              referenceNumber: `TST${data.categoryId?.substring(0, 4) || 'XXXX'}${doc.id.substring(0, 4).toUpperCase()}`,
              issuedAt: data.startTime ? new Date(data.startTime.seconds * 1000).toISOString() : new Date().toISOString(),
              userName: userName,
              serviceName: data.categoryTitle || 'Driving Test Exam',
              paymentMethod: data.paymentMethod || 'mpesa',
              currency: 'TZS',
              amount: data.price || 30000,
              status: data.status,
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b!.issuedAt).getTime() - new Date(a!.issuedAt).getTime());
          
        setReceipts(fetchedReceipts);
      } catch (err) {
        console.error('Error fetching receipts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [user]);

  const filteredReceipts = receipts.filter(receipt => {
    let statusMatch = true;
    if (statusFilter !== 'All Statuses') {
      const isFailed = receipt.status === 'failed';
      const isCompleted = ['completed', 'passed'].includes(receipt.status);
      const isPending = receipt.status === 'started';
      
      if (statusFilter === 'Failed' && !isFailed) statusMatch = false;
      if (statusFilter === 'Completed' && !isCompleted) statusMatch = false;
      if (statusFilter === 'Pending' && !isPending) statusMatch = false;
    }

    let serviceMatch = true;
    if (serviceFilter !== 'All Services') {
      const sName = (receipt.serviceName || '').toLowerCase();
      if (serviceFilter === 'Jitesti' && !sName.includes('test')) serviceMatch = false;
      if (serviceFilter === 'Elimika' && !sName.includes('course')) serviceMatch = false;
      if (serviceFilter === 'CVCreation' && !sName.includes('cv')) serviceMatch = false;
      if (serviceFilter === 'Leseni' && !sName.includes('licen') && !sName.includes('leseni')) serviceMatch = false;
    }

    let dateMatch = true;
    if (dateFilter !== 'All Time') {
      const receiptDate = new Date(receipt.issuedAt);
      const now = new Date();
      if (dateFilter === 'Last 7 Days') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        if (receiptDate < sevenDaysAgo) dateMatch = false;
      } else if (dateFilter === 'Last 30 Days') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        if (receiptDate < thirtyDaysAgo) dateMatch = false;
      } else if (dateFilter === 'This Year') {
        if (receiptDate.getFullYear() !== now.getFullYear()) dateMatch = false;
      }
    }

    return statusMatch && serviceMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE);
  const paginatedReceipts = filteredReceipts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (selectedReceipt) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 relative">
          <button 
            onClick={() => setSelectedReceipt(null)}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
          <ReceiptViewer receipt={selectedReceipt} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 max-w-5xl">
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>My Receipts</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Receipts</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No receipts found</h3>
            <p className="text-gray-500">You haven't made any payments yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="All Services">All Services</option>
                  <option value="Jitesti">Jitesti</option>
                  <option value="Elimika">Elimika</option>
                  <option value="CVCreation">CVCreation</option>
                  <option value="Leseni">Leseni</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="All Time">All Time</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
            </div>

            {filteredReceipts.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500">No receipts match your selected filters.</p>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(receipt.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {receipt.referenceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receipt.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {receipt.currency} {receipt.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            )}
            
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReceipts.length)}</span> of{' '}
                      <span className="font-medium">{filteredReceipts.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyReceipts;
