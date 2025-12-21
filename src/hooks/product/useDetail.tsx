import { useEffect, useState } from 'react';

import { fetchApi } from '@/app/api/instance';
import { IProducts } from '@/app/productList/ProductList';
import { showCustomToast } from '@/components/ui/Toast/Toast';

interface IUpdatePayload {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  imageUrl: string;
  link: string;
}

export const useDetail = (id: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<IProducts | null>(null);

  const fetchProductDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const url = `/products/${id}`;
      const data = await fetchApi<IProducts>(url, { method: 'GET' }) ;
      setIsLoading(false);
      return data;
      if (process.env.NODE_ENV === 'development') {
        console.log('상품 상세 조회 성공:', data);
      }
      return data;
    } catch (err) {
      setIsLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('상품 상세 조회 실패:', err);
      }
      throw err;
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await fetchProductDetail(id);
        setData(data as IProducts);
      } catch (err) {
        throw new Error('상세 데이터 패칭 오류 발생');
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdate = async (data: IUpdatePayload) => {
    const requestBody = {
      name: data.name,
      price: data.price,
      description: '수정 모달 임시 설명입니다',
      categoryId: data.subCategory,
      imageUrl: data.imageUrl,
    };
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 최종 업데이트 데이터:', requestBody);
    }

    try {
      const res = await fetchApi(`/products/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res || (res as any).error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ 수정 실패 응답:', res);
        }
        showCustomToast({ label: '상품 수정에 실패하였습니다.' });
        throw new Error('수정 실패');
      }

      showCustomToast({ label: '상품이 수정되었습니다.' });
    } catch (err) {
      console.error('🔥 수정 중 에러 발생:', err);
    }
  };

  return { data, isLoading, setIsLoading, handleUpdate };
};
