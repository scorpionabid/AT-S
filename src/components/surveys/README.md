# Survey Components

Bu qovluq survey (sorğu) ilə əlaqəli bütün komponentləri ehtiva edir. Təşkil edilmiş struktur:

## 📁 Directory Structure

```
surveys/
├── index.ts                 # Main export file
├── management/              # Survey creation, editing, listing
│   ├── SurveyCreateForm.tsx
│   ├── SurveyEditForm.tsx
│   ├── SurveysList.tsx
│   └── SurveyResponseForm.tsx
├── targeting/               # Institution/user targeting
│   ├── SurveyTargetingForm.tsx
│   ├── InstitutionTreeSelector.tsx
│   ├── BulkSelectionModal.tsx
│   ├── TargetingPresets.tsx
│   └── RecipientEstimationDisplay.tsx
└── analytics/               # Survey analytics & stats
    ├── SurveyAnalyticsView.tsx
    └── SurveyStatsOverview.tsx
```

## 🎯 Component Responsibilities

### Management Components
- **SurveyCreateForm**: Wizard-style survey creation with 5 steps
- **SurveyEditForm**: Survey editing interface
- **SurveysList**: Survey listing with filtering and pagination
- **SurveyResponseForm**: User survey response form

### Targeting Components  
- **SurveyTargetingForm**: Main targeting interface
- **InstitutionTreeSelector**: Hierarchical institution selection
- **BulkSelectionModal**: Bulk institution selection
- **TargetingPresets**: Predefined targeting configurations
- **RecipientEstimationDisplay**: Recipient count estimation

### Analytics Components
- **SurveyAnalyticsView**: Survey results analysis
- **SurveyStatsOverview**: Survey statistics overview

## 📦 Usage

```typescript
// Import individual components
import { SurveyCreateForm, SurveyTargetingForm } from '../surveys';

// Or import specific component
import SurveyCreateForm from '../surveys/management/SurveyCreateForm';
```

## 🔧 Key Features

- **Modern TypeScript** - Full type safety
- **Internationalization** - i18next support
- **Responsive Design** - Mobile-friendly
- **Validation** - Form validation with error handling
- **Real-time Updates** - Live recipient estimation
- **Accessibility** - ARIA support and keyboard navigation

## 🚀 Recent Improvements

- ✅ Eliminated code duplication (removed ~1000 lines)
- ✅ Consolidated targeting functionality
- ✅ Modern component architecture
- ✅ Organized directory structure
- ✅ Fixed all import paths
- ✅ Created unified export system