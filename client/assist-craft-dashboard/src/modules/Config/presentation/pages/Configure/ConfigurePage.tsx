import {
  ConfigurationHeader,
  ConfigurationLoader,
  ConfigurationTabs,
} from '@/modules/Config/presentation/components';

import { useConfigurePage } from './useConfigurePage';

/**
 * Configure Page Component
 * Main page for bot configuration management
 */
export const ConfigurePage = () => {
  const {
    config,
    loading,
    saving,
    errors,
    hasChanges,
    handleSave,
    handleConfigChange,
  } = useConfigurePage();

  if (loading || !config) {
    return <ConfigurationLoader />;
  }

  return (
    <div className='space-y-6'>
      <ConfigurationHeader
        onSave={handleSave}
        saving={saving}
        hasChanges={hasChanges}
      />
      <ConfigurationTabs
        config={config}
        setConfig={handleConfigChange}
        errors={errors}
      />
    </div>
  );
};
