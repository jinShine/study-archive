import React from 'react';
export default function FeedLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode; }) {
  return <div className="relative min-h-screen bg-gray-50"><main className="max-w-4xl mx-auto pt-10 px-4">{children}</main>{modal}</div>;
}