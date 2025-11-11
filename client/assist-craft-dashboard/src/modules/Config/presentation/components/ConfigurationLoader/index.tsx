import { Skeleton } from '@/components/ui/skeleton';

/**
 * Configuration Loader Skeleton
 * Displays skeleton loading state matching the configuration page layout
 */
export const ConfigurationLoader = () => {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-5 w-96' />
        </div>
        <Skeleton className='h-10 w-40' />
      </div>

      {/* Tabs Skeleton */}
      <div className='flex gap-2'>
        <Skeleton className='h-10 w-40' />
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-10 w-32' />
      </div>

      {/* Tab Content Skeleton */}
      <div className='space-y-6'>
        {/* General Tab Card */}
        <div className='rounded-lg border bg-card p-6 shadow-sm'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-64' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        </div>

        {/* Company Information Card */}
        <div className='rounded-lg border bg-card p-6 shadow-sm'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-72' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      </div>
    </div>
  );
};
