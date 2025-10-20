'use client';

import { useEffect, useState } from 'react';

import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown-Menu';
import Pagenation from '@/components/ui/Pagination';

import CancelModal from './components/CancelModal';
import { Order} from '@/types/order';
import MyRequestTable from './components/MyRequestTable';

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  quantity: number;
}



const MyRequestPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortOption, setSortOption] = useState('Latest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const sortQuery =
          sortOption === '높은금액순'
            ? 'highPrice'
            : sortOption === '낮은금액순'
              ? 'lowPrice'
              : 'latest';

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/order-requests?userOnly=true&page=${currentPage}&pageSize=10&sort=${sortQuery}`,
          {
            credentials: 'include',
          },
        );
        const data = await res.json();

        if (!Array.isArray(data)) {
          return;
        }

        const transformed: Order[] = data.map((item: any) => ({
          id: item.id,
          date: item.requestedAt?.slice(0, 10) || '-',
          price: item.totalAmount,
          status: item.status,
          items: (item.orderRequestItems || []).map((i: any) => ({
            id: i.product?.id ?? '',
            name: i.product?.name ?? '',
            imageUrl: i.product?.imageUrl ?? '/images/default.png',
            category: i.product?.category?.name ?? '',
            price: i.price ?? 0,
            quantity: i.quantity ?? 0,
          })),
        }));

        setOrders(transformed);
      } catch (err) {
        console.error('내 주문 목록 불러오기 실패:', err);
      }
    };

    fetchMyOrders();
  }, [sortOption, currentPage]);

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortOption === '낮은금액순') {
      return a.price - b.price;
    }
    if (sortOption === '높은금액순') {
      return b.price - a.price;
    }
    return 0;
  });

  
  const totalPages = Math.ceil(sortedOrders.length / pageSize);

  const handleCancel = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order-requests/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('요청 취소 실패:', err);
    }
  };

  return (
    <div className='w-full px-8 lg:px-16 pt-10 pb-20 bg-[#FBF8F4] min-h-screen'>
      <div className='w-full h-[114px] flex justify-between items-center'>
        <h1 className='text-[42px] font-bold'>구매 요청 내역</h1>
      </div>

      <div className='space-y-6'>
        <div className='flex justify-end relative overflow-visible'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='w-[136px] h-[50px] btn text-gray-500 text-left pl-[14px] border-2 bg-gray-50 rounded-sm '>
                {sortOption}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='text-gray-500'>
              <DropdownMenuItem onClick={() => setSortOption('최신순')}>
                최신순
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('높은금액순')}>
                높은금액순
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('낮은금액순')}>
                낮은금액순
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <MyRequestTable
          orders={orders} // ✅ 실제 데이터
          onCancel={handleCancel}
          sortOption={sortOption}
          setSortOption={setSortOption}
          setCancelTarget={setCancelTarget}
        />

        <Pagenation
          currentPage={currentPage}
          totalPage={totalPage}
        />

        {cancelTarget && (
          <CancelModal
            open={true}
            itemName={cancelTarget.items[0]?.name || '상품'}
            count={cancelTarget.items.length - 1}
            onClose={() => setCancelTarget(null)}
            onConfirm={async () => {
              await handleCancel(cancelTarget.id);
              setCancelTarget(null);
            }}
          />
        )}

        {totalPages > 1 && (
          <div className='flex justify-center mt-6 gap-2'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded text-sm ${
                  page === currentPage
                    ? 'bg-orange-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestPage;
