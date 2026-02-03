
import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryCard } from '@/components/jitesti/CategoryCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJiTesti } from '@/hooks/useJiTesti';
import { Loader2, Search, Filter, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function TestCategories() {
  const { t, language } = useLanguage();
  const { useCategoriesList } = useJiTesti();
  
  // Use Frappe React SDK hook to fetch categories
  const { data: categories, isLoading, error, mutate } = useCategoriesList();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  // Log data for debugging
  useEffect(() => {
    console.log('[JiTesti] Categories data:', categories);
    console.log('[JiTesti] Loading state:', isLoading);
    console.log('[JiTesti] Error state:', error);
  }, [categories, isLoading, error]);

  // Filter categories based on search and price filter
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((cat) => {
        const name = language === 'sw' ? cat.name_sw : cat.name_en;
        const desc = language === 'sw' ? cat.description_sw : cat.description_en;
        return (
          name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.category_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Price filter
    if (priceFilter !== 'all') {
      if (priceFilter === 'low') {
        filtered = filtered.filter((cat) => cat.price < 30000);
      } else if (priceFilter === 'medium') {
        filtered = filtered.filter((cat) => cat.price >= 30000 && cat.price < 45000);
      } else if (priceFilter === 'high') {
        filtered = filtered.filter((cat) => cat.price >= 45000);
      }
    }

    return filtered;
  }, [categories, searchTerm, priceFilter, language]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>JiTesti</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('jiTesti') || 'JiTesti - Test Yourself'}
          </h1>
          <p className="text-muted-foreground">
            {t('jiTestiDescription') || 'Choose a test category and assess your driving knowledge'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchCategories') || 'Search categories...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('filterByPrice') || 'Filter by price'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPrices') || 'All Prices'}</SelectItem>
              <SelectItem value="low">{t('lowPrice') || 'Low (< 30,000 TZS)'}</SelectItem>
              <SelectItem value="medium">{t('mediumPrice') || 'Medium (30,000 - 45,000 TZS)'}</SelectItem>
              <SelectItem value="high">{t('highPrice') || 'High (> 45,000 TZS)'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              {t('loadingCategories') || 'Loading test categories...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error') || 'Error'}</AlertTitle>
            <AlertDescription>
              {error || 'Failed to load categories'}
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                className="mt-2 ml-2"
              >
                {t('retry') || 'Retry'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* No Data State */}
        {!isLoading && !error && (!categories || categories.length === 0) && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('noData') || 'No Categories Available'}</AlertTitle>
            <AlertDescription>
              {t('noCategoriesMessage') || 'There are no test categories available at the moment. Please check back later or contact support.'}
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                className="mt-2 ml-2"
              >
                {t('refresh') || 'Refresh'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Categories Grid */}
        {!isLoading && !error && categories && categories.length > 0 && (
          <>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {t('noMatchingCategories') || 'No categories match your search criteria'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setPriceFilter('all');
                  }}
                >
                  {t('clearFilters') || 'Clear filters'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </>
        )}

        
       
      </main>

      <Footer />
    </div>
  );
}
