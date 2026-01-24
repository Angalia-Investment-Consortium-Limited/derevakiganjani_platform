import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, FileQuestion, TrendingUp, DollarSign } from 'lucide-react';
import type { TestCategory } from '@/types/jitesti';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  category: TestCategory;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const categoryName = language === 'sw' ? category.name_sw : category.name_en;
  const categoryDescription = language === 'sw' ? category.description_sw : category.description_en;

  const handleStartTest = () => {
    navigate(`/jitesti/payment/${category.category_code}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{categoryName}</CardTitle>
            <CardDescription className="line-clamp-2">
              {categoryDescription}
            </CardDescription>
          </div>
          {category.is_active ? (
            <Badge variant="default" className="ml-2">
              {t('active') || 'Active'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              {t('inactive') || 'Inactive'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold">
              {category.price.toLocaleString()} TZS
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{category.duration_minutes} {t('minutes') || 'min'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileQuestion className="h-4 w-4 text-purple-600" />
            <span>{category.total_questions} {t('questions') || 'questions'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <span>{t('passMark') || 'Pass'}: {category.pass_mark}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleStartTest} 
          className="w-full"
          disabled={!category.is_active}
        >
          {t('startTest') || 'Start Test'}
        </Button>
      </CardFooter>
    </Card>
  );
};
