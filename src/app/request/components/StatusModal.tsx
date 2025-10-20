'use client';

import React from 'react';

interface OrderItem {
  name: string;
  category: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

interface StatusModalProps {
  status: 'approved' | 'rejected';
  title: string;
  message: string;
  buttonLeft: string;
  buttonRight: string;
  onClose: () => void;
  onNavigate: () => void;
  orderRequestItems?: OrderItem[];
  budget?: {
    currentAmount: number;
    totalAmount: number;
    remainingAmount: number;
  };
}

const StatusModal: React.FC<StatusModalProps> = ({
  status,
  title,
  message,
  buttonLeft,
  buttonRight,
  onClose,
  onNavigate,
  orderRequestItems = [],
}) => {
  const imageSrc =
    status === 'approved'
      ? '/img/modal/approved-md.svg'
      : '/img/modal/rejected-md.svg';

  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-lg text-center'>
        <img
          src={imageSrc}
          alt={status}
          className='mx-auto w-28 h-28 mb-4'
        />
        <h2 className='text-xl font-bold mb-2'>{title}</h2>
        <p className='text-gray-500 whitespace-pre-line mb-6'>{message}</p>

        {/* ✅ 요청 품목 렌더링 */}
        {orderRequestItems.length > 0 && (
          <div className='mb-6 text-left max-h-64 overflow-y-auto'>
            {orderRequestItems.map((item, index) => (
              <div
                key={index}
                className='flex justify-between border rounded-lg p-4 mb-2'
              >
                <div className='flex gap-4 items-center'>
                  <img
                    src={item.imageUrl || '/images/default.png'}
                    alt={item.name || 'Product'}
                    className='w-14 h-14 rounded-md'
                  />
                  <div>
                    <p className='text-sm text-gray-500'>
                      {item.category || '기타'}
                    </p>
                    <p className='text-lg font-semibold'>
                      {item.name || '상품명 없음'}
                    </p>
                    <p className='text-sm'>Quantity: {item.quantity} ea</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p>{item.price.toLocaleString()} ₩</p>
                  <p className='text-lg font-semibold'>
                    {(item.price * item.quantity).toLocaleString()} ₩
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='flex justify-between gap-3'>
          <button
            onClick={onClose}
            className='w-1/2 py-2 rounded-lg bg-orange-50 text-orange-500 font-semibold'
          >
            {buttonLeft}
          </button>
          <button
            onClick={onNavigate}
            className='w-1/2 py-2 rounded-lg bg-orange-500 text-white font-semibold'
          >
            {buttonRight}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
