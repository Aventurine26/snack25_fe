'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/app/auth/useAuthStore';

import PurchaseApprovalModal from '@/components/ui/modal/purchaseApprovalModal';

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  requester: string;
  price: number;
  items: OrderItem[];
  budgetLeft: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface OrderTableProps {
  orders?: Order[];
  onApprove?: (id: string, message: string) => void;
  onReject?: (id: string) => void;
}

const headers = ['Request Date', 'Products', 'Order Amount', 'Requester', 'Remarks'];

const OrderTable: React.FC<OrderTableProps> = ({
  orders = [],
  onApprove,
  onReject,
}) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOpenModal = async (id: string) => {
    try {
      // 주문 상세 데이터 가져오기
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order-requests/${id}`,
        {
          credentials: 'include',
        },
      );
      const orderData = await orderRes.json();
      console.log('상세 주문 데이터:', orderData);

      // 주문 품목 확인
      if (!orderData.items || orderData.items.length === 0) {
        console.warn('❗ 주문 품목이 없습니다. API 응답 확인 필요:', orderData);
        alert('주문 품목이 없습니다.');
        return;
      }

      // 회사 ID 가져오기
      const companyId = user?.companyId;

      if (!companyId) {
        console.warn('❗ 회사 정보가 없습니다.');
        alert('회사 정보를 불러올 수 없습니다.');
        return;
      }

      // 예산 데이터 가져오기
      const budgetRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets/inquiry`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ companyId }),
        },
      );
      const budgetData = await budgetRes.json();
      console.log('예산 데이터:', budgetData);

      // 데이터 변환
      const items = (orderData.items || []).map((i: any) => ({
        id: i.productId ?? i.id ?? `${Math.random()}`,
        name: i.productName || '상품 없음', // ✅ 수정
        imageUrl: i.imageUrl || '/images/default.png', // ✅ 수정
        category: i.categoryName || '기타', // ✅ 수정
        price: i.price ?? 0, // ✅ 수정
        quantity: i.quantity ?? 1,
      }));

      const totalAmount = items.reduce(
        (sum: number, item: OrderItem) => sum + item.price * item.quantity,
        0,
      );

      const transformed: Order = {
        id,
        date: orderData.requestedAt?.slice(0, 10) ?? '-',
        requester: orderData.requesterName,
        price: totalAmount, // 총 금액 계산
        budgetLeft: budgetData.data.currentAmount ?? 0,
        items, // 매핑된 품목 데이터
        status: orderData.status,
      };

      console.log('변환된 주문 데이터:', transformed);

      setSelectedOrder(transformed);
      setIsOpen(true);
    } catch (err) {
      console.error('데이터 불러오기 실패', err);
      alert('데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className='w-full'>
      {orders.length > 0 ? (
        <div className='hidden md:flex flex-col'>
          {/* 헤더 */}
          <div className='flex justify-between items-center h-20 bg-gray-50 rounded-full border border-gray-200 text-black-100 text-xl font-medium px-6'>
            {headers.map((header) => (
              <span
                key={header}
                className='flex-1 text-center'
              >
                {header}
              </span>
            ))}
          </div>

          {/* 바디 */}
          {orders.map((order) => (
            <div
              key={order.id}
              className='flex justify-between items-center min-h-[80px] border-b border-gray-200 cursor-pointer hover:bg-gray-50 px-6'
              onClick={() => router.push(`/request/${order.id}`)}
            >
              <span className='flex-1 text-center text-black-100'>
                {order.date}
              </span>
              <span className='flex-1 text-center'>
                {order.items && order.items.length > 0
                  ? `${order.items[0].name}${order.items.length > 1 ? ` and ${order.items.length - 1} more` : ''}`
                  : '상품 없음'}
                <br />
                <span className='text-sm text-gray-500'>
                  Quantity:{' '}
                  {order.items
                    ? order.items.reduce(
                        (sum, item) => sum + (item.quantity || 0),
                        0,
                      )
                    : 0}
                  ea
                </span>
              </span>
              <span className='flex-1 text-center text-black-100'>
                {(order.price ?? 0).toLocaleString()}₩
              </span>
              <span className='flex-1 text-center text-black-100'>
                {order.requester}
              </span>
              <div
                className='flex-1 flex justify-center gap-2 pb-0.5'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onReject?.(order.id)}
                  className={`px-3 py-1 rounded w-[94px] h-[44px] font-medium ${
                    order.status !== 'PENDING'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={order.status !== 'PENDING'}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleOpenModal(order.id)}
                  className={`px-3 py-1 rounded w-[94px] h-[44px] font-medium ${
                    order.status !== 'PENDING'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-400 text-white hover:bg-orange-600'
                  }`}
                  disabled={order.status !== 'PENDING'}
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-10'>
          <Image
            src='/img/order/order-nothing-admin-md.svg'
            alt='구매 요청 없음'
            width={300}
            height={200}
          />
          <p className='text-gray-500 mt-4'>There is no request</p>
        </div>
      )}

      {/* ✅ 모바일/타블렛용 뷰 */}
      <div className='md:hidden space-y-4'>
        {orders.map((order) => (
          <div
            key={order.id}
            className='w-full border-t  border-line-200 bg-none py-3 cursor-pointer'
            onClick={() => router.push(`/request/${order.id}`)}
          >
            {/* 상단: 이미지 + 상품명/수량 + 버튼 */}
            <div className='flex justify-between items-start gap-4'>
              <div className='flex gap-4'>
                <img
                  src={
                    order.items[0]?.imageUrl || '/images/default-product.png'
                  }
                  alt='상품 이미지'
                  className='w-[50px] h-[50px] object-cover'
                />
                <div className='flex flex-col justify-center'>
                  <p className='text-[15px] font-medium'>
                    {order.items[0]?.name}
                    {order.items.length > 1
                      ? ` 외 ${order.items.length - 1}건`
                      : ''}
                  </p>
                  <p className='text-sm text-gray-500'>
                    Quantity:{' '}
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)}ea
                  </p>
                </div>
              </div>

              {/* 승인/반려 버튼 */}
              <div
                className='flex gap-2'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onReject?.(order.id)}
                  className={`px-3 py-1 rounded w-[72px] h-[36px] text-sm font-medium ${
                    order.status !== 'PENDING'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={order.status !== 'PENDING'}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleOpenModal(order.id)}
                  className={`px-3 py-1 rounded w-[72px] h-[36px] text-sm font-medium ${
                    order.status !== 'PENDING'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-400 text-white hover:bg-orange-500'
                  }`}
                  disabled={order.status !== 'PENDING'}
                >
                  Approve
                </button>
              </div>
            </div>

            {/* 하단 정보: 주문금액 / 구매요청일 / 요청인 */}
            <div className='mt-3 space-y-1 text-sm text-gray-600'>
              <div className='flex justify-between font-semibold border-b pb-2'>
                <p className='text-black-400'>Total</p>
                <p className='text-black-400'>
                  {order.price.toLocaleString()} ₩
                </p>
              </div>
              <div className='flex justify-between'>
                <p className='text-gray-400'>Request Date</p>
                <p>{order.date || '-'}</p>
              </div>
              <div className='flex justify-between'>
                <p className='text-gray-400'>Requester</p>
                <p>{order.requester || '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>


      
     {/* 승인 모달 */}
{selectedOrder && (
  <>
    {console.log('💥 모달로 넘어가는 items:', selectedOrder.items)}
    <PurchaseApprovalModal
      isOpen={isOpen}
      onCloseAction={() => setIsOpen(false)}
      onConfirmAction={(message) => {
        onApprove?.(selectedOrder.id, message);
        setIsOpen(false);
      }}
      requester={selectedOrder.requester}
      items={selectedOrder.items}
      totalAmount={selectedOrder.price ?? 0}
      budgetLeft={selectedOrder.budgetLeft ?? 0}
    />
  </>
)}
    </div>
  );
};

export default OrderTable;
