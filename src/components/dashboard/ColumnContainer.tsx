import TrashIcon from '@/src/icons/TrashIcon';
import { Column } from '@/src/type';
import React from 'react'

interface Props {
    column: Column;
}

function ColumnContainer(props: Props) {
  const { column } = props;
  return <div className="bg-[#f8f8f8] w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col">
    {/* Column title */}
    <div className='flex items-center justify-between bg-[#f8f8f8] text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-[#f8f8f8] border-4'>
      <div className='flex gap-2'>
        <div className='flex justify-center items-center bg-[#f8f8f8] px-2 py-1 text-sm rounded-full'>0</div>
        {column.title}
      </div>
      <button className='stroke-gray-500 hover:stroke-white hover:bg-[#000000] rounded px-1 py-2 '><TrashIcon/></button>
    </div>
    {/* Column task container */}
    <div className='flex flex-grow'>Content</div>
    {/* Column footer */}
  </div>;
}

export default ColumnContainer