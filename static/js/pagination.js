// Get total pages from the DOM
const totalPagesElement = document.getElementById('total-pages');
const totalPages = parseInt(totalPagesElement.textContent);

// Track current page
let currentPage = 1;

// Get buttons
const firstBtn = document.getElementById('first-page');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const lastBtn = document.getElementById('last-page');
const currentPageDisplay = document.getElementById('current-page');

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

  // Update current page
  currentPage = pageNumber;
  currentPageDisplay.textContent = currentPage;

  // Update button states
  updateButtonStates();

  // Snap to top
  window.scrollTo(0, 0);
}

// Update button enabled/disabled states
function updateButtonStates() {
  // Disable First/Prev if on first page
  firstBtn.disabled = currentPage === 1;
  prevBtn.disabled = currentPage === 1;

  // Disable Next/Last if on last page
  nextBtn.disabled = currentPage === totalPages;
  lastBtn.disabled = currentPage === totalPages;
}

// Button click handlers
firstBtn.addEventListener('click', function() {
  showPage(1);
});

prevBtn.addEventListener('click', function() {
  if (currentPage > 1) {
    showPage(currentPage - 1);
  }
});

nextBtn.addEventListener('click', function() {
  if (currentPage < totalPages) {
    showPage(currentPage + 1);
  }
});

lastBtn.addEventListener('click', function() {
  showPage(totalPages);
});

// Show page 1 on initial load
showPage(1);
