"use client";

import Styles from "./pagination.module.css";

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (pageNumber) => {
    // Cegah navigasi ke halaman di luar batas
    if (pageNumber < 1 || pageNumber > totalPages) return;
    onPageChange(pageNumber);
    scrollToTop();
  };

  const renderPages = () => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(
        <button
          key={1}
          onClick={() => handleChange(1)}
          className={Styles.pageButton}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(
          <span key="start-ellipsis" className={Styles.ellipsis}>
            ...
          </span>
        );
      }
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(
        <button
          key={i}
          onClick={() => handleChange(i)}
          className={
            i === currentPage
              ? `${Styles.pageButton} ${Styles.activePageButton}`
              : Styles.pageButton
          }
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="end-ellipsis" className={Styles.ellipsis}>
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handleChange(totalPages)}
          className={Styles.pageButton}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={Styles.pagination}>
      <button
        className={Styles.navButton}
        onClick={() => handleChange(currentPage - 1)}
        aria-disabled={currentPage === 1} // biar tetap accessible
      >
        Previous
      </button>

      {renderPages()}

      <button
        className={Styles.navButton}
        onClick={() => handleChange(currentPage + 1)}
        aria-disabled={currentPage === totalPages} // biar tetap accessible
      >
        Next
      </button>
    </div>
  );
}
