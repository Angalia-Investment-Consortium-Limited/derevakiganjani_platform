import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryCard } from '@/components/jitesti/CategoryCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJiTesti } from '@/hooks/useJiTesti';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestCategories() {
  const { t, language } = useLanguage();
  const { getCategories } = useJiTesti();
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, priceFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[JiTesti] Loading categories...');
      const data = await getCategories();
      console.log('[JiTesti] Categories loaded:', data);
      
      setCategories(data || []);
    } catch (err: any) {
      console.error('[JiTesti] Error loading categories:', err);
      
      // Ensure error message is a string
      let errorMessage = 'Failed to load categories';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((cat) => {
        const name = language === 'sw' ? cat.name_sw : cat.name_en;
        const desc = language === 'sw' ? cat.description_sw : cat.description_en;
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.category_code.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredCategories(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
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
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Categories Grid */}
        {!loading && !error && (
          <>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('noCategories') || 'No categories found'}
                </p>
                {searchTerm && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm('');
                      setPriceFilter('all');
                    }}
                    className="mt-2"
                  >
                    {t('clearFilters') || 'Clear filters'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.name} category={category} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {t('howItWorks') || 'How It Works'}
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>{t('step1') || 'Choose a test category that matches your needs'}</li>
            <li>{t('step2') || 'Complete the payment process'}</li>
            <li>{t('step3') || 'Take the test within the allocated time'}</li>
            <li>{t('step4') || 'Receive your results and certificate (if passed)'}</li>
          </ol>
        </div>
      </main>

      <Footer />
    </div>
  );
}
