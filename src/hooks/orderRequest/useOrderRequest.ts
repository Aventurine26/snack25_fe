'use client';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/app/auth/useAuthStore';
import { showCustomToast } from '@/components/ui/Toast/Toast';
import { createOrderRequest } from '@/lib/api/cart';
import { showToastWithAutoClose } from '@/lib/utils/useToastWithAutoClose';
import {
  CreateOrderRequestItem,
  CreateOrderRequestPayload,
} from '@/types/cart';

export function useOrderRequest() {
  const router = useRouter();
  const { user } = useAuthStore();

  const submitOrderRequest = async (items: CreateOrderRequestItem[]) => {
    if (!user) {
      showCustomToast({
        label: '로그인이 필요합니다.',
        variant: 'error',
      });
      return false;
    }

    const { id, companyId } = user;

    const payload: CreateOrderRequestPayload = {
      items,
      requesterId: String(id),
      companyId: String(companyId),
      status: 'PENDING',
    };

    try {
      const res = await createOrderRequest(payload);
      showToastWithAutoClose({
        label: '구매 요청이 완료되었습니다.',
        variant: 'success',
      });
      if (res?.id) {
        router.push(`/order-request/${res.id}`);
      } else {
        router.push('/order-request');
      }
      return true;
    } catch (error) {
      showCustomToast({
        label: '구매 요청에 실패했습니다.',
        variant: 'error',
      });
      return false;
    }
  };

  return { submitOrderRequest };
}
