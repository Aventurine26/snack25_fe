'use client';

import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import useCategory from '@/hooks/product/useCategory';

import { Listbox } from '@headlessui/react';

import { Category } from '../gnb/TabMenu';

export default function CategorySelect({
  onCategoryChange,
  onSubCategoryChange,
}: {
  onCategoryChange: (catId: string) => void;
  onSubCategoryChange: (subId: string) => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  const { getParents, getSub } = useCategory();

  useEffect(() => {
    const fetchMain = async () => {
      const parents = await getParents();
      setMainCategories(parents);
    };
    fetchMain();
  }, []);

  useEffect(() => {
    const fetchSub = async () => {
      if (!selectedCategoryId) {
        return;
      }

      const subs = await getSub(selectedCategoryId);
      setSubCategories(subs);
    };
    fetchSub();
  }, [selectedCategoryId]);

  const selectedCategory = mainCategories.find(
    (cat) => cat.id === selectedCategoryId,
  );
  const selectedSub = subCategories.find((sub) => sub.id === selectedSubId);

  return (
    <div className='flex gap-2 w-[327px] md:w-[640px] h-[52px] md:h-[64px]'>
      {/* 대분류 */}
      <Listbox
        value={selectedCategoryId}
        onChange={(id) => {
          setSelectedCategoryId(id);
          setSelectedSubId('');
          onCategoryChange(id);
        }}
      >
        <div className='relative w-1/2'>
          <Listbox.Button
            as='button'
            className='flex items-center justify-between w-full h-full px-[14px] rounded-[16px] border border-[#FCC49C] bg-white text-left'
          >
            <span className='text-gray-400 text-[16px]'>
              {selectedCategory?.name || '대분류'}
            </span>
            <ChevronDownIcon className='w-4 h-4 text-orange-500' />
          </Listbox.Button>
          <Listbox.Options
            as='ul'
            className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white z-50 shadow-md'
          >
            {mainCategories.map((cat) => (
              <Listbox.Option
                as='li'
                key={cat.id}
                value={cat.id}
                className={({ active }) =>
                  `px-4 py-2 cursor-pointer ${active ? 'bg-orange-100' : ''}`
                }
              >
                {({ selected }) => (
                  <span className='flex justify-between items-center text-sm'>
                    {cat.name}
                    {selected && (
                      <CheckIcon className='w-4 h-4 text-orange-500' />
                    )}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* 소분류 */}
      <Listbox
        value={selectedSubId}
        onChange={(id) => {
          setSelectedSubId(id);
          onSubCategoryChange(id);
        }}
      >
        <div className='relative w-1/2'>
          <Listbox.Button
            as='button'
            className={`flex items-center justify-between w-full h-full px-[14px] rounded-[16px] border ${
              selectedCategoryId ? 'border-[#FCC49C]' : 'border-gray-300'
            } bg-white text-left`}
          >
            <span className='text-gray-400 text-[16px]'>
              {selectedSub?.name || 'Subcategory'}
            </span>
            <ChevronDownIcon className='w-4 h-4 text-orange-500' />
          </Listbox.Button>

          <Listbox.Options
            as='ul'
            className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white z-50 shadow-md'
          >
            {!selectedCategoryId ? (
              <li className='px-4 py-2 text-gray-400 cursor-not-allowed'>
                Please select a main category first
              </li>
            ) : (
              subCategories.map((sub) => (
                <Listbox.Option
                  as='li'
                  key={sub.id}
                  value={sub.id}
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${active ? 'bg-orange-100' : ''}`
                  }
                >
                  {({ selected }) => (
                    <span className='flex justify-between items-center text-sm'>
                      {sub.name}
                      {selected && (
                        <CheckIcon className='w-4 h-4 text-orange-500' />
                      )}
                    </span>
                  )}
                </Listbox.Option>
              ))
            )}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
