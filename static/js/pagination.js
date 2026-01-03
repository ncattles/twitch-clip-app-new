// Get total pages from the DOM
let totalPagesElement = document.getElementById('total-pages');
let totalPages = parseInt(totalPagesElement.textContent);

// Get total clips from the DOM
let totalClipsElement = document.getElementById('clip-count');

// Get clip components from the DOM
const grid = document.querySelector('.clips-grid');
const allCardsElement = document.querySelectorAll('.clip-card');
let allCards = [...allCardsElement];
let visibleCards = [...allCardsElement];

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
const filterGamesBtn = document.getElementById('filter-game');
const filterCreatorsBtn = document.getElementById('filter-creator');
const clearFiltersBtn = document.getElementById('clear-filters');

// Function to populate filters for channel
function populateFilters() {
  // Add unique games and creators to Sets
  let uniqueGames = new Set();
  let uniqueCreators = new Set();

  allCardsElement.forEach(function(card) {
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

// Function to sort clips by view count
function sortViews() {
  
  switch(sortViewsBtn.dataset.sort) {
    case 'none':
      sortViewsBtn.dataset.sort = 'asc';
      break;
    case 'asc':
      sortViewsBtn.dataset.sort = 'desc';
      break;
    case 'desc':
      sortViewsBtn.dataset.sort = 'none';
      break;
  }

  // Reset the date sort when views sort is activated
  sortDateBtn.dataset.sort = 'none';
  sortDateBtn.textContent = 'Date';

  // none -> asc -> desc -> none
  if (sortViewsBtn.dataset.sort === 'none') {
    sortViewsBtn.textContent = 'Views';
  } else if (sortViewsBtn.dataset.sort === 'asc') {
    sortViewsBtn.textContent = 'Views ↑';
  } else if (sortViewsBtn.dataset.sort === 'desc') {
    sortViewsBtn.textContent = 'Views ↓';
  }

  applySorting(); // Call applySorting helper function
  appendGrid(visibleCards);
  recalculatePageNumber(visibleCards);
  showPage(1);
}

// Function to sort clips by date
function sortDates() {

  switch(sortDateBtn.dataset.sort) {
    case 'none':
      sortDateBtn.dataset.sort = 'asc';
      break;
    case 'asc':
      sortDateBtn.dataset.sort = 'desc';
      break;
    case 'desc':
      sortDateBtn.dataset.sort = 'none';
      break;
  }

  // Reset the views sort when date sort is activated
  sortViewsBtn.dataset.sort = 'none';
  sortViewsBtn.textContent = 'Views';
 
  // none -> asc -> desc -> none
  if (sortDateBtn.dataset.sort === 'none') {
    sortDateBtn.textContent = 'Date';
  } else if (sortDateBtn.dataset.sort === 'asc') {
    sortDateBtn.textContent = 'Date ↑';
  } else if (sortDateBtn.dataset.sort === 'desc') {
    sortDateBtn.textContent = 'Date ↓';
  }

  applySorting(); // call applySorting helper function
  appendGrid(visibleCards);
  recalculatePageNumber(visibleCards);
  showPage(1);
}

// Function to apply filters to clips
function applyFilters() {
  const selectedGame = filterGamesBtn.value;
  const selectedCreator = filterCreatorsBtn.value;

  let clipsList = []; // new list for re-pagination

  // Display matching filtered clips
  allCardsElement.forEach(function(card) {
    let matchesGame = selectedGame === card.dataset.game || selectedGame === '';
    let matchesCreator = selectedCreator === card.dataset.creator || selectedCreator === '';

    if (matchesGame && matchesCreator) {
      clipsList.push(card);
    }
    else {
      card.dataset.page = 0; // Update to 0, these will never be shown
    }
  });

  // Reassign visibleCards to be equal to clipsList
  visibleCards = clipsList;

  applySorting(); // Re-apply any active sorting 
  resetView(); // reset view
}

// Function to clear filters
function clearFilters() {
  sortViewsBtn.dataset.sort = 'none';
  sortViewsBtn.textContent = 'Views';
  
  sortDateBtn.dataset.sort = 'none';
  sortDateBtn.textContent = 'Date';
  
  filterGamesBtn.value = '';
  filterCreatorsBtn.value = '';

  visibleCards = allCards; // reset visibleCards to allCards

  resetView(); // reset view
}

// Helper function to reset view
function resetView() {
  // Recalculate pages and append
  appendGrid(visibleCards);
  recalculatePageNumber(visibleCards);

  // Recalculate total number of pages, then display it
  totalPagesElement.textContent = Math.ceil(visibleCards.length / 20);  
  totalPages = parseInt(totalPagesElement.textContent);

  // Recalculate total number of clips
  totalClipsElement.textContent = 'Showing ' + visibleCards.length  + ' clips';  

  showPage(1); // show first page
}

// Helper function to apply sorting 
function applySorting() {
  if (sortViewsBtn.dataset.sort === 'asc') {
    visibleCards = [...visibleCards].sort((a, b) => parseInt(a.dataset.views) - parseInt(b.dataset.views));
  } else if (sortViewsBtn.dataset.sort === 'desc') {
    visibleCards = [...visibleCards].sort((a, b) => parseInt(b.dataset.views) - parseInt(a.dataset.views));
  } else if (sortDateBtn.dataset.sort === 'asc') {
    visibleCards = [...visibleCards].sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));
  } else if (sortDateBtn.dataset.sort === 'desc') {
    visibleCards = [...visibleCards].sort((a, b) => b.dataset.date.localeCompare(a.dataset.date));
  }
  // If both sorts are 'none', visibleCards stays unchanged
}

// Helper function to recalculate page number for each clip in list
function recalculatePageNumber(list) {
  list.forEach(function(clip, index) {
    clip.dataset.page = Math.floor(index / 20) + 1;
  });
}

// Helper function to append grid
function appendGrid(list) {
  list.forEach(card => {
      grid.appendChild(card);
  });
}

// Function to show clips for a specific page
function showPage(pageNumber) {

  // Show/hide cards based on page number
  allCardsElement.forEach(function(card) {
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

// Sort button click handlers
sortViewsBtn.addEventListener('click', function() {
  sortViews();
});

sortDateBtn.addEventListener('click', function() {
  sortDates();
});

// Filter button click handlers
filterGamesBtn.addEventListener('change', function() {
  applyFilters();
});

filterCreatorsBtn.addEventListener('change', function() {
  applyFilters();
});

// Clear filters button click handler
clearFiltersBtn.addEventListener('click', function() {
  clearFilters();
});


// Show page 1 on initial load
showPage(1);
// Populate filters on inital load
populateFilters();
