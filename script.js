// Sample word data
let wordData = [];
let currentSelectedCell = null;

$(document).ready(function () {
    // List of JSON files to load
    const jsonFiles = [
        "https://raw.githubusercontent.com/whysoseriousoni/gre-vocab/main/data/group_compact_1_8.json",
        "https://raw.githubusercontent.com/whysoseriousoni/gre-vocab/main/data/group_compact_9_12.json",
        "https://raw.githubusercontent.com/whysoseriousoni/gre-vocab/main/data/group_compact_13_20.json",
        "https://raw.githubusercontent.com/whysoseriousoni/gre-vocab/main/data/group_compact_21_28.json",
        "https://raw.githubusercontent.com/whysoseriousoni/gre-vocab/main/data/group_compact_29_36.json",
        "https://raw.githubusercontent.com/whysoseriousoni/gre-vocab/main/data/group_compact_37_46.json",
        "data/group_compact_47_52.json",
    ];

    // Function to load each JSON file and append the data
    function loadJsonFiles(files) {
        let fileLoadPromises = files.map((file) => {
            return $.getJSON(file, function (json) {
                wordData = wordData.concat(json);
            });
        });

        // When all files are loaded, initialize the application
        $.when(...fileLoadPromises).done(function () {
            wordData = wordData.sort(function(a, b){return a.id>b.id})
            console.log(wordData);
            generateWordTable();
            document.addEventListener("keydown", handleKeyPress);
        });
    }

    // Load all JSON files
    loadJsonFiles(jsonFiles);
});

// Generate word table with multiple columns for each set
function generateWordTable() {
    const wordTable = document.getElementById("wordTable");
    wordTable.innerHTML = ""; // Clear existing table

    const uniqueSets = [...new Set(wordData.map((word) => word.set))];

    // Create a header row for the sets
    const headerRow = document.createElement("tr");
    uniqueSets.forEach((set) => {
        const headerCell = document.createElement("th");
        headerCell.textContent = `Set ${set}`;
        headerRow.appendChild(headerCell);
    });
    wordTable.appendChild(headerRow);

    // Create rows for each word in each set
    const maxWordsInSet = Math.max(
        ...uniqueSets.map(
            (set) => wordData.filter((word) => word.set == set).length
        )
    );

    for (let i = 0; i < maxWordsInSet; i++) {
        const row = document.createElement("tr");
        uniqueSets.forEach((set) => {
            const cell = document.createElement("td");
            const word = wordData.find(
                (word) => word.set == set && word.wordNo == i + 1
            );
            if (word) {
                cell.textContent = word.word;
                cell.dataset.wordId = word.id;
                cell.tabIndex = 0; // Make cells focusable
            }
            row.appendChild(cell);
        });
        wordTable.appendChild(row);
    }

    // Select the first cell by default
    const firstCell = wordTable.querySelector("td");
    if (firstCell) {
        selectCell(firstCell);
    }
}

// Handle keyboard key press events
function handleKeyPress(event) {
    if (!currentSelectedCell) return;

    switch (event.key) {
        case "ArrowUp":
            navigate(-1, 0);
            break;
        case "ArrowDown":
            navigate(1, 0);
            break;
        case "ArrowLeft":
            navigate(0, -1);
            break;
        case "ArrowRight":
            navigate(0, 1);
            break;
        case "w":
            currentSelectedCell.classList.add("red");
            currentSelectedCell.classList.remove("green");
            break;
        case "a":
            currentSelectedCell.classList.add("green");
            currentSelectedCell.classList.remove("red");
            break;
        case "d":
            togglePopup(currentSelectedCell.dataset.wordId);
            break;
    }
}

// Navigate the selection
function navigate(rowOffset, colOffset) {
    const rows = Array.from(document.querySelectorAll("#wordTable tr"));
    const currentRowIndex = rows.findIndex((row) =>
        row.contains(currentSelectedCell)
    );
    const currentCellIndex = Array.from(rows[currentRowIndex].cells).indexOf(
        currentSelectedCell
    );

    const newRowIndex = currentRowIndex + rowOffset;
    const newCellIndex = currentCellIndex + colOffset;

    if (newRowIndex >= 0 && newRowIndex < rows.length) {
        const newRow = rows[newRowIndex];
        const newCell = newRow.cells[newCellIndex];
        if (newCell) {
            selectCell(newCell);
        }
    }
}

// Select a cell and highlight it
function selectCell(cell) {
    if (currentSelectedCell) {
        currentSelectedCell.classList.remove("highlight");
    }
    currentSelectedCell = cell;
    currentSelectedCell.classList.add("highlight");
    currentSelectedCell.focus();
}

// Toggle the popup visibility
function togglePopup(wordId) {
    const popup = document.getElementById("wordPopup");
    if (popup.style.display === "block") {
        closePopup();
    } else {
        openPopup(wordId);
    }
}

// Open the popup with word details
function openPopup(wordId) {
    const popup = document.getElementById("wordPopup");
    const word = wordData.find((w) => w.id == wordId);
    if (!word) return;

    document.getElementById("popupWord").textContent = word.word;
    document.getElementById("popupPartOfSpeech").textContent = word.definitions
        .map((def) => def.partOfSpeech)
        .join(", ");
        
    document.getElementById("popupSynonyms").textContent = word.synonyms.join(", ");

    const definitionsList = document.getElementById("popupDefinitions");
    definitionsList.innerHTML = "";
    word.definitions.forEach((def) => {
        def.definitions.forEach((d) => {
            const li = document.createElement("li");
            li.textContent = d;
            definitionsList.appendChild(li);
        });
    });

    const examplesList = document.getElementById("popupExamples");
    examplesList.innerHTML = "";
    word.example.forEach((ex) => {
        const li = document.createElement("li");
        li.textContent = ex;
        examplesList.appendChild(li);
    });

    if (word.images && word.images.length > 0) {
        document.getElementById("popupImage").src = word.images[0].src;
        document.getElementById("popupImage").alt = word.images[0].alt;
    } else {
        document.getElementById("popupImage").src = "";
        document.getElementById("popupImage").alt = "";
    }

    popup.style.display = "block";
}

// Close the popup
function closePopup() {
    const popup = document.getElementById("wordPopup");
    popup.style.display = "none";
}
