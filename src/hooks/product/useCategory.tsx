'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { fetchApi } from '@/app/api/instance';
import { useAuthStore } from '@/app/auth/useAuthStore';
import { IProducts } from '@/app/productList/ProductList';
import { Category } from '@/components/gnb/TabMenu';
import { showCustomToast } from '@/components/ui/Toast/Toast';

export default function useCategory() {
  const searchParams = useSearchParams();
  const mainCategory = searchParams.get('parentId') ?? '';
  const subCategory = searchParams.get('categoryId') ?? '';

  const [mainName, setMainName] = useState<string>('');
  const [subName, setSubName] = useState<string>('');
  const { isAuth, isHydrated, company } = useAuthStore();

  const getParents = async (): Promise<Category[]> => {
    try {
      if (!isHydrated || !isAuth) {
        return [];
      }
      const parents: Category[] = await fetchApi('/categories/parents', {
        method: 'GET',
      }) as Category[];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('상위 카테고리 패칭 완료:', parents);
      }
      return parents.filter((item) => item.companyId === company?.companyId);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.log('상위 카테고리 패칭 실패:', err);
      }
      showCustomToast({ label: '상위 패칭 실패', variant: 'error' });
      return [];
    }
  };

  const getSub = async (parentId: string): Promise<Category[]> => {
    //하위 카테고리 목록 패칭 함수
    try {
      if (!isHydrated || !isAuth) {
        return [];
      }
      const sub = await fetchApi(
        `/categories/parents/${parentId}`,
        { method: 'GET' },
      ) as Category[];
      if (process.env.NODE_ENV === 'development') {
        console.log('초기 하위 카테고리 패칭 완료:', sub);
      }
      return sub.filter((item) => item.companyId === company?.companyId);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.log('초기 하위 카테고리 패칭 실패:', err);
      }
      return [];
    }
  };

  useEffect(() => {
    if (!isHydrated || !isAuth) {
      return;
    }
    let isMounted = true;

    const fetchName = async () => {
      try {
        const data: IProducts[] = await fetchApi('/categories/all') as IProducts[];
        if (!isMounted) {
          return;
        }

        const mainData = data.find((item) => item.id === mainCategory);
        const subData = data.find((item) => item.id === subCategory);

        setMainName(mainData?.name || '상위 카테고리');
        setSubName(subData?.name || '하위 카테고리');
      } catch (e) {
        console.error('카테고리 이름 가져오기 실패:', e);
      }
    };

    fetchName();

    return () => {
      isMounted = false;
    };
  }, [mainCategory, subCategory, isAuth, isHydrated, company]);

  return { getParents, getSub, mainName, subName };
}
