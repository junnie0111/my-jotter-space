// 🌟 GLOBAL VARIABLES FOR CHAPTER MANAGEMENT
let documents = {};           // Holds all chapters' content
let currentChapter = null;    // Currently open chapter


// Create editable page
function createEditablePage() {
  const page = document.createElement('div');
  page.className = 'editable-page-content';
  page.contentEditable = true;
  page.setAttribute('spellcheck', 'false');

  page.addEventListener('input', () => {
    setTimeout(() => {
      checkForPageBreaks();
      updateCounts();
      saveCurrentDoc();
    }, 10);
  });

  page.addEventListener('keyup', () => {
    setTimeout(() => {
      checkForPageBreaks();
    }, 10);
  });

  page.addEventListener('paste', () => {
    setTimeout(() => {
      checkForPageBreaks();
      updateCounts();
      saveCurrentDoc();
    }, 50);
  });

  return page;
}


function checkForPageBreaks() {
  const pages = document.querySelectorAll('.editable-page-content');
  const lastPage = pages[pages.length - 1];

  // Temporarily allow scrolling to detect overflow
  lastPage.style.overflowY = 'auto';

  const buffer = 10; // small buffer to prevent early break
  if (lastPage.scrollHeight - lastPage.clientHeight > buffer) {
    // Lock the current page's height
    lastPage.style.overflowY = 'hidden';

    const newPage = createEditablePage();
    document.getElementById('textArea').appendChild(newPage);
    newPage.focus();
    updateCounts();
  } else {
    lastPage.style.overflowY = 'hidden'; // Always hide scrollbars again
  }
}



function initializeApp() {
  const textArea = document.getElementById('textArea');
  const firstPage = createEditablePage();
  textArea.appendChild(firstPage);
  console.log("✅ Page view ready with page breaks");
  // Create a default chapter to start
  documents["Chapter 1"] = '';
  refreshBinderList();
  loadChapter("Chapter 1");
  updateCounts(); // 👈 Add this just in case
}
function debugPageBoundaries() {
  // Add visual indicators to see the actual page boundaries
  document.querySelectorAll('.editable-page-content').forEach((page, index) => {
    // Add a colored border to see the actual page element
    page.style.outline = '3px solid red';
    
    // Add a label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: -25px;
      left: 0;
      background: red;
      color: white;
      padding: 2px 8px;
      font-size: 12px;
      z-index: 1000;
    `;
    label.textContent = `Page ${index + 1}`;
    page.style.position = 'relative';
    page.appendChild(label);
    
    // Log page position info
    const rect = page.getBoundingClientRect();
    console.log(`Page ${index + 1}:`, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      offsetLeft: page.offsetLeft,
      offsetTop: page.offsetTop
    });
  });
}
window.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  // Default book setup
  const defaultDimensions = getBookDimensions('6x9');
  const defaultMargins = calculateMargins(200);
  applyBookFormatting(defaultDimensions, defaultMargins);

  updateCounts(); // ✅ Make sure this line exists
});


//word and page counts//
function updateCounts() {
  const pageCount = document.querySelectorAll('.editable-page-content').length;
  document.getElementById('pageCount').textContent = `Pages: ${pageCount}`;

  let totalText = '';
  document.querySelectorAll('.editable-page-content').forEach(page => {
    totalText += page.innerText + ' ';
  });

  const wordCount = totalText.trim().split(/\s+/).filter(word => word.length > 0).length;
  document.getElementById('wordCount').textContent = `Words: ${wordCount}`;
}


// ===============================
// 📁 Chapter Binder System
// ===============================

// Add a new blank chapter
document.getElementById('newDocButton').addEventListener('click', () => {
  const name = prompt('Name your new chapter:');
  if (!name || documents[name]) return;

  documents[name] = '';
  currentChapter = name;
  refreshBinderList();
  loadChapter(name);
});

// Load a chapter's content into the editor
function loadChapter(name) {
  currentChapter = name;
  const textArea = document.getElementById('textArea');
  textArea.innerHTML = ''; // Clear editor

  // Load saved HTML and rebuild pages
  if (documents[name]) {
    textArea.innerHTML = documents[name];

    const pageCount = textArea.querySelectorAll('.editable-page-content').length;
    if (pageCount === 0) {
      const newPage = createEditablePage();
      textArea.appendChild(newPage);
    }

    checkForPageBreaks();
    updateCounts();
  } else {
    // If it's new or content is empty, create a new page
    const newPage = createEditablePage();
    textArea.appendChild(newPage);
    updateCounts();
  }
  // Focus inside the first safe zone when switching chapters
setTimeout(() => {
  const firstZone = document.querySelector('.safe-zone-box');
  if (firstZone) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(firstZone);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}, 10);

}


// Redraw binder list on screen
function refreshBinderList() {
  const list = document.getElementById('binderList');
  list.innerHTML = '';

  Object.keys(documents).forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    li.addEventListener('click', () => {
      saveCurrentDoc();
      loadChapter(name);
    });
    list.appendChild(li);
  });
}

// Save changes to the current document
function saveCurrentDoc() {
  if (!currentChapter) return;

  const pages = document.querySelectorAll('.editable-page-content');
  let combinedHTML = '';
  pages.forEach(page => combinedHTML += page.outerHTML);

  documents[currentChapter] = combinedHTML;
}

// ===============================
// 📋 Menu Bar System
// ===============================

// Helper to close all dropdowns
function closeAllMenus() {
  document.getElementById('fileMenu').style.display   = 'none';
  document.getElementById('editMenu').style.display   = 'none';
  document.getElementById('insertMenu').style.display = 'none';
  document.getElementById('viewMenu').style.display   = 'none';
}

// 1) Toggle File menu
document.getElementById('fileLabel').addEventListener('click', function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('fileMenu');
  const isOpen = dropdown.style.display === 'block';
  closeAllMenus();
  dropdown.style.display = isOpen ? 'none' : 'block';
});

// 2) Toggle Edit menu
document.getElementById('editLabel').addEventListener('click', function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('editMenu');
  const isOpen = dropdown.style.display === 'block';
  closeAllMenus();
  dropdown.style.display = isOpen ? 'none' : 'block';
});

// 3) Toggle Insert menu
document.getElementById('insertLabel').addEventListener('click', function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('insertMenu');
  const isOpen = dropdown.style.display === 'block';
  closeAllMenus();
  dropdown.style.display = isOpen ? 'none' : 'block';
});

// 4) Toggle View menu
document.getElementById('viewLabel').addEventListener('click', function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('viewMenu');
  const isOpen = dropdown.style.display === 'block';
  closeAllMenus();
  dropdown.style.display = isOpen ? 'none' : 'block';
});

// Close any open dropdown if clicking outside the menu bar
document.addEventListener('click', function(e) {
  const menuBar = document.getElementById('menuBar');
  if (!menuBar.contains(e.target)) {
    closeAllMenus();
  }
});


// Save all chapters as a downloadable file
function saveProjectAs() {
  // Create the project data
  const projectData = {
    chapters: documents,
    created: new Date().toISOString(),
    appVersion: "1.0"
  };
  
  // Convert to JSON format
  const jsonString = JSON.stringify(projectData, null, 2);
  
  // Create download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and click it
  const a = document.createElement('a');
  a.href = url;
  
  // Ask user for project name
  const projectName = prompt('Name your project:', lastSavedFileName || 'My Writing Project');
  if (!projectName) return; // Cancel if they clicked cancel
  
  lastSavedFileName = projectName; // Remember this name for quick saves
  
  a.download = projectName + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showSaveConfirmation();
}

// Quick save (uses last filename or prompts for one)
let lastSavedFileName = null;

function saveProject() {
  // If we haven't saved before, do Save As instead
  if (!lastSavedFileName) {
    saveProjectAs();
    return;
  }
  
  // Create the project data
  const projectData = {
    chapters: documents,
    created: new Date().toISOString(),
    appVersion: "1.0",
    projectName: lastSavedFileName
  };
  
  // Convert to JSON format
  const jsonString = JSON.stringify(projectData, null, 2);
  
  // Create download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and click it
  const a = document.createElement('a');
  a.href = url;
  a.download = lastSavedFileName + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show brief confirmation
  showSaveConfirmation();
}

// Show import options dialog
function showImportDialog() {
  // Go directly to file picker - no confirm dialog
  importTextFile();
}

// Import plain text files
function importTextFile() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt';
  fileInput.style.display = 'none';
  
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const content = event.target.result;
      const chapterName = prompt('Name for imported chapter:', file.name.replace('.txt', ''));
      
      if (chapterName) {
        // Create new chapter with imported content
        documents[chapterName] = `<div class="editable-page-content">${content.replace(/\n/g, '<br>')}</div>`;
        refreshBinderList();
        loadChapter(chapterName);
        alert('Chapter imported successfully!');
      }
    };
    
    reader.readAsText(file);
    document.body.removeChild(fileInput);
  });
  
  document.body.appendChild(fileInput);
  fileInput.click();
}

// Show export options dialog  
function showExportDialog() {
  const options = `Choose export format:
1 - Plain Text (.txt)
2 - HTML (.html)

Enter 1 or 2:`;
  
  const choice = prompt(options);
  
  if (choice === '1') {
    exportAsText();
  } else if (choice === '2') {
    exportAsHTML();
  }
}

// Export current chapter as plain text
function exportAsText() {
  if (!currentChapter) {
    alert('No chapter open to export!');
    return;
  }
  
  // Get all text from current chapter
  let allText = '';
  const pages = document.querySelectorAll('.editable-page-content');
  pages.forEach(page => {
    allText += page.innerText + '\n\n--- Page Break ---\n\n';
  });
  
  // Create download
  const blob = new Blob([allText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentChapter + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export current chapter as HTML
function exportAsHTML() {
  if (!currentChapter) {
    alert('No chapter open to export!');
    return;
  }
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${currentChapter}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
    .page { page-break-after: always; margin-bottom: 40px; }
  </style>
</head>
<body>
  <h1>${currentChapter}</h1>
  ${documents[currentChapter]}
</body>
</html>`;
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentChapter + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Show a brief "Saved!" message
function showSaveConfirmation() {
  const confirmation = document.createElement('div');
  confirmation.textContent = 'Project saved!';
  confirmation.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
  `;
  document.body.appendChild(confirmation);
  
  setTimeout(() => {
    document.body.removeChild(confirmation);
  }, 2000);
}

// Open a saved project file
function openProject() {
  // Create invisible file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const projectData = JSON.parse(event.target.result);
        
        // Load the project
        documents = projectData.chapters || {};
        
        // If no chapters, create a default one
        if (Object.keys(documents).length === 0) {
          documents["Chapter 1"] = '';
        }
        
        // Refresh the binder and load first chapter
        refreshBinderList();
        const firstChapter = Object.keys(documents)[0];
        loadChapter(firstChapter);
        
        const projectName = projectData.projectName || 'Untitled Project';
        alert(`"${projectName}" loaded successfully!`);
        
      } catch (error) {
        alert('Error opening file. Please make sure it\'s a valid project file.');
      }
    };
    
    reader.readAsText(file);
    document.body.removeChild(fileInput);
  });
  
  // Trigger file picker
  document.body.appendChild(fileInput);
  fileInput.click();
}

// Show New Book Setup Dialog
function showNewBookDialog() {
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Create dialog box
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 500px;
    width: 90%;
  `;
  
  dialog.innerHTML = `
<h2 style="margin-top: 0; color: #333;">Create New Book Project</h2>
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Project Name:</label>
      <input type="text" id="dialogProjectName" placeholder="Enter your book title..." 
             style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Book Type:</label>
      <select id="dialogBookType" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <option value="novel">Novel</option>
        <option value="novella">Novella</option>
        <option value="children">Children's Book</option>
        <option value="poetry">Poetry</option>
        <option value="manuscript">Manuscript</option>
        <option value="textbook">Textbook</option>
      </select>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Book Size:</label>
      <select id="dialogBookSize" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
<option value="5x8">5" × 8" (Compact novels)</option>
<option value="5.06x7.81">5.06" × 7.81" (General fiction)</option>
<option value="5.25x8">5.25" × 8" (Digest size)</option>
<option value="5.5x8.5">5.5" × 8.5" (Trade paperback)</option>
<option value="6x9" selected>6" × 9" (Most popular)</option>
<option value="6.14x9.21">6.14" × 9.21" (KDP standard)</option>
<option value="6.69x9.61">6.69" × 9.61" (Biographies, fiction)</option>
<option value="7x10">7" × 10" (Textbooks)</option>
<option value="7.44x9.69">7.44" × 9.69" (Children’s books)</option>
<option value="7.5x9.25">7.5" × 9.25" (Photography, kids books)</option>
<option value="8x10">8" × 10" (Large format)</option>
<option value="8.25x6">8.25" × 6" (Activity books)</option>
<option value="8.25x8.25">8.25" × 8.25" (Square books)</option>
<option value="8.5x8.5">8.5" × 8.5" (Children’s books)</option>
<option value="8.5x11">8.5" × 11" (Workbooks)</option>
<option value="8.27x11.69">8.27" × 11.69" (A4)</option>
      </select>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Estimated Page Count:</label>
      <input type="number" id="dialogPageCount" value="200" min="24" max="828"
             style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      <small style="color: #666;">This determines the gutter size (binding space)</small>
    </div>
    
    <div style="text-align: right; margin-top: 30px;">
      <button id="cancelBook" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="createBook" style="padding: 8px 16px; border: none; background: #007cba; color: white; border-radius: 4px; cursor: pointer;">Create Book</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Handle cancel
  document.getElementById('cancelBook').onclick = () => {
    document.body.removeChild(overlay);
  };
  
  // Handle create book
  document.getElementById('createBook').onclick = () => {
    createNewBook();
    document.body.removeChild(overlay);
  };
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}


function createNewBook() {
  console.log('createNewBook function called');
  
  // Check if elements exist - USING THE NEW DIALOG IDs
  const bookTypeElement = document.getElementById('dialogBookType');
  const bookSizeElement = document.getElementById('dialogBookSize');
  const pageCountElement = document.getElementById('dialogPageCount');
  const projectNameElement = document.getElementById('dialogProjectName');
  
  if (!bookTypeElement || !bookSizeElement || !pageCountElement || !projectNameElement) {
    console.error('Missing form elements');
    alert('Error: Form elements not found');
    return;
  }
  
  const bookType = bookTypeElement.value;
  const bookSize = bookSizeElement.value;
  const pageCount = parseInt(pageCountElement.value);
  const projectName = projectNameElement.value.trim() || 'Untitled Project';
  
  console.log('Form values:', { bookType, bookSize, pageCount, projectName });
  
  try {
    // Calculate proper margins based on Amazon KDP specs
    const margins = calculateMargins(pageCount);
    const dimensions = getBookDimensions(bookSize);
    console.log('Calculated margins and dimensions');

    // Apply the new book formatting
    applyBookFormatting(dimensions, margins);
    console.log('Applied book formatting');

    // Clear current project and start fresh
    documents = {};
    documents[projectName + " - Chapter 1"] = '';
    currentChapter = projectName + " - Chapter 1";
    refreshBinderList();
    loadChapter(currentChapter);
    console.log('Created new project');

    // Update the book info bar - using the STATUS BAR IDs
    const bookTitleEl = document.getElementById('bookTitle');
    const bookTypeStatusEl = document.getElementById('bookType');
    const bookSizeStatusEl = document.getElementById('bookSize');
    const bookMarginsEl = document.getElementById('bookMargins');
    const estimatedPagesEl = document.getElementById('estimatedPages');
    
    if (bookTitleEl) bookTitleEl.textContent = projectName;
    if (bookTypeStatusEl) bookTypeStatusEl.textContent = bookType.charAt(0).toUpperCase() + bookType.slice(1);
    if (bookSizeStatusEl) bookSizeStatusEl.textContent = bookSize.replace('x', '" × ') + '"';
    if (bookMarginsEl) bookMarginsEl.textContent = `Gutter: ${margins.gutter}"`;
    if (estimatedPagesEl) estimatedPagesEl.textContent = `~${pageCount} pages`;

    alert(`Created "${projectName}" as ${bookType} in ${bookSize} format!\nGutter: ${margins.gutter}" | Margins: ${margins.outside}"`);
    
  } catch (error) {
    console.error('Error in createNewBook:', error);
    alert('Error creating book: ' + error.message);
  }
}


function calculateMargins(pageCount) {
  let gutter;
  if (pageCount <= 150) gutter = 0.375;
  else if (pageCount <= 300) gutter = 0.5;
  else if (pageCount <= 500) gutter = 0.625;
  else if (pageCount <= 700) gutter = 0.75;
  else gutter = 0.875;
  
  return {
    gutter: gutter,
    outside: 0.375,
    top: 0.75,
    bottom: 0.75
  };
}

// Get dimensions for each book size
function getBookDimensions(bookSize) {
const sizes = {
  '5x8': { width: 480, height: 768 },
  '5.06x7.81': { width: 485.76, height: 749.76 },
  '5.25x8': { width: 504, height: 768 },
  '5.5x8.5': { width: 528, height: 816 },
  '6x9': { width: 576, height: 864 },
  '6.14x9.21': { width: 589.44, height: 884.16 },
  '6.69x9.61': { width: 642.24, height: 922.56 },
  '7x10': { width: 672, height: 960 },
  '7.44x9.69': { width: 714.24, height: 930.24 },
  '7.5x9.25': { width: 720, height: 888 },
  '8x10': { width: 768, height: 960 },
  '8.25x6': { width: 792, height: 576 },
  '8.25x8.25': { width: 792, height: 792 },
  '8.5x8.5': { width: 816, height: 816 },
  '8.5x11': { width: 816, height: 1056 },
  '8.27x11.69': { width: 793.92, height: 1122.24 } // A4
};

  return sizes[bookSize] || sizes['6x9'];
}

// Apply book formatting
function applyBookFormatting(dimensions, margins) {
  const gutterPx = margins.gutter * 96;
  const outsidePx = margins.outside * 96;
  const topPx = margins.top * 96;
  const bottomPx = (margins.bottom + 0.8) * 96;

  const style = document.createElement('style');
  style.innerHTML = `
    .editable-page-content {
      width: ${dimensions.width}px;
      height: ${dimensions.height}px;
      margin: 20px auto;
      border: 1px solid #ccc;
      background-color: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      box-sizing: border-box;
      word-wrap: break-word;
      outline: none;
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
      display: block;
    }

    .editable-page-content:nth-child(odd) {
      padding: ${topPx}px ${outsidePx}px ${bottomPx}px ${gutterPx}px;
    }

    .editable-page-content:nth-child(even) {
      padding: ${topPx}px ${gutterPx}px ${bottomPx}px ${outsidePx}px;
    }
  `;

  const oldStyle = document.getElementById('bookFormatStyle');
  if (oldStyle) oldStyle.remove();

  style.id = 'bookFormatStyle';
  document.head.appendChild(style);
}






// ===============================
// 📝 Formatting Toolbar Functions
// ===============================
// Helper function to format selected text
function formatText(command, value = null) {
  document.execCommand(command, false, value);
  
  // Try to keep focus on the text area
  try {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      
      // If it's a text node, get its parent element
      if (node.nodeType === 3) {
        node = node.parentElement;
      }
      
      // Find the closest editable page
      let editablePage = null;
      while (node && !editablePage) {
        if (node.classList && node.classList.contains('editable-page-content')) {
          editablePage = node;
        }
        node = node.parentElement;
      }
      
      if (editablePage) {
        editablePage.focus();
      }
    }
  } catch (e) {
    // If anything goes wrong, just continue - the formatting still worked
    console.log('Focus error, but formatting applied');
  }
}

// Bold button
document.getElementById('boldBtn').addEventListener('click', () => {
  formatText('bold');
});

// Italic button
document.getElementById('italicBtn').addEventListener('click', () => {
  formatText('italic');
});

// Underline button
document.getElementById('underlineBtn').addEventListener('click', () => {
  formatText('underline');
});

// Font family dropdown
document.getElementById('fontSelect').addEventListener('change', (e) => {
  formatText('fontName', e.target.value);
});

// Font size dropdown
document.getElementById('fontSizeSelect').addEventListener('change', (e) => {
  // Font size needs special handling
  const size = e.target.value;
  const sizeMap = {
    '10pt': '2',
    '12pt': '3',
    '14pt': '4',
    '16pt': '5',
    '18pt': '6'
  };
  formatText('fontSize', sizeMap[size]);
});

// Heading dropdown
document.getElementById('headingSelect').addEventListener('change', (e) => {
  const value = e.target.value;
  if (value === 'normal') {
    formatText('formatBlock', 'p');
  } else {
    formatText('formatBlock', value);
  }
});

// Alignment dropdown
document.getElementById('alignSelect').addEventListener('change', (e) => {
  const alignments = {
    'left': 'justifyLeft',
    'center': 'justifyCenter',
    'right': 'justifyRight',
    'justify': 'justifyFull'
  };
  formatText(alignments[e.target.value]);
});

// Undo button
document.getElementById('undoBtn').addEventListener('click', () => {
  document.execCommand('undo');
});

// Redo button
document.getElementById('redoBtn').addEventListener('click', () => {
  document.execCommand('redo');
});


// Store the current selection
let savedSelection = null;

// Function to save the current selection
function saveSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0);
  }
}

// Function to restore the selection
function restoreSelection() {
  if (savedSelection) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
  }
}

// Text color palette
const textColorButton = document.getElementById('textColorButton');
const textColorPalette = document.getElementById('textColorPalette');

textColorButton.addEventListener('click', (e) => {
  e.stopPropagation();
  saveSelection(); // Save selection before showing palette
  textColorPalette.style.display = textColorPalette.style.display === 'none' ? 'block' : 'none';
  highlightPalette.style.display = 'none';
});

textColorPalette.addEventListener('click', (e) => {
  if (e.target.classList.contains('color-swatch')) {
    const color = e.target.getAttribute('data-color');
    restoreSelection(); // Restore selection before applying color
    formatText('foreColor', color);
    textColorPalette.style.display = 'none';
  }
});

// Highlight color palette
const highlightButton = document.getElementById('highlightButton');
const highlightPalette = document.getElementById('highlightPalette');

highlightButton.addEventListener('click', (e) => {
  e.stopPropagation();
  saveSelection(); // Save selection before showing palette
  highlightPalette.style.display = highlightPalette.style.display === 'none' ? 'block' : 'none';
  textColorPalette.style.display = 'none';
});

highlightPalette.addEventListener('click', (e) => {
  if (e.target.classList.contains('color-swatch')) {
    const color = e.target.getAttribute('data-color');
    restoreSelection(); // Restore selection before applying color
    if (color === 'transparent') {
      formatText('removeFormat');
    } else {
      formatText('hiliteColor', color);
    }
    highlightPalette.style.display = 'none';
  }
});

// Close palettes when clicking elsewhere
document.addEventListener('click', () => {
  textColorPalette.style.display = 'none';
  highlightPalette.style.display = 'none';
});  


// 📋 Menu-Option Click Handler
document.querySelectorAll('.menu-option').forEach(option => {
  option.addEventListener('click', function() {
    const text = this.textContent.trim();

    // ---- FILE → EXPORT submenu options ----
    if (text === 'Export to PDF') {
      exportToPDF();
    } else if (text === 'Export to .docx') {
      exportToDocx();
    } else if (text === 'Export Chapter (.txt)') {
      exportAsText();
    } else if (text === 'Export Chapter (.html)') {
      exportAsHTML();

    // ---- EDIT menu options ----
    } else if (text === 'Find…') {
      showFindDialog();
    } else if (text === 'Replace…') {
      showReplaceDialog();

    // ---- INSERT menu options ----
   } else if (text === 'Insert Image…') {
  insertImageAtCursor();
    } else if (text === 'Insert Special Character…') {
      insertSpecialCharacter();
    } else if (text === 'Insert Text Box…') {
  insertTextBox();
    // ---- VIEW menu options ----
    } else if (text === 'Writing Goals…') {
      showWritingGoalsDialog();
    } else if (text === 'Writing Statistics') {
      showWritingStatistics();
    } else if (text === 'Focus Mode') {
      toggleFocusMode();

    // ---- OTHER existing menu options (unchanged) ----
    } else if (text === 'Save Project As...') {
      saveProjectAs();
    } else if (text === 'Save Project') {
      saveProject();
    } else if (text === 'Open') {
      openProject();
    } else if (text === 'New Project/Book') {
      showNewBookDialog();
    } else if (text.includes('Import')) {
      showImportDialog();
    } else if (text.includes('Export')) {
      showExportDialog();
    } else {
      console.log(`Clicked menu option: ${text}`);
    }

    // Close File menu after click
    document.getElementById('fileMenu').style.display = 'none';
  });
});

// ===============================
// ⌨️ Keyboard Shortcuts
// ===============================
document.addEventListener('keydown', (e) => {
  // Ctrl+S or Cmd+S for Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveProject();
  }
  // Ctrl+Shift+S or Cmd+Shift+S for Save As
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    saveProjectAs();
  }
  // Ctrl+O or Cmd+O for Open
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    openProject();
  }
  // Ctrl+B for Bold
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    formatText('bold');
  }
  // Ctrl+I for Italic
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    formatText('italic');
  }
  // Ctrl+U for Underline
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault();
    formatText('underline');
  }
  // Ctrl+Z (Undo)
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    document.execCommand('undo');
  }
  // Ctrl+Y (Redo)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault();
    document.execCommand('redo');
  }
});

//this is the writing statistics info
// Writing Statistics Function
function showWritingStatistics() {
  // Get current text from all pages
  let allText = '';
  document.querySelectorAll('.editable-page-content').forEach(page => {
    allText += page.innerText + ' ';
  });
  
  // Calculate statistics
  const words = allText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const charCount = allText.length;
  const charCountNoSpaces = allText.replace(/\s/g, '').length;
  const paragraphs = allText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const pages = document.querySelectorAll('.editable-page-content').length;
  
  // Estimate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);
  
  // Create the statistics window
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 2000;
    display: flex; align-items: center; justify-content: center;
  `;
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white; padding: 30px; border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 400px; width: 90%;
  `;
  
  dialog.innerHTML = `
    <h2 style="margin-top: 0; color: #333;">📊 Writing Statistics</h2>
    <div style="line-height: 1.6;">
      <p><strong>Words:</strong> ${wordCount.toLocaleString()}</p>
      <p><strong>Characters (with spaces):</strong> ${charCount.toLocaleString()}</p>
      <p><strong>Characters (no spaces):</strong> ${charCountNoSpaces.toLocaleString()}</p>
      <p><strong>Paragraphs:</strong> ${paragraphs}</p>
      <p><strong>Pages:</strong> ${pages}</p>
      <p><strong>Estimated reading time:</strong> ${readingTime} minute${readingTime !== 1 ? 's' : ''}</p>
    </div>
    <button onclick="this.closest('.overlay').remove()" 
            style="margin-top: 20px; padding: 8px 16px; background: #007cba; 
                   color: white; border: none; border-radius: 4px; cursor: pointer;">
      Close
    </button>
  `;
  
  overlay.className = 'overlay';
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Close when clicking outside
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}

//this is the function for goal setting
// Writing Goals System
let writingGoals = {
  dailyWordTarget: 500,
  sessionStartWords: 0,
  todayStartWords: 0
};

function showWritingGoalsDialog() {
  // Get current word count
  let allText = '';
  document.querySelectorAll('.editable-page-content').forEach(page => {
    allText += page.innerText + ' ';
  });
  const currentWords = allText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate progress
  const sessionProgress = Math.max(0, currentWords - writingGoals.sessionStartWords);
  const dailyProgress = Math.max(0, currentWords - writingGoals.todayStartWords);
  const dailyPercentage = Math.round((dailyProgress / writingGoals.dailyWordTarget) * 100);
  
  // Create the goals window
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 2000;
    display: flex; align-items: center; justify-content: center;
  `;
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white; padding: 30px; border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 450px; width: 90%;
  `;
  
  dialog.innerHTML = `
    <h2 style="margin-top: 0; color: #333;">🎯 Writing Goals</h2>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Daily Word Target:</label>
      <input type="number" id="dailyTarget" value="${writingGoals.dailyWordTarget}" min="50" max="10000"
             style="width: 100px; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
      <button onclick="updateDailyGoal()" 
              style="margin-left: 10px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Update Goal
      </button>
    </div>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <h3 style="margin-top: 0;">📈 Today's Progress</h3>
      <p><strong>Daily Goal:</strong> ${writingGoals.dailyWordTarget} words</p>
      <p><strong>Words Written Today:</strong> ${dailyProgress} words</p>
      <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0;">
        <div style="background: #28a745; height: 100%; width: ${Math.min(100, dailyPercentage)}%; transition: width 0.3s;"></div>
      </div>
      <p style="margin: 0;"><strong>Progress:</strong> ${dailyPercentage}% complete</p>
    </div>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <h3 style="margin-top: 0;">✍️ This Session</h3>
      <p><strong>Words Written:</strong> ${sessionProgress} words</p>
    </div>
    
    <div style="text-align: right;">
      <button onclick="resetSessionCounter()" 
              style="margin-right: 10px; padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;">
        Reset Session
      </button>
      <button onclick="this.closest('.overlay').remove()" 
              style="padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Close
      </button>
    </div>
  `;
  
  overlay.className = 'overlay';
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Close when clicking outside
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}

// Helper functions for the goals system
function updateDailyGoal() {
  const newTarget = parseInt(document.getElementById('dailyTarget').value);
  if (newTarget && newTarget > 0) {
    writingGoals.dailyWordTarget = newTarget;
    alert('Daily goal updated to ' + newTarget + ' words!');
  }
}

function resetSessionCounter() {
  let allText = '';
  document.querySelectorAll('.editable-page-content').forEach(page => {
    allText += page.innerText + ' ';
  });
  const currentWords = allText.trim().split(/\s+/).filter(word => word.length > 0).length;
  writingGoals.sessionStartWords = currentWords;
  alert('Session counter reset! Start writing to track new progress.');
}

// Initialize session counter when app starts
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    let allText = '';
    document.querySelectorAll('.editable-page-content').forEach(page => {
      allText += page.innerText + ' ';
    });
    const currentWords = allText.trim().split(/\s+/).filter(word => word.length > 0).length;
    writingGoals.sessionStartWords = currentWords;
    writingGoals.todayStartWords = currentWords;
  }, 1000);
});

//this function is for adding images
// Insert Image Function
function insertImageIntoEditor(imageData, fileName) {
  // Get current selection/cursor position
  const selection = window.getSelection();
  let targetPage = null;
  
  // Find which page to insert into
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    
    // Find the editable page
    while (node && !node.classList?.contains('editable-page-content')) {
      node = node.parentElement;
    }
    targetPage = node;
  }
  
  // If no page found, use the last page
  if (!targetPage) {
    const pages = document.querySelectorAll('.editable-page-content');
    targetPage = pages[pages.length - 1];
  }
  
  if (!targetPage) {
    alert('Could not find a place to insert the image.');
    return;
  }
  
  // Create wrapper for image + resize handles
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-wrapper';
  imageWrapper.style.cssText = `
    position: relative;
    display: inline-block;
    margin: 10px auto;
    max-width: 100%;
  `;
  
  // Create the image element
  const img = document.createElement('img');
  img.src = imageData;
  img.alt = fileName;
  img.style.cssText = `
    max-width: 100%;
    height: auto;
    display: block;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  // Add image to wrapper
  imageWrapper.appendChild(img);
  
  // Make image selectable
  img.addEventListener('click', function(e) {
    e.stopPropagation();
    selectImageForResize(imageWrapper);
  });
  
  // Insert the image wrapper
  if (selection.rangeCount > 0 && targetPage.contains(selection.anchorNode)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(imageWrapper);
    
    // Move cursor after image
    range.setStartAfter(imageWrapper);
    range.setEndAfter(imageWrapper);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    targetPage.appendChild(imageWrapper);
  }
  
  // Focus back on the page
  targetPage.focus();
  
  // Update counts and save
  setTimeout(() => {
    checkForPageBreaks();
    updateCounts();
    saveCurrentDoc();
  }, 100);
}

function selectImageForResize(wrapper) {
  // Remove existing selections
  document.querySelectorAll('.image-selected').forEach(el => {
    el.classList.remove('image-selected');
    removeResizeHandles();
  });
  
  // Select this image
  wrapper.classList.add('image-selected');
  addResizeHandles(wrapper);
}

function addResizeHandles(wrapper) {
  // Remove any existing handles first
  removeResizeHandles();
  
  // Add selection border
  wrapper.style.border = '2px solid #007cba';
  wrapper.style.borderRadius = '4px';
  
  // Create resize handles
  const positions = [
    { name: 'nw', cursor: 'nw-resize', top: '-5px', left: '-5px' },
    { name: 'ne', cursor: 'ne-resize', top: '-5px', right: '-5px' },
    { name: 'sw', cursor: 'sw-resize', bottom: '-5px', left: '-5px' },
    { name: 'se', cursor: 'se-resize', bottom: '-5px', right: '-5px' }
  ];
  
  positions.forEach(pos => {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.setAttribute('data-direction', pos.name);
    handle.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: #007cba;
      border: 1px solid white;
      cursor: ${pos.cursor};
      z-index: 1000;
      ${pos.top ? `top: ${pos.top};` : ''}
      ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
      ${pos.left ? `left: ${pos.left};` : ''}
      ${pos.right ? `right: ${pos.right};` : ''}
    `;
    
    // Add drag functionality
    handle.addEventListener('mousedown', (e) => startResize(e, wrapper, pos.name));
    wrapper.appendChild(handle);
  });
}

function removeResizeHandles() {
  document.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
  document.querySelectorAll('.image-selected').forEach(wrapper => {
    wrapper.style.border = '';
    wrapper.style.borderRadius = '';
  });
}

function startResize(e, wrapper, direction) {
  e.preventDefault();
  e.stopPropagation();
  
  const img = wrapper.querySelector('img');
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = parseInt(window.getComputedStyle(wrapper).width);
  const startHeight = parseInt(window.getComputedStyle(wrapper).height);
  
  function doResize(e) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    // Calculate new dimensions based on drag direction
    if (direction.includes('e')) { // East (right)
      newWidth = startWidth + deltaX;
    }
    if (direction.includes('w')) { // West (left)
      newWidth = startWidth - deltaX;
    }
    if (direction.includes('s')) { // South (down)
      newHeight = startHeight + deltaY;
    }
    if (direction.includes('n')) { // North (up)
      newHeight = startHeight - deltaY;
    }
    
    // Keep aspect ratio
    const aspectRatio = startWidth / startHeight;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      newHeight = newWidth / aspectRatio;
    } else {
      newWidth = newHeight * aspectRatio;
    }
    
    // Set minimum and maximum sizes
    newWidth = Math.max(50, Math.min(newWidth, 600));
    newHeight = Math.max(30, Math.min(newHeight, 800));
    
    // Apply new size
    wrapper.style.width = newWidth + 'px';
    wrapper.style.height = newHeight + 'px';
    img.style.width = '100%';
    img.style.height = '100%';
  }
  
  function stopResize() {
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    saveCurrentDoc(); // Save the changes
  }
  
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
}

// Click outside to deselect images
document.addEventListener('click', function(e) {
  // Handle image options (only for images)
  const imageOptions = document.getElementById('imageOptions');
  const textBoxOptions = document.getElementById('textBoxOptions');
  const selectedImg = document.querySelector('.selected-image');
  const selectedTextBox = document.querySelector('.text-box-selected');
  
  // Close image options if clicking outside images
  if (imageOptions && !imageOptions.contains(e.target) && !e.target.closest('.image-wrapper')) {
    closeImageOptions();
  }
  
  // Close text box options if clicking outside text boxes
  if (textBoxOptions && !textBoxOptions.contains(e.target) && !e.target.closest('.text-box')) {
    closeTextBoxOptions();
  }
  
  // Remove text color and highlight palettes
  const textColorPalette = document.getElementById('textColorPalette');
  const highlightPalette = document.getElementById('highlightPalette');
  if (textColorPalette) textColorPalette.style.display = 'none';
  if (highlightPalette) highlightPalette.style.display = 'none';
});

// Close image options when clicking elsewhere
document.addEventListener('click', function(e) {
  const options = document.getElementById('imageOptions');
  const selectedImg = document.querySelector('.selected-image');
  
  if (options && !options.contains(e.target) && e.target !== selectedImg) {
    closeImageOptions();
  }
});
function insertImageAtCursor() {
  // Create invisible file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const imageData = event.target.result;
      insertImageIntoEditor(imageData, file.name);
    };
    
    reader.readAsDataURL(file);
    document.body.removeChild(fileInput);
  });
  
  document.body.appendChild(fileInput);
  fileInput.click();
}

//This is the add text box function
// Text Box System

function handleTextBoxPlacement(e) {
  if (!isPlacingTextBox) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  // Reset cursor and mode IMMEDIATELY to prevent double-clicks
  isPlacingTextBox = false;
  document.body.style.cursor = '';
  
  // Remove instruction
  const instruction = document.getElementById('textBoxInstruction');
  if (instruction) instruction.remove();
  
  // Remove ALL click listeners to prevent duplicates
  document.querySelectorAll('.editable-page-content').forEach(page => {
    page.removeEventListener('click', handleTextBoxPlacement);
  });
  
  const page = e.currentTarget;
  console.log('Placing text box on page:', page);
  
  // Create text box
  createTextBox(page, 0, 0);
}

function showTextBoxInstruction() {
  const instruction = document.createElement('div');
  instruction.id = 'textBoxInstruction';
  instruction.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #007cba;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 2000;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  `;
  instruction.innerHTML = `
    📝 Click anywhere on a page to place your text box<br>
    <small>Press Escape to cancel</small>
  `;
  document.body.appendChild(instruction);
  
  // Remove instruction after 3 seconds
  setTimeout(() => {
    if (document.getElementById('textBoxInstruction')) {
      document.getElementById('textBoxInstruction').remove();
    }
  }, 3000);
}

function handleTextBoxPlacement(e) {
  if (!isPlacingTextBox) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  // Reset cursor and mode
  isPlacingTextBox = false;
  document.body.style.cursor = '';
  
  // Remove instruction
  const instruction = document.getElementById('textBoxInstruction');
  if (instruction) instruction.remove();
  
  const page = e.currentTarget;
  console.log('Placing text box on page:', page);
  
  // Create text box - no position checking for now
  createTextBox(page, 0, 0);
}
function createTextBox(page, x, y) {
  console.log('Creating text box on page');
  
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.style.cssText = `
    position: relative;
    display: inline-block;
    width: 150px;
    min-height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px dashed #007cba;
    border-radius: 4px;
    padding: 8px;
    cursor: move;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.4;
    box-sizing: border-box;
    margin: 10px;
    top: 0px;
    left: 0px;
    vertical-align: top;
  `;
  
  // ... rest of the function that includes makeTextBoxDraggable(textBox);
}
function makeTextBoxDraggable(textBox) {
  let isDragging = false;
  let startX, startY, startTop, startLeft;
  let isTyping = false;
  
  textBox.addEventListener('mousedown', (e) => {
    // Don't drag if we're clicking to type (in the center area)
    const rect = textBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    // If clicking near the center, it's for typing, not dragging
    if (distanceFromCenter < 30) {
      isTyping = true;
      textBox.style.cursor = 'text';
      return;
    }
    
    // Start dragging
    isDragging = true;
    isTyping = false;
    startX = e.clientX;
    startY = e.clientY;
    startTop = parseInt(textBox.style.top) || 0;
    startLeft = parseInt(textBox.style.left) || 0;
    
    textBox.style.cursor = 'grabbing';
    textBox.style.border = '2px solid #007cba';
    e.preventDefault();
    
    function handleDrag(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newTop = startTop + deltaY;
      const newLeft = startLeft + deltaX;
      
      textBox.style.top = newTop + 'px';
      textBox.style.left = newLeft + 'px';
      
      // Visual feedback while dragging
      textBox.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    }
    
    function stopDrag() {
      if (!isDragging) return;
      
      isDragging = false;
      textBox.style.cursor = 'move';
      textBox.style.boxShadow = '';
      textBox.style.border = '2px dashed #007cba';
      
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      
      saveCurrentDoc();
      console.log('Text box moved to:', textBox.style.top, textBox.style.left);
    }
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  });
  
  // Change cursor based on where mouse is
  textBox.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    
    const rect = textBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    if (distanceFromCenter < 30) {
      textBox.style.cursor = 'text';
    } else {
      textBox.style.cursor = 'move';
    }
  });
}

function showMarginWarning() {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #dc3545;
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    z-index: 2000;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    text-align: center;
  `;
  warning.innerHTML = `
    ⚠️ Cannot place text box here<br>
    <small>Please click within the page margins<br>
    (The white writing area, not the gray borders)</small>
  `;
  document.body.appendChild(warning);
  
  // Remove warning after 3 seconds
  setTimeout(() => {
    if (document.body.contains(warning)) {
      document.body.removeChild(warning);
    }
  }, 3000);
}

//this is the function for moving the text bog around the page
function makeDraggableWithBoundaries(textBox, safeLeft, safeTop, safeRight, safeBottom) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;
  
  textBox.addEventListener('mousedown', (e) => {
    // Only drag if clicking on the border area
    const rect = textBox.getBoundingClientRect();
    const borderWidth = 12;
    const isOnBorder = (
      e.clientX < rect.left + borderWidth ||
      e.clientX > rect.right - borderWidth ||
      e.clientY < rect.top + borderWidth ||
      e.clientY > rect.bottom - borderWidth
    );
    
    if (!isOnBorder) return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(textBox.style.left);
    startTop = parseInt(textBox.style.top);
    
    textBox.style.cursor = 'grabbing';
    e.preventDefault();
    
    function handleDrag(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;
      
      // Keep within safe writing area
      newLeft = Math.max(safeLeft, Math.min(newLeft, safeRight - textBox.offsetWidth));
      newTop = Math.max(safeTop, Math.min(newTop, safeBottom - textBox.offsetHeight));
      
      textBox.style.left = newLeft + 'px';
      textBox.style.top = newTop + 'px';
    }
    
    function stopDrag() {
      isDragging = false;
      textBox.style.cursor = 'move';
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      saveCurrentDoc();
    }
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  });
}

function selectTextBox(textBox) {
  console.log('Selecting text box:', textBox);
  
  // Remove selection from other text boxes
  document.querySelectorAll('.text-box-selected').forEach(box => {
    box.classList.remove('text-box-selected');
    box.style.border = '2px dashed #007cba';
  });
  
  // Select this text box
  textBox.classList.add('text-box-selected');
  textBox.style.border = '2px solid #007cba';
  
  console.log('Text box selected');
  
  // Show options
  showTextBoxOptions(textBox);
}

function showTextBoxOptions(textBox) {
  // Remove any existing options
  const existingOptions = document.getElementById('textBoxOptions');
  if (existingOptions) existingOptions.remove();
  
  // Create options panel
  const options = document.createElement('div');
  options.id = 'textBoxOptions';
  options.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 1500;
  `;
  
  options.innerHTML = `
    <h4 style="margin: 0 0 10px 0;">Text Box Options</h4>
    <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">💡 Drag the edges to move<br>Click center to type</p>
    <button onclick="resizeTextBox('small')" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">Small Size</button>
    <button onclick="resizeTextBox('medium')" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">Medium Size</button>
    <button onclick="resizeTextBox('large')" style="display: block; width: 100%; margin-bottom: 10px; padding: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">Large Size</button>
    <button onclick="deleteSelectedTextBox()" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #dc3545; background: #dc3545; color: white; cursor: pointer;">Delete Text Box</button>
    <button onclick="closeTextBoxOptions()" style="display: block; width: 100%; padding: 5px; border: 1px solid #6c757d; background: #6c757d; color: white; cursor: pointer;">Close</button>
  `;
  
  document.body.appendChild(options);
}

function resizeTextBox(size) {
  const selected = document.querySelector('.text-box-selected');
  if (!selected) return;
  
  const sizes = {
    small: '120px',
    medium: '200px',
    large: '300px'
  };
  
  selected.style.width = sizes[size];
  closeTextBoxOptions();
  saveCurrentDoc();
}

function deleteSelectedTextBox() {
  const selected = document.querySelector('.text-box-selected');
  if (!selected) return;
  
  if (confirm('Delete this text box?')) {
    selected.remove();
    closeTextBoxOptions();
    saveCurrentDoc();
    updateCounts();
  }
}

function closeTextBoxOptions() {
  const options = document.getElementById('textBoxOptions');
  if (options) options.remove();
  
  // Remove selection from text boxes
  document.querySelectorAll('.text-box-selected').forEach(el => {
    el.classList.remove('text-box-selected');
    el.style.border = '2px dashed #007cba';
  });
}


// Close options when clicking elsewhere
document.addEventListener('click', function(e) {
  const options = document.getElementById('textBoxOptions');
  const selectedTextBox = document.querySelector('.text-box-selected');
  
  if (options && !options.contains(e.target) && e.target !== selectedTextBox && !selectedTextBox?.contains(e.target)) {
    closeTextBoxOptions();
  }
});

// Cancel text box placement with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isPlacingTextBox) {
    isPlacingTextBox = false;
    document.body.style.cursor = '';
    
    const instruction = document.getElementById('textBoxInstruction');
    if (instruction) instruction.remove();
    
    // Remove click listeners
    document.querySelectorAll('.editable-page-content').forEach(page => {
      page.removeEventListener('click', handleTextBoxPlacement);
    });
  }
});

// Click outside to deselect text boxes
document.addEventListener('click', (e) => {
  if (!e.target.closest('.text-box') && !e.target.closest('#imageOptions')) {
    document.querySelectorAll('.text-box-selected').forEach(box => {
      box.classList.remove('text-box-selected');
      box.style.border = '2px dashed #007cba';
    });
  }
});

// Text Box System - Complete Functions
let isPlacingTextBox = false;

function insertTextBox() {
  // Enter "placement mode"
  isPlacingTextBox = true;
  document.body.style.cursor = 'crosshair';
  
  // Show instruction
  showTextBoxInstruction();
  
  // Remove any existing text box listeners first
  document.querySelectorAll('.editable-page-content').forEach(page => {
    page.removeEventListener('click', handleTextBoxPlacement);
  });
  
  // Add click listener to all pages (but only once)
  document.querySelectorAll('.editable-page-content').forEach(page => {
    page.addEventListener('click', handleTextBoxPlacement, { once: true });
  });
}

function showTextBoxInstruction() {
  const instruction = document.createElement('div');
  instruction.id = 'textBoxInstruction';
  instruction.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #007cba;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 2000;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  `;
  instruction.innerHTML = `
    📝 Click anywhere on a page to place your text box<br>
    <small>Press Escape to cancel</small>
  `;
  document.body.appendChild(instruction);
  
  // Remove instruction after 3 seconds
  setTimeout(() => {
    if (document.getElementById('textBoxInstruction')) {
      document.getElementById('textBoxInstruction').remove();
    }
  }, 3000);
}

function handleTextBoxPlacement(e) {
  if (!isPlacingTextBox) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  // Reset cursor and mode IMMEDIATELY to prevent double-clicks
  isPlacingTextBox = false;
  document.body.style.cursor = '';
  
  // Remove instruction
  const instruction = document.getElementById('textBoxInstruction');
  if (instruction) instruction.remove();
  
  // Remove ALL click listeners to prevent duplicates
  document.querySelectorAll('.editable-page-content').forEach(page => {
    page.removeEventListener('click', handleTextBoxPlacement);
  });
  
  const page = e.currentTarget;
  console.log('Placing text box on page:', page);
  
  // Create text box
  createTextBox(page, 0, 0);
}

function createTextBox(page, x, y) {
  console.log('Creating text box on page');
  
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.style.cssText = `
    position: relative;
    display: inline-block;
    width: 150px;
    min-height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px dashed #007cba;
    border-radius: 4px;
    padding: 8px;
    cursor: move;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.4;
    box-sizing: border-box;
    margin: 10px;
    top: 0px;
    left: 0px;
    vertical-align: top;
  `;
  
  // Make it editable
  textBox.contentEditable = true;
  textBox.setAttribute('spellcheck', 'false');
  textBox.innerHTML = 'Type your text here...';
  
  // Add event listeners
  textBox.addEventListener('click', (e) => {
    e.stopPropagation();
    selectTextBox(textBox);
  });
  
  textBox.addEventListener('focus', () => {
    if (textBox.innerHTML === 'Type your text here...') {
      textBox.innerHTML = '';
    }
    selectTextBox(textBox);
  });
  
  textBox.addEventListener('blur', () => {
    if (textBox.innerHTML.trim() === '') {
      textBox.innerHTML = 'Type your text here...';
    }
    saveCurrentDoc();
  });
  
  textBox.addEventListener('input', () => {
    saveCurrentDoc();
  });
  
  // Make it draggable
  makeTextBoxDraggable(textBox);
  
  // Add to page
  page.appendChild(textBox);
  
  // Focus and select the text
  textBox.focus();
  selectTextBox(textBox);
  
  console.log('Text box created and added to page');
  return textBox;
}

function makeTextBoxDraggable(textBox) {
  let isDragging = false;
  let startX, startY, startTop, startLeft;
  
  textBox.addEventListener('mousedown', (e) => {
    // Don't drag if we're clicking to type (in the center area)
    const rect = textBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    // If clicking near the center, it's for typing, not dragging
    if (distanceFromCenter < 30) {
      textBox.style.cursor = 'text';
      return;
    }
    
    // Start dragging
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTop = parseInt(textBox.style.top) || 0;
    startLeft = parseInt(textBox.style.left) || 0;
    
    textBox.style.cursor = 'grabbing';
    textBox.style.border = '2px solid #007cba';
    e.preventDefault();
    
    function handleDrag(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newTop = startTop + deltaY;
      const newLeft = startLeft + deltaX;
      
      textBox.style.top = newTop + 'px';
      textBox.style.left = newLeft + 'px';
      
      textBox.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    }
    
    function stopDrag() {
      if (!isDragging) return;
      
      isDragging = false;
      textBox.style.cursor = 'move';
      textBox.style.boxShadow = '';
      textBox.style.border = '2px dashed #007cba';
      
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      
      saveCurrentDoc();
      console.log('Text box moved to:', textBox.style.top, textBox.style.left);
    }
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  });
  
  // Change cursor based on where mouse is
  textBox.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    
    const rect = textBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    if (distanceFromCenter < 30) {
      textBox.style.cursor = 'text';
    } else {
      textBox.style.cursor = 'move';
    }
  });
}

function selectTextBox(textBox) {
  console.log('Selecting text box:', textBox);
  
  // Remove selection from other text boxes
  document.querySelectorAll('.text-box-selected').forEach(box => {
    box.classList.remove('text-box-selected');
    box.style.border = '2px dashed #007cba';
  });
  
  // Select this text box
  textBox.classList.add('text-box-selected');
  textBox.style.border = '2px solid #007cba';
  
  console.log('Text box selected');
  
  // Show options
  showTextBoxOptions(textBox);
}

function showTextBoxOptions(textBox) {
  // Remove any existing options
  const existingOptions = document.getElementById('textBoxOptions');
  if (existingOptions) existingOptions.remove();
  
  // Create options panel
  const options = document.createElement('div');
  options.id = 'textBoxOptions';
  options.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 1500;
  `;
  
  options.innerHTML = `
    <h4 style="margin: 0 0 10px 0;">Text Box Options</h4>
    <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">💡 Drag the edges to move<br>Click center to type</p>
    <button onclick="resizeTextBox('small')" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">Small Size</button>
    <button onclick="resizeTextBox('medium')" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">Medium Size</button>
    <button onclick="resizeTextBox('large')" style="display: block; width: 100%; margin-bottom: 10px; padding: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">Large Size</button>
    <button onclick="deleteSelectedTextBox()" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #dc3545; background: #dc3545; color: white; cursor: pointer;">Delete Text Box</button>
    <button onclick="closeTextBoxOptions()" style="display: block; width: 100%; padding: 5px; border: 1px solid #6c757d; background: #6c757d; color: white; cursor: pointer;">Close</button>
  `;
  
  document.body.appendChild(options);
}

function resizeTextBox(size) {
  const selected = document.querySelector('.text-box-selected');
  if (!selected) return;
  
  const sizes = {
    small: '120px',
    medium: '200px',
    large: '300px'
  };
  
  selected.style.width = sizes[size];
  closeTextBoxOptions();
  saveCurrentDoc();
}

function deleteSelectedTextBox() {
  const selected = document.querySelector('.text-box-selected');
  if (!selected) return;
  
  if (confirm('Delete this text box?')) {
    selected.remove();
    closeTextBoxOptions();
    saveCurrentDoc();
    updateCounts();
  }
}

function closeTextBoxOptions() {
  const options = document.getElementById('textBoxOptions');
  if (options) options.remove();
  
  // Remove selection from text boxes
  document.querySelectorAll('.text-box-selected').forEach(el => {
    el.classList.remove('text-box-selected');
    el.style.border = '2px dashed #007cba';
  });
}

// Cancel text box placement with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isPlacingTextBox) {
    isPlacingTextBox = false;
    document.body.style.cursor = '';
    
    const instruction = document.getElementById('textBoxInstruction');
    if (instruction) instruction.remove();
    
    // Remove click listeners
    document.querySelectorAll('.editable-page-content').forEach(page => {
      page.removeEventListener('click', handleTextBoxPlacement);
    });
  }
}); 
