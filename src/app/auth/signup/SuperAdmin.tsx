'use client';

import { useState } from 'react';
import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { signupApi } from '@/app/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input_auth';
import Modal from '@/components/ui/modal/Modal';
import { showCustomToast } from '@/components/ui/Toast/Toast';
import { emailRegex } from '@/lib/constants';

interface IError {
  isError: boolean;
  msg: string;
}

const initError: IError = { isError: false, msg: '' };

const initErrors: Record<string, IError> = {
  name: initError,
  email: initError,
  password: initError,
  validatePassword: initError,
  company: initError,
  bizno: initError,
};

interface IPasswords {
  password: string;
  validatePassword: string;
}

const initForm = {
  name: '',
  email: '',
  password: '',
  validatePassword: '',
  company: '',
  bizno: '',
  role: 'SUPERADMIN',
};

const errorFont = 'text-[#F63B20] tb:text-[14px] font-[500] mt-[2px]';

export function SuperAdmin() {
  const router = useRouter();
  const [form, setForm] = useState(initForm);
  const [emailError, setEmailError] = useState<IError>(initError);
  const [passwords, setPasswords] = useState<IPasswords>(initForm);
  const [errors, setErrors] = useState<Record<string, IError>>(initErrors);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    validatePassword: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 사업자 번호 포맷팅 함수 (숫자만 남기고 000-00-00000 형식)
  const formatBizno = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 5) {
      return digits.slice(0, 3) + '-' + digits.slice(3);
    }
    return (
      digits.slice(0, 3) + '-' + digits.slice(3, 5) + '-' + digits.slice(5, 10)
    );
  };

  // 공통 onBlur 핸들러
  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, placeholder } = e.target;
    let newError: IError = initError;

    // 빈 값 체크
    if (value.trim() === '') {
      const match = placeholder.match(/^(.*?(?:을|를))/);
      const fieldLabel = match ? match[0] : placeholder;
      newError = { isError: true, msg: `Please enter ${fieldLabel} ` };
    } else if (name === 'name') {
      // 이름 필드: 숫자나 특수문자가 포함된 경우 에러 처리
      // 정규표현식은 영어, 한글, 공백만 허용합니다.
      if (/[^a-zA-Z가-힣\s]/.test(value.trim())) {
        newError = {
          isError: true,
          msg: 'The name cannot contain numbers or special characters',
        };
      }
    } else if (name === 'password' || name === 'validatePassword') {
      const newPasswords = { ...passwords, [name]: value };
      setPasswords(newPasswords);

      // 비밀번호 확인 필드 처리: 두 값이 다르면 에러 설정
      if (
        name === 'validatePassword' &&
        newPasswords.password &&
        value !== newPasswords.password
      ) {
        newError = { isError: true, msg: 'Passwords do not match' };
      }
    }

    // 사업자 번호 길이 체크 (하이픈 제거 후 10자리여야 함)
    if (name === 'bizno' && value.trim() !== '') {
      const cleanBizno = value.replace(/-/g, '');
      if (cleanBizno.length !== 10) {
        newError = { isError: true, msg: 'The business registration number must be 10 digits' };
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: newError.isError ? newError : initError,
    }));

    // 이메일 검증 처리
    if (name === 'email') {
      setEmailError(
        emailRegex.test(value)
          ? initError
          : { isError: true, msg: 'Please enter a valid email' },
      );
    }
  };

  // 공통 onChange 핸들러 (사업자 번호는 별도 처리)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'bizno') {
      const formattedValue = formatBizno(value);
      setForm((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleVisibility = (field: 'password' | 'validatePassword') => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // API 전송 전, 사업자 번호에서 '-' 제거
  const getCleanBizno = (bizno: string) => bizno.replace(/-/g, '');

  const handleSubmit = async () => {
    // 모든 필드에 값이 입력되었는지 체크
    if (Object.values(form).some((value) => !value.trim())) {
      alert('Please fill in the fields!');
      return;
    }

    // 이름에 숫자나 특수문자가 포함되어 있는지 체크 (영어, 한글, 공백만 허용)
    if (/[^a-zA-Z가-힣\s]/.test(form.name.trim())) {
      showCustomToast({
        label: 'The name cannot contain numbers or special characters',
        variant: 'error',
        onClick: () => {},
      });
      return;
    }

    // 이메일 유효성 검사
    if (emailError.isError || !emailRegex.test(form.email)) {
      showCustomToast({
        label: 'Please enter a valid email',  
        variant: 'error',
        onClick: () => {},
      });
      return;
    }

    // 비밀번호와 비밀번호 확인 값이 일치하는지 확인
    if (form.password !== form.validatePassword) {
      showCustomToast({
        label: 'Passwords do not match',
        variant: 'error',
        onClick: () => {},
      });
      return;
    }

    // 사업자 번호 하이픈 제거 후 10자리인지 확인
    const cleanBizno = getCleanBizno(form.bizno);
    if (cleanBizno.length !== 10) {
      showCustomToast({
        label: 'The business registration number must be 10 digits',
        variant: 'error',
        onClick: () => {},
      });
      return;
    }

    const formData = { ...form, bizno: cleanBizno };

    try {
      const result = await signupApi(formData);

      if (!result) {
        throw new Error('회원가입 실패');
      }

      if (result.status === 201) {
        setIsModalOpen(true);
      } else {
        const errorMessage = result?.data.message || '회원가입 실패';
        showCustomToast({
          label: errorMessage,
          variant: 'error',
          onClick: () => {},
        });
      }
    } catch (error) {
      showCustomToast({
        label: '회원가입 처리 중 오류가 발생했습니다.',

        variant: 'error',
        onClick: () => {},
      });
    }
  };

  const renderError = (field: string) => {
    if (field === 'email') {
      return (
        emailError.isError && (
          <span className={errorFont}>{emailError.msg}</span>
        )
      );
    }
    return (
      errors[field]?.isError && (
        <span className={errorFont}>{errors[field].msg}</span>
      )
    );
  };

  const renderInputField = (
    title: string,
    name: string,
    placeholder: string,
    value: string,
    type: string = 'text',
  ) => (
    <div className='flex flex-col gap-[4px]'>
      <Input
        titleClassName={title}
        name={name}
        placeholder={placeholder}
        type={type}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
        isModified={value.length > 0}
      />
      {renderError(name)}
    </div>
  );

  const renderPasswordField = (
    title: string,
    name: 'password' | 'validatePassword',
    placeholder: string,
    value: string,
    visibility: boolean,
  ) => (
    <div className='flex flex-col gap-[4px]'>
      <Input
        titleClassName={title}
        name={name}
        placeholder={placeholder}
        type={visibility ? 'text' : 'password'}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
        isModified={value.length > 0}
      >
        <Image
          src={
            visibility
              ? '/icon/lined/visibility-on.svg'
              : '/icon/lined/visibility-off.svg'
          }
          alt={visibility ? '비밀번호 보이기' : '비밀번호 숨기기'}
          width={24}
          height={24}
          onClick={() => toggleVisibility(name)}
        />
      </Input>
      {renderError(name)}
    </div>
  );

  const isFormValid = Object.values(form).every(
    (value) => (value ?? '').length > 0,
  );

  return (
    <div className='flex flex-col mt-[20px] gap-[16px]  tb:gap-[36px]'>
      <div className='pr-[10px]'>
        <h2 className='text-[24px] tb:text-[32px] font-semibold tb:mb-[12px]'>
          Super Admin Sign Up
        </h2>
        <span className='text-[var(--color-gray-600)] text-[14px] tb:text-[20px]'>
          Please register your company as a Super Admin user.
        </span>
      </div>

      <Form
        action={async () => await handleSubmit()}
        className='flex flex-col gap-[16px] tb:gap-[36px]'
      >
        {renderInputField(
          'Name (Company Representative)',
          'name',
          'Please enter your name',
          form.name,
        )}
        {renderInputField(
          'Email',
          'email',
          'Please enter your email',
          form.email,
        )}
        {renderPasswordField(
          'Password',
          'password',
          'Please enter your password',
          form.password,
          passwordVisibility.password,
        )}
        {renderPasswordField(
          'Confirm Password',
          'validatePassword',
          'Please confirm your password',
          form.validatePassword,
          passwordVisibility.validatePassword,
        )}
        {renderInputField(
          'Company Name',
          'company',
          'Please enter your company name',
          form.company,
        )}
        {renderInputField(
          'Business Registration Number(10 digits)',
          'bizno',
          'Please enter your business registration number',
          form.bizno,
        )}
        <Button
          className='mt-[16px] tb:mt-[40px]'
          filled={isFormValid ? 'orange' : 'gray'}
          type='submit'
          onSubmit={async () => await handleSubmit()}
          disabled={!isFormValid}
        >
          Register
        </Button>
      </Form>
      <div className='flex gap-[4px] mx-auto tb:mt-[8px]'>
        <span className='text-[12px] tb:text-[20px] text-[var(--color-gray-600)]'>
          Already have an account?
        </span>
        <Link
          href='/auth/login'
          className='text-[12px] tb:text-[20px] font-[600] text-[var(--color-primary-400)] focus:underline hover:underline decoration-1 underline-offset-2'
        >
          Login
        </Link>
      </div>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        confirmText='Go to Login'
        hideCancel={true}
        onConfirm={() => router.replace('/auth/login')}
      >
        <div className='flex flex-col justify-center items-center gap-[24px]'>
          <Image
            src='/img/modal/approved-md.svg'
            alt='강아지 승인 사진'
            width={240}
            height={140}
          />
          <h2 className='mt-[24px] text-[24px] font-[700]'>Register success!</h2>
          <div className='gap-[6px] flex flex-col items-center text-[20px] font-[500] text-[#ABABAB]'>
            <span className=''>
              {form.name},Congratulations on signing up!.
            </span>
            <div className='flex items-center gap-[15px]'>
              <span className=''>Company: {form.company}</span>
              <div>|</div>
              <span className=''>Role: {form.role}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
