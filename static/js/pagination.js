// Get total pages from the DOM
const totalPagesElement = document.getElementById('total-pages');
const totalPages = parseInt(totalPagesElement.textContent);

// Get clips-grid and clip-cards from the DOM
const grid = document.querySelector('.clips-grid');
const allCards = document.querySelectorAll('.clip-card');
const originalOrder = [...allCards];

// Track current page
let currentPage = 1;

// Get buttons
const firstBtn = document.getElementById('first-page');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const lastBtn = document.getElementById('last-page');
const currentPageDisplay = document.getElementById('current-page');
const sortViewsBtn = document.getElementById('sort-views');
const sortDateBtn = document.getElementById('sort-date');

// Function to populate filters for channel
function populateFilters() {
  const filterGamesBtn = document.getElementById('filter-game');
  const filterCreatorsBtn = document.getElementById('filter-creator');
  
  // Add unique games and creators to Sets
  let uniqueGames = new Set();
  let uniqueCreators = new Set();

  allCards.forEach(function(card) {
    const game = card.dataset.game;
    const creator = card.dataset.creator;

    uniqueGames.add(game);
    uniqueCreators.add(creator);    
  });

  // Sort the sets by converting to array then sorting
  let gamesArray = [...uniqueGames].sort((a, b) => a.localeCompare(b));
  let creatorsArray = [...uniqueCreators].sort((a, b) => a.localeCompare(b));

  // Add Sets to Dropdown
  gamesArray.forEach(game => {
    filterGamesBtn.add(new Option(game, game))
  });
  creatorsArray.forEach(creator => {
    filterCreatorsBtn.add(new Option(creator, creator))
  });
}

// Track current state of view/date toggle
let currentSortView = 'none';
let currentSortDate = 'none';

// Function to sort clips by view count
function sortViews() {
  let dataSort = document.getElementById('sort-views');

  switch(currentSortView) {
    case 'none':
      currentSortView = 'asc';
      dataSort.dataset.sort = currentSortView;
      break;
    case 'asc':
      currentSortView = 'desc';
      dataSort.dataset.sort = currentSortView;
      break;
    case 'desc':
      currentSortView = 'none';
      dataSort.dataset.sort = currentSortView;
      break;
  }

  let sortedOrder = [...allCards]; 
  // none -> asc -> desc -> none
  if (currentSortView === 'none') {
    originalOrder.forEach(card => {
      grid.appendChild(card);
    });
    return;
  }
  else if (currentSortView === 'asc') {
    sortedOrder = [...allCards].sort((a, b) => parseInt(a.dataset.views) - parseInt(b.dataset.views)); // convert to int then subtract 

    sortedOrder.forEach(card => {
      grid.appendChild(card);
    });
    return;
  }
  else if (currentSortView === 'desc') {
    sortedOrder = [...allCards].sort((a, b) => parseInt(b.dataset.views) - parseInt(a.dataset.views)); // convert to int then subtract

    sortedOrder.forEach(card => {
      grid.appendChild(card);
    });
    return;
  }
}

// Function to sort clips by Date
function sortDate() {

}

// Function to show clips for a specific page
function showPage(pageNumber) {

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

sortViewsBtn.addEventListener('click', function() {
  sortViews();
});

sortDateBtn.addEventListener('click', function() {
  sortDate();
});


// Show page 1 on initial load
showPage(1);
// Populate filters on inital load
populateFilters();
