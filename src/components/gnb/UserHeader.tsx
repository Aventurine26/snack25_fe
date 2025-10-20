import Link from 'next/link';
import { HeaderMenu } from './HeaderMenu';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { useAuthStore } from '@/app/auth/useAuthStore';

interface userInfo {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  cartId: string;
  companyId: string;
  companyName: string;
}

interface navItemProps {
  href: string;
  currentPath: string;
  children: React.ReactNode;
}

export default function UserHeader({ user }: { user: userInfo }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const hoverStyle: string =
    'transition-colors ease-in-out duration-300 hover:text-primary-400';

  const NavItem = ({ href, currentPath, children }: navItemProps) => {
    const isActive = currentPath.includes(href);
    return (
      <Link
        href={href}
        className={cn(hoverStyle, isActive && 'text-primary-400')}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <header className='sticky z-1000 top-0 lt:h-[88px] tb:h-16 mb:h-[54px] flex border-b-1 border-b-line-200 items-center lt:px-[120px] max-lt:px-6 bg-background-400 whitespace-nowrap'>
        <div className='flex items-center justify-between text-gray-400 font-bold text-[1.4vw] w-full mx-auto'>
          <div className='flex items-center gap-6'>
            <HeaderMenu />

            <Link
              href='/'
              className='w-[10vw] mr-16'
            >
              <Image
                src='/img/gnb/gnb-logo-primary.svg'
                width={126}
                height={32}
                alt='gnb snack logo'
                className='max-tb:w-20 max-tb:h-[54px] min-w-16'
                priority
              />
            </Link>
          </div>

          <div className='flex gap-8 max-tb:hidden'>
            <Link
              href={{
                pathname: '/productList',
              }}
              className={cn(
                hoverStyle,
                pathname.includes('/productList') && 'text-primary-400',
              )}
            >
              Products
            </Link>
            {user.role === 'USER' && (
              <NavItem
                href='/my-request'
                currentPath={pathname}
              >
                Purchase Requests
              </NavItem>
            )}
            {user.role !== 'USER' && (
              <div className='flex gap-12'>
                <NavItem
                  href='/request'
                  currentPath={pathname}
                >
                  Request Management
                </NavItem>
               
                <NavItem
                  href='/history'
                  currentPath={pathname}
                >
                  Purchase History
                </NavItem>
              </div>
            )}
            <NavItem
              href='/productEntry'
              currentPath={pathname}
            >
              Registered Products
            </NavItem>
            {user.role === 'SUPERADMIN' && (
              <NavItem
                href='/management/users'
                currentPath={pathname}
              >
                Users
              </NavItem>
            )}
          </div>

          <div className='flex items-center gap-12 ml-auto max-tb:hidden'>
            <NavItem
              href={`/cart/${user.cartId}`}
              currentPath={pathname}
            >
              Cart
            </NavItem>
            <NavItem
              href='/management/profile'
              currentPath={pathname}
            >
              Profile
            </NavItem>
            <Button
              className={`bg-transparent hover:bg-transparent text-gray-400 text-[1.4vw] font-bold w-auto h-auto cursor-pointer ${hoverStyle}`}
              font='tb:text-[1.4vw]'
              onClick={async () => {
                logout();
                router.push('/');
              }}
            >
              Logout
            </Button>
          </div>

          <div className='flex items-center gap-4 tb:hidden'>
            <Link href={`/cart/${user.cartId}`}>
              <Image
                src='/icon/flat/cart-outlined-md.svg'
                width={24}
                height={24}
                alt='cart-outlined'
              />
            </Link>
            <Link href='/management/profile'>
              <Image
                src='/icon/flat/profile-md.svg'
                width={24}
                height={24}
                alt='profile icon'
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
