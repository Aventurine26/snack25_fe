'use client';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/app/auth/useAuthStore';
import { showCustomToast } from '@/components/ui/Toast/Toast';
import { createOrder } from '@/lib/api/cart';
import { showToastWithAutoClose } from '@/lib/utils/useToastWithAutoClose';
import { CreateOrderItem } from '@/types/cart';

export function useOrder() {
  const router = useRouter();
  const { user } = useAuthStore();

  const submitOrder = async (items: CreateOrderItem[]) => {
    if (!user) {
      showCustomToast({
        label: '로그인이 필요합니다.',
        variant: 'error',
      });
      return false;
    }

    try {
      const res = await createOrder(items);
      showToastWithAutoClose({
        label: '주문이 완료되었습니다!',
        variant: 'success',
      });
      if (res?.id) {
        router.push(`/order/${res.id}`);
      } else {
        router.push('/order');
      }
      return true;
    } catch (error) {
      showCustomToast({
        label: '주문에 실패했습니다.',
        variant: 'error',
      });
      return false;
    }
  };

  return { submitOrder };
}
