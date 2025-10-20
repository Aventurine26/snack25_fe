'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface OrderItem {
  imageUrl?: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  price: string;
  requester: string;
  handler: string;
  requestDate: string;
}

interface HistoryTableProps {
  orders?: Order[];
}

const headers = [
  'Approval Date',
  'Product info',
  'Order Amount',
  'Requester',
  'Handler',
  'Request Date',
];

const HistoryTable: React.FC<HistoryTableProps> = ({ orders = [] }) => {
  const router = useRouter();
  

  if (orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10'>
        <Image
          src='/img/order/order-nothing-admin-md.svg'
          alt='no orders'
          width={300}
          height={200}
        />
      </div>
    );
  }


  return (
    <div className='w-full space-y-4'>
      {/* ✅ 데스크탑용 테이블 */}
      <div className='hidden md:flex flex-col'>
        <div className='min-h-[80px] flex justify-around items-center h-20 bg-gray-50 rounded-full border border-gray-200 text-black-100 text-xl font-medium'>
          {headers.map((header) => (
            <span
              key={header}
              className='flex-1 text-center'
            >
              {header}
            </span>
          ))}
        </div>

        {orders.map((order) =>(          
          <div
            key={order.id}
            className='flex justify-around items-center h-20 border-b border-line-200 cursor-pointer hover:bg-gray-50'
            onClick={() => router.push(`/history/${order.id}`)}
          >
            <span className='flex-1 text-center text-black-100'>
              {order.date}
            </span>
            <span className='flex-1 text-center'>
              {order.items.length > 0
                ? `${order.items[0].name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}`
                : 'No products'}
              <br />
              <span className='text-sm text-gray-500'>
                Total Amount: {order.items.reduce((sum, i) => sum + i.quantity, 0)} ea
              </span>
            </span>
            <span className="flex-1 text-center text-black-100">{order.price}</span>
            <span className="flex-1 text-center text-black-100 flex justify-center items-center gap-2">
              {order.requester}
              {order.requester === order.handler && (
            <span className="text-orange-400 border border-orange-200 px-2 py-[2px] text-sm rounded-md bg-orange-100 font-semibold">
              Immediate Purchase
            </span>
            )}
            </span>

            <span className="flex-1 text-center text-black-100">{order.handler}</span>
            <span className="flex-1 text-center text-black-100">{order.requestDate}</span>
          </div>
        ))}
      </div>

      {/* ✅ 모바일/타블렛용 카드 */}
      <div className='md:hidden'>
        {orders.map((order) => (
          <div
            key={order.id}
            className='w-full border-t border-b border-line-200 bg-none  py-6 cursor-pointer'
            onClick={() => router.push(`/history/${order.id}`)}
          >
            {/* 상단: 이미지 + 상품명/수량 + 주문금액 */}
            <div className='flex justify-between items-start'>
              <div className='flex gap-4'>
                <Image
                  src={
                    order.items[0]?.imageUrl || '/images/default-product.png'
                  }
                  alt='상품 이미지'
                  width={50}
                  height={50}
                  className='object-cover'
                />

            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium">
                {order.items[0]?.name}
                {order.items.length > 1 ? ` and ${order.items.length - 1}ea` : ''}
              </p>
              <p className="text-sm text-gray-500">
                Total Amount: {order.items.reduce((sum, i) => sum + i.quantity, 0)}ea
              </p>
            </div>
          </div>
          

        </div>
      
        {/* 하단: 라벨 - 값 좌우 정렬 */}
        <div className="mt-6 space-y-2  text-gray-600">
          <div className="flex justify-between font-semibold border-b py-2 ">
            <p className="text-black-400 ">Total Amount</p>
            <p className="text-black-400 ">{order.price}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-400">Approval Date</p>
            <p>{order.date || '-'}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-400 ">Request Date</p>
            <p>{order.requestDate || '-'}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-400">Requester</p>
            <span className="flex justify-between text-sm items-center">
              <span className="flex items-center gap-1">
                {order.requester === order.handler && (
                  <span className="text-orange-400 border border-orange-200 px-2 py-[2px] text-sm rounded-md bg-orange-100 font-semibold">
                    Immediate Purchase
                  </span>
                )}
                {order.requester}
            </span>
          </span> 
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-400">Handler</p>
            <p>{order.handler || '-'}</p>
          </div>
        </div>

      </div>
       
        ))}
      </div>
    </div>
  );
};

export default HistoryTable;
