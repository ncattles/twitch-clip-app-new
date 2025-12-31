// Get total pages from the initial buttons
let totalPages = 0;
const initialButtons = document.querySelectorAll('button[data-page]');
initialButtons.forEach(function(button) {
  const pageNum = parseInt(button.dataset.page);
  if (pageNum > totalPages) {
    totalPages = pageNum;
  }
});

// Calculate which page numbers to show based on current page
function getPageNumbers(currentPage, total, maxVisible = 11) {
  if (total <= maxVisible) {
    // Show all pages if total is small
    const pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  const pages = [];
  const sidePages = 4; // Pages to show on each side of current page

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  let rangeStart = Math.max(2, currentPage - sidePages);
  let rangeEnd = Math.min(total - 1, currentPage + sidePages);

  // Adjust range if too close to start or end
  if (currentPage <= sidePages + 2) {
    rangeEnd = Math.min(total - 1, maxVisible - 2);
  }
  if (currentPage >= total - sidePages - 1) {
    rangeStart = Math.max(2, total - maxVisible + 2);
  }

  // Add ellipsis and range
  if (rangeStart > 2) {
    pages.push('...');
  }
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }
  if (rangeEnd < total - 1) {
    pages.push('...');
  }

  // Always show last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

// Rebuild pagination buttons based on current page
function rebuildPagination(currentPage) {
  const paginationDiv = document.querySelector('.pagination');
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Clear existing buttons
  paginationDiv.innerHTML = '';

  // Create new buttons
  pageNumbers.forEach(function(pageItem) {
    if (pageItem === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      paginationDiv.appendChild(ellipsis);
    } else {
      const button = document.createElement('button');
      button.dataset.page = pageItem;
      button.textContent = pageItem;

      // Add active class if this is current page
      if (pageItem === currentPage) {
        button.classList.add('active');
      }

      // Add click listener
      button.addEventListener('click', function() {
        showPage(pageItem);
      });

      paginationDiv.appendChild(button);
    }
  });
}

// Function to show clips for a specific page
function showPage(pageNumber) {
  const allCards = document.querySelectorAll('.clip-card');

  // Show/hide cards based on page number
  allCards.forEach(function(card) {
    const cardPage = card.dataset.page;

    if (cardPage === String(pageNumber)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Rebuild pagination buttons for current page
  rebuildPagination(pageNumber);

  // Snap to top
  window.scrollTo(0, 0);
}

// Show page 1 on initial load
showPage(1);
