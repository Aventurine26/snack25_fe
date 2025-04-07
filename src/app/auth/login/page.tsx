'use client';

import React, { useEffect, useState } from 'react';
import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/auth/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input_auth';
import { showCustomToast } from '@/components/ui/Toast/Toast';

interface IError {
  isError: boolean;
  msg: string;
}

const initError = {
  isError: false,
  msg: '',
};

export type initFormType = {
  email: string;
  password: string;
};
const initForm = { email: '', password: '' };
const errorFont = 'text-[#F63B20] tb:text-[14px] font-[500] mt-[2px]';

export default function Login() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [form, setForm] = useState<initFormType>(initForm);
  const [emailError, setEmailError] = useState<IError>(initError);
  const [nullError, setNullError] = useState<IError>(initError);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmailBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      emailRegex.test(e.target.value)
        ? initError
        : { isError: true, msg: '유효한 이메일을 입력하세요' },
    );
  };

  const handleNullBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'password' && e.target.value === '') {
      setNullError({ isError: true, msg: '비밀번호를 입력해주세요' });
    } else {
      setNullError(initError);
    }
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert('모든 항목을 입력해주세요!');
      return;
    }

    const result = await login(form);
    console.log('result', result);

    if (result.status === 200) {
      showCustomToast({
        label: '로그인 성공했습니다.',
        variant: 'success',
      });
      router.replace('/');
    } else {
      console.log('에러result', result);
      showCustomToast({
        label: result.message, // 백엔드에서 온 오류 메시지 그대로 사용
        variant: 'error',
        onClick: () => {},
      });
    }
  };

  const isFormValid = form.email.length > 0 && form.password.length > 0;

  // if (isAuth) return <>....</>;

  return (
    <div className='py-[80px] tb:pb-[100px] px-[24px] tb:max-w-[640px] m-auto flex flex-col'>
      <div className='pr-[10px]'>
        <h2 className='text-[24px] tb:text-[32px] font-semibold text-center'>
          로그인
        </h2>
      </div>
      <Form
        action={handleSubmit}
        className='flex flex-col gap-[16px] mt-[20px] tb:gap-[36px]'
      >
        <div className='flex flex-col gap-[4px]'>
          <Input
            tabIndex={1}
            titleClassName='이메일'
            name='email'
            placeholder='이메일을 입력해주세요'
            onChange={handleChange}
            onBlur={handleEmailBlur}
            value={form.email}
            isModified={true}
            required
            // disabled={!!tokenFromUrl} // 초대된 경우 입력 비활성화
          />
          {emailError.isError && (
            <span className={errorFont}>{emailError.msg}</span>
          )}
        </div>

        <div className='flex flex-col gap-[4px]'>
          <Input
            titleClassName='비밀번호'
            name='password'
            tabIndex={2}
            type={passwordVisibility ? 'text' : 'password'}
            placeholder='비밀번호를 입력해주세요'
            onChange={handleChange}
            onBlur={handleNullBlur}
            value={form.password}
            isModified={true}
            required
            autoComplete='current-password'
          >
            <Image
              unoptimized
              // style={{width:'auto',height:'auto'}}
              src={
                passwordVisibility
                  ? '/icon/lined/visibility-on.svg'
                  : '/icon/lined/visibility-off.svg'
              }
              alt={passwordVisibility ? '비밀번호 보이기' : '비밀번호 숨기기'}
              width={24}
              height={24}
              onClick={() => setPasswordVisibility((prev) => !prev)}
            />
          </Input>
          {nullError.isError && (
            <span className={errorFont}>{nullError.msg}</span>
          )}
        </div>

        <Button
          className='mt-[16px] tb:mt-[40px] cursor-pointer w-full'
          filled={isFormValid ? 'orange' : 'gray'}
          type='button'
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          로그인
        </Button>
        <div className='flex gap-[4px] mx-auto tb:mt-[8px]'>
          <span className='text-[12px] tb:text-[20px] text-[var(--color-gray-600)]'>
            기업 담당자이신가요?
          </span>
          <Link
            href='/auth/signup'
            className='text-[12px] tb:text-[20px] font-[600] text-[var(--color-primary-400)] underline decoration-1'
          >
            가입하기
          </Link>
        </div>
      </Form>
    </div>
  );
}
