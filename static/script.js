const colors = ['yellow', 'green', 'blue', 'purple'];
let selectedColor = 'yellow';
let words = [];
let wordColors = []; // Track color for each word
let draggedElement = null;
let isDragging = false;
let professionalMode = true;

// Text mappings for game vs professional mode
const textMappings = {
    game: {
        title: 'Word Grouping Game',
        inputTitle: 'Enter 16 Words',
        startButton: 'Start Game',
        resetButton: 'Reset Game',
        colorSelectorTitle: 'Select Color:',
        sidebarTitle: 'Group Notes',
        notePlaceholder: 'What connects these words?',
        wordInputPlaceholder: 'Enter 16 words, one per line or separated by commas',
        alertMessage: 'Please enter exactly 16 words'
    },
    professional: {
        title: 'Word Classification Tool',
        inputTitle: 'Enter 16 Items',
        startButton: 'Begin Analysis',
        resetButton: 'Reset Analysis',
        colorSelectorTitle: 'Select Category:',
        sidebarTitle: 'Category Notes',
        notePlaceholder: 'Describe the relationship or classification criteria',
        wordInputPlaceholder: 'Enter 16 items, one per line or separated by commas',
        alertMessage: 'Please enter exactly 16 items'
    }
};

// Category labels
const categoryLabels = {
    game: {
        yellow: 'Yellow',
        green: 'Green',
        blue: 'Blue',
        purple: 'Purple'
    },
    professional: {
        yellow: 'Category A',
        green: 'Category B',
        blue: 'Category C',
        purple: 'Category D'
    }
};

// Professional mode toggle handler
document.getElementById('professional-mode').addEventListener('change', function() {
    professionalMode = this.checked;
    document.body.classList.toggle('professional-mode', professionalMode);
    updateAllText();
    updateCategoryLabels();
});

// Update all text based on current mode
function updateAllText() {
    const mode = professionalMode ? 'professional' : 'game';
    const texts = textMappings[mode];
    
    document.getElementById('main-title').textContent = texts.title;
    document.getElementById('page-title').textContent = texts.title;
    document.getElementById('input-title').textContent = texts.inputTitle;
    document.getElementById('start-game').textContent = texts.startButton;
    document.getElementById('reset-game').textContent = texts.resetButton;
    document.getElementById('color-selector-title').textContent = texts.colorSelectorTitle;
    document.getElementById('sidebar-title').textContent = texts.sidebarTitle;
    document.getElementById('word-input').placeholder = texts.wordInputPlaceholder;
    
    // Update note placeholders
    document.querySelectorAll('.note-input').forEach(textarea => {
        textarea.placeholder = texts.notePlaceholder;
    });
}

// Update category labels
function updateCategoryLabels() {
    const mode = professionalMode ? 'professional' : 'game';
    const labels = categoryLabels[mode];
    
    // Update color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        const color = btn.dataset.color;
        btn.textContent = labels[color];
    });
    
    // Update sidebar labels
    document.querySelectorAll('.color-label').forEach(label => {
        const colorNote = label.closest('.color-note');
        if (colorNote) {
            const color = colorNote.classList[1].replace('-note', '');
            label.textContent = labels[color];
            
            // Add/remove color class for CSS styling
            label.className = 'color-label ' + color;
        }
    });
}

document.getElementById('start-game').addEventListener('click', function() {
    const input = document.getElementById('word-input').value.trim();
    
    // Parse words - split by newlines or commas
    words = input.split(/[\n,]+/)
        .map(word => word.trim())
        .filter(word => word.length > 0);
    
    const mode = professionalMode ? 'professional' : 'game';
    if (words.length !== 16) {
        alert(textMappings[mode].alertMessage);
        return;
    }
    
    // Initialize word colors array
    wordColors = new Array(16).fill('');
    
    // Hide input section and show game
    document.querySelector('.input-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    document.getElementById('sidebar').style.display = 'block';
    
    // Create grid
    createGrid();
    
    // Initialize color selector
    initializeColorSelector();
});

document.getElementById('reset-game').addEventListener('click', function() {
    // Reset everything
    words = [];
    wordColors = [];
    selectedColor = 'yellow';
    draggedElement = null;
    isDragging = false;
    document.getElementById('word-input').value = '';
    document.querySelector('.input-section').style.display = 'block';
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('sidebar').style.display = 'none';
    
    // Clear notes
    document.getElementById('yellow-note').value = '';
    document.getElementById('green-note').value = '';
    document.getElementById('blue-note').value = '';
    document.getElementById('purple-note').value = '';
});

function createGrid() {
    const grid = document.getElementById('word-grid');
    grid.innerHTML = '';
    
    words.forEach((word, index) => {
        const block = document.createElement('div');
        block.className = 'word-block';
        block.textContent = word;
        block.dataset.index = index;
        block.draggable = true;
        
        // Restore color if it exists
        if (wordColors[index]) {
            block.classList.add(wordColors[index]);
        }
        
        // Click handler for color selection
        block.addEventListener('click', function(e) {
            // Don't apply color if we just finished dragging
            if (!isDragging) {
                applyColor(this);
            }
        });
        
        // Drag and drop handlers
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
        block.addEventListener('dragover', handleDragOver);
        block.addEventListener('drop', handleDrop);
        block.addEventListener('dragenter', handleDragEnter);
        block.addEventListener('dragleave', handleDragLeave);
        
        grid.appendChild(block);
    });

    // Fit text to blocks after layout (reduces font size for long text to prevent wrapping)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => fitTextToBlocks());
    });
}

function fitTextToBlocks() {
    const blocks = document.querySelectorAll('.word-block');
    if (blocks.length === 0) return;

    const baseFontSize = 14;
    const minFontSize = 8;

    blocks.forEach(block => {
        // Use original word from words array - block may have '\n' from previous fit
        const index = parseInt(block.dataset.index, 10);
        const text = (words[index] || block.textContent || '').trim();
        const hasMultipleWords = text.indexOf(' ') !== -1;

        // Disable transition during fitting for accurate, deterministic measurements
        block.classList.add('fitting');
        block.style.fontSize = '';

        let fontSize = baseFontSize;
        block.style.fontSize = fontSize + 'px';

        if (hasMultipleWords) {
            // Multi-word: force line break between words first (e.g. "Weather\nvane")
            block.textContent = text.replace(' ', '\n');
            block.style.whiteSpace = 'pre-line';
            void block.offsetHeight;

            while ((block.scrollHeight > block.clientHeight || block.scrollWidth > block.clientWidth) && fontSize > minFontSize) {
                fontSize -= 1;
                block.style.fontSize = fontSize + 'px';
                void block.offsetHeight;
            }
        } else {
            // Single word: keep on one line, shrink if too wide
            block.style.whiteSpace = 'nowrap';
            void block.offsetHeight;

            while (block.scrollWidth > block.clientWidth && fontSize > minFontSize) {
                fontSize -= 1;
                block.style.fontSize = fontSize + 'px';
                void block.offsetHeight;
            }
        }

        block.classList.remove('fitting');
    });
}

function initializeColorSelector() {
    // Set default selected color
    updateColorSelector();
    
    // Add click handlers to color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedColor = this.dataset.color;
            updateColorSelector();
        });
    });
}

function updateColorSelector() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.color === selectedColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function applyColor(block) {
    const index = parseInt(block.dataset.index);
    const currentColor = wordColors[index];
    
    // If block already has the selected color, remove it
    if (currentColor === selectedColor) {
        // Remove all color classes
        colors.forEach(color => block.classList.remove(color));
        wordColors[index] = '';
    } else {
        // Remove all color classes first
        colors.forEach(color => block.classList.remove(color));
        
        // Add selected color
        if (selectedColor) {
            block.classList.add(selectedColor);
            wordColors[index] = selectedColor;
        } else {
            wordColors[index] = '';
        }
    }
}

function handleDragStart(e) {
    draggedElement = this;
    isDragging = false;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Set a timeout to distinguish drag from click
    setTimeout(() => {
        isDragging = true;
    }, 100);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove drag-over class from all blocks
    document.querySelectorAll('.word-block').forEach(block => {
        block.classList.remove('drag-over');
    });
    
    // Reset dragging flag after a short delay
    setTimeout(() => {
        isDragging = false;
    }, 100);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const fromIndex = parseInt(draggedElement.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        // Swap words
        [words[fromIndex], words[toIndex]] = [words[toIndex], words[fromIndex]];
        
        // Swap colors
        [wordColors[fromIndex], wordColors[toIndex]] = [wordColors[toIndex], wordColors[fromIndex]];
        
        // Recreate grid with new order
        createGrid();
    }
    
    this.classList.remove('drag-over');
    return false;
}

// Save notes to localStorage
document.querySelectorAll('.note-input').forEach(textarea => {
    textarea.addEventListener('input', function() {
        localStorage.setItem(this.id, this.value);
    });
    
    // Load saved notes
    const saved = localStorage.getItem(this.id);
    if (saved) {
        this.value = saved;
    }
});

// Debounced resize handler for fitting text when window/grid size changes
let fitTextTimeout;
function scheduleFitTextToBlocks() {
    clearTimeout(fitTextTimeout);
    fitTextTimeout = setTimeout(() => fitTextToBlocks(), 100);
}

// Initialize professional mode on page load
(function() {
    const professionalModeCheckbox = document.getElementById('professional-mode');
    if (professionalModeCheckbox) {
        professionalModeCheckbox.checked = professionalMode;
        document.body.classList.toggle('professional-mode', professionalMode);
        updateAllText();
        updateCategoryLabels();
    }

    // Re-fit text when window is resized
    window.addEventListener('resize', scheduleFitTextToBlocks);

    // Re-fit when grid container size changes (e.g. sidebar toggling, flex layout)
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer && typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(scheduleFitTextToBlocks);
        resizeObserver.observe(gridContainer);
    }
})();

