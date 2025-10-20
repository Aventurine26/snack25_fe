import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function GuestHeader() {
  const pathname: string = usePathname();
  const isAuthPage: boolean =
    pathname === '/auth/login' || pathname === '/auth/signUp';

  return (
    <>
      <header
        className={`sticky z-1000 top-0 bg-primary-400 lt:h-[88px] tb:h-16 mb:h-[54px] flex border-b-1 border-b-line-200 items-center lt:px-[120px] tb:px-6 whitespace-nowrap
          ${isAuthPage ? 'justify-center' : 'justify-between max-tb:justify-center'}`}
      >
        <Link href='/'>
          <Image
            src='/img/gnb/gnb-logo-md.svg'
            width={126}
            height={32}
            alt='gnb snack logo'
          />
        </Link>

        {!isAuthPage && (
          <div className='text-white font-bold flex lt:w-[290px] tb:w-[205px] justify-around max-tb:hidden'>
            <Link href='/auth/login'>Login</Link>
            <Link href='/auth/signup'>Register as Admin</Link>
          </div>
        )}
      </header>
    </>
  );
}
