'use client';
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
export default function HeavyStudyLogEditor() {
  const [content, setContent] = React.useState('여기에 오늘 배운 내용을 기록하세요.');
  return (
    <div data-color-mode="light" className="mb-8 border border-gray-300 rounded shadow-sm">
      <MDEditor value={content} onChange={(val) => setContent(val || '')} height={400} />
    </div>
  );
}
