'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Cards';

interface BudgetSummary {
  monthlySpending: number;
  monthlyBudgetLeft: number;
  yearlySpending: number;
  lastMonthSpending?: number;
  lastYearSpending?: number;
}

const SummaryCards = () => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);

  useEffect(() => {
    const fetchBudgetSummary = async () => {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        const parsed = authStorage ? JSON.parse(authStorage) : null;

        const companyId = parsed?.state?.company?.companyId;

        if (!companyId) {
          console.warn('❗ 회사 정보가 없습니다.', parsed);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/budgets/inquiry`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyId }),
          },
        );

        const result = await res.json();
        console.log('🔥 result:', result);

        if (result.data) {
          const raw = result.data;

          const calculated: BudgetSummary = {
            monthlySpending: raw.initialAmount - raw.currentAmount,
            monthlyBudgetLeft: raw.currentAmount,
            yearlySpending: raw.initialAmount - raw.currentAmount,
            lastMonthSpending: raw.lastMonthSpending,
            lastYearSpending: raw.lastYearSpending,
          };

          console.log('📊 calculated summary:', calculated);
          setSummary(calculated);
        } else {
          console.warn('❌ API 응답이 이상함:', result);
        }
      } catch (error) {
        console.error('요약 데이터 불러오기 실패:', error);
      }
    };

    fetchBudgetSummary();
  }, []);

  if (!summary) {
    return null;
  }

  return (
    <motion.div
      className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 이번 달 지출액 */}
      <Card className='w-full min-w-0 h-[210px]'>
        <CardHeader>
          <CardTitle className='text-[24px]'>Monthly Spending</CardTitle>
          <p className='text-gray-400'>
            {summary.lastMonthSpending
              ? summary.monthlySpending - summary.lastMonthSpending > 0
                ? `You spent ${(summary.monthlySpending - summary.lastMonthSpending).toLocaleString()} ₩ more than last month`
                : `You spent ${(summary.lastMonthSpending - summary.monthlySpending).toLocaleString()} ₩ less than last month`
              : 'No comparison data from last month!'}
          </p>
        </CardHeader>
        <CardContent>
          <p className='text-[32px] font-bold'>
            {summary.monthlySpending?.toLocaleString() ?? '0'} ₩
          </p>
        </CardContent>
      </Card>

      {/* 이번 달 남은 예산 */}
      <Card className='w-full min-w-0 h-[210px]'>
        <CardHeader>
          <CardTitle className='text-[24px]'>This Month’s Remaining Budget</CardTitle>
          <p className='text-gray-400'>
            {typeof summary.lastMonthSpending === 'number'
              ? summary.lastMonthSpending - summary.monthlySpending > 0
                ? `You have ${(summary.lastMonthSpending - summary.monthlySpending).toLocaleString()} ₩ more left than last month`
                : `You have ${(summary.monthlySpending - summary.lastMonthSpending).toLocaleString()} ₩ less left than last month`
              : 'No comparison data from last month!'}
          </p>
        </CardHeader>
        <CardContent>
          <p className='text-[32px] font-bold'>
            {summary.monthlyBudgetLeft?.toLocaleString() ?? '0'} ₩ </p>
        </CardContent>
      </Card>

      {/* 올해 총 지출액 */}
      <Card className='w-full min-w-0 h-[210px]'>
        <CardHeader>
          <CardTitle className='text-[24px]'>Total Spending This Year</CardTitle>
          <p className='text-gray-400'>
            {summary.lastYearSpending
              ? summary.yearlySpending - summary.lastYearSpending > 0
                ? `${(summary.yearlySpending - summary.lastYearSpending).toLocaleString()} ₩ more spent than last year`
                : `${(summary.lastYearSpending - summary.yearlySpending).toLocaleString()} ₩ less spent than last year`
              : 'No comparison data from last year!'} 
          </p>
        </CardHeader>
        <CardContent>
          <p className='text-[32px] font-bold'>
            {summary.yearlySpending?.toLocaleString() ?? '0'} ₩
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SummaryCards;
