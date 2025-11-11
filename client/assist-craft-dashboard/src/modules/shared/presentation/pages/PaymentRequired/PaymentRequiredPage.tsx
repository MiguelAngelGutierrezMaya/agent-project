import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LanguageSelector } from '@/modules/shared/presentation/components/LanguageSelector';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import { ROUTES } from '@/modules/shared/presentation/router';

export const PaymentRequiredPage = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  const userName = useMemo(() => {
    return user?.fullName || 'User';
  }, [user]);

  const userEmail = useMemo(() => {
    const emails = user?.emailAddresses;

    if (emails && emails.length > 0) {
      return emails[0].emailAddress;
    }

    return 'user@example.com';
  }, [user]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* TopBar */}
      <div className='h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <CreditCard className='w-6 h-6 text-orange-600' />
            <span className='font-semibold text-gray-900'>
              {t('paymentRequired.title')}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <LanguageSelector className='w-40' />
          <div className='flex items-center gap-3'>
            <SignedIn>
              <UserButton signInUrl={ROUTES.login.main}></UserButton>
            </SignedIn>
            <div className='text-sm'>
              <p className='font-medium text-gray-900'>{userName}</p>
              <p className='text-gray-500'>{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Required Content */}
      <div className='flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4'>
              <div className='rounded-full bg-orange-100 p-4'>
                <CreditCard className='w-12 h-12 text-orange-600' />
              </div>
            </div>
            <CardTitle className='text-2xl'>
              {t('paymentRequired.title')}
            </CardTitle>
            <CardDescription className='mt-2'>
              {t('paymentRequired.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-orange-600 mt-0.5' />
                <div className='flex-1'>
                  <p className='text-sm text-orange-800'>
                    {t('paymentRequired.message')}
                  </p>
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-gray-600'>
                {t('paymentRequired.help')}
              </p>
              <ul className='text-sm text-gray-600 space-y-1 ml-4'>
                <li className='list-disc'>{t('paymentRequired.step1')}</li>
                <li className='list-disc'>{t('paymentRequired.step2')}</li>
                <li className='list-disc'>{t('paymentRequired.step3')}</li>
              </ul>
            </div>
            <Button className='w-full' variant='outline'>
              {t('paymentRequired.contactSupport')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
