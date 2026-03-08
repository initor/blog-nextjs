import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

/**
 * Compute which page numbers to display.
 * For <= 7 pages, show all. For > 7, show: 1 ... (cur-1) cur (cur+1) ... last.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  const nearStart = currentPage <= 3;
  const nearEnd = currentPage >= totalPages - 2;

  if (nearStart) {
    // Show 1 2 3 4 ... last
    for (let i = 1; i <= 4; i++) pages.push(i);
    pages.push('...');
    pages.push(totalPages);
  } else if (nearEnd) {
    // Show 1 ... (last-3) (last-2) (last-1) last
    pages.push(1);
    pages.push('...');
    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
  } else {
    // Show 1 ... (cur-1) cur (cur+1) ... last
    pages.push(1);
    pages.push('...');
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-8 text-sm">
      {currentPage > 1 && (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className="px-3 py-1 rounded text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Previous
        </Link>
      )}

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            className="px-3 py-1 font-bold text-blue-600 dark:text-blue-400"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(basePath, page)}
            className="px-3 py-1 rounded hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className="px-3 py-1 rounded text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
