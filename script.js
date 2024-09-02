// Sample word data
let wordData = [];
let currentSelectedCell = null;
$(document).ready(function() {
    // Load JSON data
    $.getJSON("data/group_compact_9_12.json", function(json) {
        wordData = json;
        // console.log(wordData); // This will log the JSON data in the console
        // // Initialize the rest of the application after loading data
        populateWordSets();
        document.addEventListener('keydown', handleKeyPress);
    });
});

window.onload = function() {
    populateWordSets();
    document.addEventListener('keydown', handleKeyPress);
};

// Populate the dropdown with word sets
function populateWordSets() {
    const wordSetSelector = document.getElementById('wordSetSelector');
    const uniqueSets = [...new Set(wordData.map(word => word.set))];
    uniqueSets.forEach(set => {
        const option = document.createElement('option');
        option.value = set;
        option.textContent = `Set ${set}`;
        wordSetSelector.appendChild(option);
    });

    wordSetSelector.addEventListener('change', generateWordTable);
}

// Generate word table based on selected set
function generateWordTable() {
    const selectedSet = document.getElementById('wordSetSelector').value;
    const wordTable = document.getElementById('wordTable');
    wordTable.innerHTML = ''; // Clear existing table

    const words = wordData.filter(word => word.set == selectedSet);

    words.forEach((word, index) => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = word.word;
        cell.dataset.wordId = word.id;
        cell.tabIndex = 0; // Make cells focusable
        row.appendChild(cell);
        wordTable.appendChild(row);
    });

    // Select the first cell by default
    const firstCell = wordTable.querySelector('td');
    if (firstCell) {
        selectCell(firstCell);
    }
}

// Handle keyboard key press events
function handleKeyPress(event) {
    if (!currentSelectedCell) return;

    switch (event.key) {
        case 'ArrowUp':
            navigate(-1);
            break;
        case 'ArrowDown':
            navigate(1);
            break;
        case 'w':
            currentSelectedCell.classList.add('red');
            currentSelectedCell.classList.remove('green');
            break;
        case 'a':
            currentSelectedCell.classList.add('green');
            currentSelectedCell.classList.remove('red');
            break;
        case 'd':
            togglePopup(currentSelectedCell.dataset.wordId);
            break;
    }
}

// Navigate the selection up or down
function navigate(direction) {
    const cells = Array.from(document.querySelectorAll('td'));
    const currentIndex = cells.indexOf(currentSelectedCell);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < cells.length) {
        selectCell(cells[nextIndex]);
    }
}

// Select a cell and highlight it
function selectCell(cell) {
    if (currentSelectedCell) {
        currentSelectedCell.classList.remove('highlight');
    }
    currentSelectedCell = cell;
    currentSelectedCell.classList.add('highlight');
    currentSelectedCell.focus();
}

// Toggle the popup visibility
function togglePopup(wordId) {
    const popup = document.getElementById('wordPopup');
    if (popup.style.display === 'block') {
        closePopup();
    } else {
        openPopup(wordId);
    }
}

// Open the popup with word details
function openPopup(wordId) {
    const popup = document.getElementById('wordPopup');
    const word = wordData.find(w => w.id == wordId);
    if (!word) return;

    document.getElementById('popupWord').textContent = word.word;
    document.getElementById('popupPartOfSpeech').textContent = word.definitions.map(def => def.partOfSpeech).join(', ');

    const definitionsList = document.getElementById('popupDefinitions');
    definitionsList.innerHTML = '';
    word.definitions.forEach(def => {
        def.definitions.forEach(d => {
            const li = document.createElement('li');
            li.textContent = d;
            definitionsList.appendChild(li);
        });
    });

    const examplesList = document.getElementById('popupExamples');
    examplesList.innerHTML = '';
    word.example.forEach(ex => {
        const li = document.createElement('li');
        li.textContent = ex;
        examplesList.appendChild(li);
    });

    if (word.images && word.images.length > 0) {
        document.getElementById('popupImage').src = word.images[0].src;
        document.getElementById('popupImage').alt = word.images[0].alt;
    } else {
        document.getElementById('popupImage').src = '';
        document.getElementById('popupImage').alt = '';
    }

    popup.style.display = 'block';
}

// Close the popup
function closePopup() {
    const popup = document.getElementById('wordPopup');
    popup.style.display = 'none';
}
