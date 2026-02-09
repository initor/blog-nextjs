'use client';

import { useEffect } from 'react';

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Post rendering error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Failed to load post</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Something went wrong while loading this content.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-black dark:hover:bg-zinc-300 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
