# 🌐 Internationalization (i18n) - Assist Craft Dashboard

## 📋 Overview

This project uses a modular TypeScript-based internationalization system that provides type safety, autocompletion, and organized translations by feature modules.

## 🏗️ Architecture

### Structure

```
src/modules/shared/presentation/i18n/
├── i18n.ts                    # Main i18n configuration
├── index.ts                   # Centralized exports
├── locales/
│   ├── en.ts                 # English translations (main)
│   ├── es.ts                 # Spanish translations
│   ├── common/               # Common translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── navigation/           # Navigation translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── dashboard/            # Dashboard module translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── profile/              # Profile module translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── training/             # Training module translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── assistant/            # Assistant module translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── configuration/        # Configuration module translations
│   │   ├── en.ts
│   │   └── es.ts
│   ├── errors/               # Error messages
│   │   ├── en.ts
│   │   └── es.ts
│   └── success/              # Success messages
│       ├── en.ts
│       └── es.ts
```

## 🚀 Features

### ✅ Type Safety

- **Full TypeScript support** with autocompletion
- **Type-safe translation keys** with nested path support
- **Compile-time validation** of translation keys

### ✅ Modular Organization

- **Separated by feature modules** for better maintainability
- **Common translations** for shared UI elements
- **Easy to add new languages** or modules

### ✅ Developer Experience

- **IntelliSense support** in IDEs
- **Automatic key validation** at compile time
- **Easy refactoring** with TypeScript

## 🛠️ Usage

### Basic Usage

```typescript
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
    </div>
  );
};
```

### Language Switching

```typescript
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

const LanguageSwitcher = () => {
  const { changeLanguage, getCurrentLanguage } = useTranslation();

  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};
```

### Type-Safe Keys

```typescript
// ✅ This will have autocompletion and type checking
t('dashboard.stats.totalTrainings'); // ✅ Valid
t('profile.companyInfo'); // ✅ Valid
t('invalid.key'); // ❌ TypeScript error
```

## 📝 Adding New Translations

### 1. Add to Module-Specific File

```typescript
// src/modules/shared/presentation/i18n/locales/dashboard/en.ts
export const dashboard = {
  title: 'Dashboard',
  newFeature: 'New Feature', // ← Add new key
  // ... existing keys
} as const;
```

### 2. Add to All Languages

```typescript
// src/modules/shared/presentation/i18n/locales/dashboard/es.ts
export const dashboard = {
  title: 'Panel de Control',
  newFeature: 'Nueva Funcionalidad', // ← Add translation
  // ... existing keys
} as const;
```

### 3. Use in Components

```typescript
const { t } = useTranslation();
return <h2>{t('dashboard.newFeature')}</h2>; // ✅ Type-safe!
```

## 🔧 Configuration

### Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Secondary language

### Language Detection

- **localStorage** - Remembers user preference
- **navigator** - Detects browser language
- **htmlTag** - Falls back to HTML lang attribute

### Fallback Behavior

- Falls back to English if translation key is missing
- Shows key path if translation is completely missing

## 🎯 Benefits

1. **Type Safety**: Compile-time validation prevents typos
2. **Modular**: Easy to maintain and organize translations
3. **Developer Experience**: Full IntelliSense support
4. **Performance**: Tree-shaking friendly structure
5. **Scalability**: Easy to add new languages or modules

## 📚 Best Practices

1. **Use descriptive keys**: `dashboard.stats.totalTrainings` not `d.s.t`
2. **Group by feature**: Keep related translations together
3. **Consistent naming**: Use camelCase for keys
4. **Add comments**: Document complex translations
5. **Test both languages**: Ensure all keys are translated

---

**This i18n system provides a robust, type-safe, and maintainable solution for internationalization in the Assist Craft Dashboard.**
