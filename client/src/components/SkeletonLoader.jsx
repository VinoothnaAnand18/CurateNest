import React from 'react';

export const BookCardSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse flex flex-col space-y-4">
      <div className="w-full h-52 bg-slate-800 rounded-xl" />
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
      <div className="h-2 bg-slate-800 rounded w-full mt-2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-800 rounded w-16" />
        <div className="h-6 bg-slate-800 rounded w-20" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-900 border border-slate-800/80 rounded-xl w-full" />
      ))}
    </div>
  );
};

export default { BookCardSkeleton, TableSkeleton };
