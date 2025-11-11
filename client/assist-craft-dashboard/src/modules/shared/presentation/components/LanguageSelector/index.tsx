import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { changeLanguage, getCurrentLanguage, getAvailableLanguages } =
    useTranslation();

  const currentLanguage = getCurrentLanguage();
  const languages = getAvailableLanguages();

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  const { t } = useTranslation();

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={t('common.selectLanguage')} />
      </SelectTrigger>
      <SelectContent>
        {languages.map(language => (
          <SelectItem key={language.code} value={language.code}>
            <div className='flex items-center gap-2'>
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
