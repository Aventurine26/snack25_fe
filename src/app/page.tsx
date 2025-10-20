import Image from 'next/image';

import { MobileLoginBox } from '@/components/mobileLoginBox/MobileLoginBox';
import { LANDING_CATCHPHRASE } from '@/lib/constants';
import CustomTooltip from '@components/tooltip/CustomTooltip';
import LogoImg from '@public/img/landing/landing-title-md.svg';

export default function Home() {
  return (
    <section
      className='
    grid
    bg-background
    tb:min-h-[calc(100vh-88px)]
    h-[calc(100vh-54px)]
    '
    >
      <div
        className='container w-full flex flex-col max-w-[1920px] min-w-[375px] mx-auto items-center pt-11 tb:pt-19 lt:pt-15 mb:px-4
      '
      >
        <div className='place-items-center grid'>
          <div className='place-items-center gap-y-6 lt:px-28 lt:gap-y-12 grid'>
            <Image
              className='min-w-[191px] max-w-[504px] w-1/2'
              src={LogoImg}
              alt='logo'
            />
            <p
              className='self-start rounded-full lt:py-4 lt:px-8 px-3 py-2 bg-gray-50 font-bold text-center keep-all text-primary-400 border-4 border-primary-300 max-[744px]:hidden whitespace-nowrap mb-10 lg:text-[26px]
            '
            >
              Unify your scattered snack purchases and manage spending by group intelligently.
            </p>
          </div>
        </div>

        <MobileLoginBox />

        <div
          className='flex-1 w-full bg-[url(/img/landing/landing-hero-sm.svg)] max-tb:bg-[url(/img/landing/landing-hero-md.svg)] bg-bottom bg-no-repeat bg-contain max-tb:bg-size-[670px] lt:bg-size-[100vh]
        '
        >
          <div className='tb:grid-cols-2 tb:grid-rows-2 lt:gap-12 tb:gap-7 pb-14 grid gap-2'>
            {LANDING_CATCHPHRASE.map((phrase) => (
              <div
                key={phrase}
                className='
                  nth-[1]:max-tb:mr-auto
                  nth-[1]:tb:ml-auto
                  nth-[2]:max-tb:row-start-3
                  nth-[2]:max-tb:ml-auto
                  nth-[2]:tb:mr-auto
                  nth-[3]:max-tb:row-start-1
                  nth-[3]:tb:mr-auto
                  nth-[4]:max-tb:row-start-2
                  nth-[4]:max-tb:mr-auto
                  nth-[4]:tb:ml-auto
                  nth-[4]:max-mb:pl-10
                '
              >
                <CustomTooltip content={phrase} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
