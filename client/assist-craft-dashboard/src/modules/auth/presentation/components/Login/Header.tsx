//
// Components
//
import { Brain } from 'lucide-react';

import { CardHeader, CardTitle } from '@/components/ui/card';

export const LoginHeader = () => {
  return (
    <CardHeader className='text-center pb-8'>
      <div className='flex justify-center mb-4'>
        <div className='w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center'>
          <Brain className='w-8 h-8 text-white' />
        </div>
      </div>
      <CardTitle className='text-2xl font-bold text-gray-900'>
        AI Assistant Platform
      </CardTitle>
      <p className='text-gray-500 mt-2'>Sign in to your company dashboard</p>
    </CardHeader>
  );
};
