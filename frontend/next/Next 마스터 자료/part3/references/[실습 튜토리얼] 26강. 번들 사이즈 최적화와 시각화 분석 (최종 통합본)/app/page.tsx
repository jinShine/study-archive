'use client'

import React from 'react';
import moment from 'moment';
import Highlight, { defaultProps } from 'prism-react-renderer';

export default function HeavyPage() {
  const time = moment().format('MMMM Do YYYY, h:mm:ss a');

  const codeSnippet = `
function optimize() {
  console.log("We need to lose weight!");
}`;

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">최적화 전: 무거운 클라이언트 컴포넌트</h1>
      <p className="mb-4 text-red-500 font-semibold">현재 시간: {time}</p>

      <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
        <Highlight {...defaultProps} code={codeSnippet.trim()} language="javascript">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </main>
  );
}
