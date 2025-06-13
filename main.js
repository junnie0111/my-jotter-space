// 🌟 GLOBAL VARIABLES FOR CHAPTER MANAGEMENT
let documents = {};           // Holds all chapters' content
let currentChapter = null;    // Currently open chapter
let lastSavedFileName = null; // Already exists

// ✨ NEW: Global variables for current project settings
let currentProjectBookSizeKey = '6x9';     // Default book size key (e.g., '6x9', '5x8')
let currentProjectEstimatedPageCount = 200; // Default estimated page count
let currentProjectBookType = 'Novel';      // Default book type
let currentProjectName = 'Untitled Project'; // Default project name

// global variable for text edit
let savedTextSelection = null;


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

  // Set initial default values (global variables are already set with these)
  // currentProjectName is 'Untitled Project'
  // currentProjectBookType is 'Novel'
  // currentProjectBookSizeKey is '6x9'
  // currentProjectEstimatedPageCount is 200

  // Apply formatting for the initial default state
  const defaultDimensions = getBookDimensions(currentProjectBookSizeKey); // Use global var
  const defaultMargins = calculateMargins(currentProjectEstimatedPageCount); // Use global var
  applyBookFormatting(defaultDimensions, defaultMargins);

  // Update UI elements in the Book Info Bar and Status Bar to reflect initial defaults
  document.getElementById('bookTitle').textContent = currentProjectName;
  document.getElementById('projectName').textContent = currentProjectName; // Status bar
  document.getElementById('bookType').textContent = currentProjectBookType;
  document.getElementById('bookSize').textContent = currentProjectBookSizeKey.replace('x', '" × ') + '"';
  document.getElementById('bookMargins').textContent = `Gutter: ${defaultMargins.gutter}"`;
  document.getElementById('estimatedPages').textContent = `~${currentProjectEstimatedPageCount} pages`;

  // Create a default chapter to start
  documents[currentProjectName + " - Chapter 1"] = ''; // Use currentProjectName for default chapter
  currentChapter = currentProjectName + " - Chapter 1";
  refreshBinderList();
  loadChapter(currentChapter);
  updateCounts();
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
  updateRecentProjectsMenu();

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
 
window.addEventListener('DOMContentLoaded', () => {
  // … your existing init code …

  // Delegate word/page counting to any input inside #textArea
  const textArea = document.getElementById('textArea');
  textArea.addEventListener('input', () => {
    // slight delay lets pasted content settle
    setTimeout(updateCounts, 10);
  });
  // 1) Hook up the “Add Layer” button
document.getElementById('addLayerButton').addEventListener('click', () => {
  const name = prompt('Enter new layer name:');
  if (!name) return;                // cancelled or blank
  addCustomLayer(name.trim());
});

// 2) Function to create a layer button and wire its toggle
function addCustomLayer(layerName) {
  const layerButtons = document.getElementById('layerButtons');
  // Create the button
  const btn = document.createElement('button');
  btn.className = 'layer-btn active';
  // Use a safe data-layer key (no spaces/punctuation)
  const key = layerName.toLowerCase().replace(/\s+/g,'-').replace(/[^\w\-]/g,'');
  btn.setAttribute('data-layer', key);
  btn.textContent = layerName;
  // Insert it just before “Show All”
  const showAll = document.getElementById('showAllLayersBtn');
  layerButtons.insertBefore(btn, showAll);

  // 3) Wire it up to your existing toggle logic
  btn.addEventListener('click', () => {
    toggleLayer(key);
  });

    // ── NEW: double-click to delete custom layer ──
  btn.addEventListener('dblclick', () => {
    // 1) Remove the button from the DOM
    layerButtons.removeChild(btn);
    // 2) Also turn off that layer if it was active
    activeLayers = activeLayers.filter(l => l !== key);
    // 3) Re-render the timeline without it
    displayTimelineWithLayers();
  });
  // Give a little hint on hover:
  btn.title = 'Double-click to delete this layer';

  // 4) Refresh timeline so the new layer actually appears
  displayTimelineWithLayers();
}
});


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
  li.draggable = true;  // Make it draggable
  li.dataset.chapterName = name;  // Store chapter name
  
  // Left click to open chapter
  li.addEventListener('click', () => {
    saveCurrentDoc();
    loadChapter(name);
  });
  
  // Right click for options menu
  li.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showChapterContextMenu(e, name, li);
  });
  
  // Drag and drop events
  li.addEventListener('dragstart', handleDragStart);
  li.addEventListener('dragover', handleDragOver);
  li.addEventListener('drop', handleDrop);
  li.addEventListener('dragend', handleDragEnd);
  
  list.appendChild(li);
});
}

function showChapterContextMenu(e, chapterName, listItem) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('chapterContextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'chapterContextMenu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 2000;
    min-width: 120px;
  `;
  
  menu.innerHTML = `
    <div class="context-option" onclick="renameChapter('${chapterName}')">📝 Rename</div>
    <div class="context-option" onclick="deleteChapter('${chapterName}')">🗑️ Delete</div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu);
  }, 10);
}

function closeContextMenu() {
  const menu = document.getElementById('chapterContextMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeContextMenu);
}

function renameChapter(oldName) {
  closeContextMenu();
  
  const newName = prompt('Enter new chapter name:', oldName);
  if (!newName || newName === oldName) return;
  
  // Check if name already exists
  if (documents[newName]) {
    alert('A chapter with that name already exists!');
    return;
  }
  
  // Rename the chapter
  documents[newName] = documents[oldName];
  delete documents[oldName];
  
  // Update current chapter if it was the renamed one
  if (currentChapter === oldName) {
    currentChapter = newName;
  }
  
  // Refresh the binder list
  refreshBinderList();
  
  alert(`Chapter renamed to "${newName}"`);
}

function deleteChapter(chapterName) {
  closeContextMenu();
  
  // Don't delete if it's the only chapter
  if (Object.keys(documents).length === 1) {
    alert('Cannot delete the last chapter. Create another chapter first.');
    return;
  }
  
  const confirmDelete = confirm(`Are you sure you want to delete "${chapterName}"?\n\nThis cannot be undone.`);
  if (!confirmDelete) return;
  
  // Delete the chapter
  delete documents[chapterName];
  
  // If we deleted the current chapter, switch to another one
  if (currentChapter === chapterName) {
    const remainingChapters = Object.keys(documents);
    currentChapter = remainingChapters[0];
    loadChapter(currentChapter);
  }
  
  // Refresh the binder list
  refreshBinderList();
  
  alert(`Chapter "${chapterName}" deleted.`);
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  
  // Visual feedback
  this.style.borderTop = '2px solid #007cba';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  if (draggedElement !== this) {
    // Get the order of chapters before reordering
    const oldOrder = Object.keys(documents);
    const draggedChapterName = draggedElement.dataset.chapterName;
    const targetChapterName = this.dataset.chapterName;
    
    // Reorder the documents object
    reorderChapters(draggedChapterName, targetChapterName, oldOrder);
    
    // Refresh the binder to show new order
    refreshBinderList();
  }
  
  return false;
}

function handleDragEnd(e) {
  // Clean up visual effects
  const listItems = document.querySelectorAll('#binderList li');
  listItems.forEach(item => {
    item.style.opacity = '';
    item.style.borderTop = '';
  });
  draggedElement = null;
}

function reorderChapters(draggedName, targetName, oldOrder) {
  // Create new ordered documents object
  const newDocuments = {};
  
  // Find positions
  const draggedIndex = oldOrder.indexOf(draggedName);
  const targetIndex = oldOrder.indexOf(targetName);
  
  // Create new order array
  const newOrder = [...oldOrder];
  newOrder.splice(draggedIndex, 1);  // Remove dragged item
  newOrder.splice(targetIndex, 0, draggedName);  // Insert at new position
  
  // Rebuild documents object in new order
  newOrder.forEach(chapterName => {
    newDocuments[chapterName] = documents[chapterName];
  });
  
  // Replace the old documents object
  documents = newDocuments;
  
  console.log('Chapters reordered:', Object.keys(documents));
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
  
  // Save current selection before opening menu
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedTextSelection = selection.getRangeAt(0).cloneRange();
  }
  
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
  saveCurrentDoc(); // Ensure current chapter's content is up-to-date in 'documents'

  // Ask user for project name (this also updates currentProjectName and lastSavedFileName)
  const projectNamePrompt = prompt('Name your project:', currentProjectName || 'My Writing Project');
  if (!projectNamePrompt) return; // Cancel if they clicked cancel

  currentProjectName = projectNamePrompt;
  lastSavedFileName = currentProjectName; // Remember this name for quick saves
  document.getElementById('bookTitle').textContent = currentProjectName; // Update UI
  document.getElementById('projectName').textContent = currentProjectName; // Update status bar UI


  const projectData = {
    appVersion: "1.0",
    created: new Date().toISOString(),
    // ✨ INCLUDE PROJECT SETTINGS IN SAVED DATA
    projectSettings: {
      bookSizeKey: currentProjectBookSizeKey,
      estimatedPageCount: currentProjectEstimatedPageCount,
      bookType: currentProjectBookType,
      projectName: currentProjectName // Use the updated currentProjectName
    },
    chapters: documents
  };

  const jsonString = JSON.stringify(projectData, null, 2);
localStorage.setItem('project_' + currentProjectName, jsonString);
alert('Project saved successfully!');

// Add to recent projects list
let recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
recentProjects = recentProjects.filter(p => p.name !== currentProjectName);
recentProjects.unshift({
  name: currentProjectName,
  lastModified: new Date().toISOString()
});
recentProjects = recentProjects.slice(0, 10);
localStorage.setItem('recentProjects', JSON.stringify(recentProjects));
updateRecentProjectsMenu();
}


function saveProject() {
  if (!lastSavedFileName) {
    saveProjectAs(); // This will now handle setting currentProjectName and lastSavedFileName
    return;
  }
  saveCurrentDoc(); // Ensure current chapter content is saved

  // Ensure currentProjectName reflects lastSavedFileName if it exists
  if (lastSavedFileName) {
      currentProjectName = lastSavedFileName;
  }

  const projectData = {
    appVersion: "1.0",
    // projectName: lastSavedFileName, // This field is now part of projectSettings
    created: new Date().toISOString(),
    // ✨ INCLUDE PROJECT SETTINGS IN SAVED DATA
    projectSettings: {
      bookSizeKey: currentProjectBookSizeKey,
      estimatedPageCount: currentProjectEstimatedPageCount,
      bookType: currentProjectBookType,
      projectName: currentProjectName // Use the global currentProjectName
    },
    chapters: documents
  };

  const jsonString = JSON.stringify(projectData, null, 2);
localStorage.setItem('project_' + currentProjectName, jsonString);
// Only show alert if we're not calling saveProjectAs
if (lastSavedFileName) {
alert('Project saved successfully FROM SAVEPROJECT!');
}



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
  console.log("DEBUG: exportAsText() called."); // Check if function is entered
  console.log("DEBUG: currentChapter in exportAsText is: ", currentChapter); // Check chapter variable

  if (!currentChapter) {
    // alert('No chapter open to export!'); // We'll rely on console for now
    console.error("DEBUG: No currentChapter to export in exportAsText.");
    return;
  }

  let allText = '';
  const pages = document.querySelectorAll('.editable-page-content');
  if (pages.length === 0) {
      console.warn("DEBUG: No .editable-page-content found in exportAsText.");
  }
  pages.forEach(page => {
    allText += page.innerText + '\n\n--- Page Break ---\n\n';
  });

  console.log("DEBUG: Collected text for export in exportAsText: '", allText + "'"); // See the actual text

  if (allText.trim() === "") {
      console.warn("DEBUG: Collected text is empty in exportAsText. Download will be empty.");
  }

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
  console.log("DEBUG: exportAsText() attempted download for", currentChapter + '.txt');
}

// Export current chapter as HTML
function exportAsHTML() {
  console.log("DEBUG: exportAsHTML() called."); // Check if function is entered
  console.log("DEBUG: currentChapter in exportAsHTML is: ", currentChapter); // Check chapter variable

  if (!currentChapter) {
    // alert('No chapter open to export!'); // We'll rely on console for now
    console.error("DEBUG: No currentChapter to export in exportAsHTML.");
    return;
  }

  const chapterContent = documents[currentChapter];
  console.log("DEBUG: Content from documents[currentChapter] in exportAsHTML: '", chapterContent + "'");

  if (!chapterContent || chapterContent.trim() === "") {
    console.warn("DEBUG: Chapter content is empty or undefined in exportAsHTML. HTML file will be mostly empty.");
    // We can still proceed to create a basic HTML structure if desired,
    // or you could return here if you don't want to export empty chapters.
  }

  const htmlFileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${currentChapter}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; padding: 20px; background-color: #f9f9f9; color: #333; }
    .editable-page-content {
      background-color: #fff;
      border: 1px solid #ccc;
      padding: 1in; /* Example padding, adjust as needed */
      margin: 20px auto; /* Centers page on the view */
      page-break-after: always; /* For printing */
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      /* Add other styles from your '.editable-page-content' class in styles.css
         if you want the exported HTML to look like the editor.
         For example: width, height (though these might be better handled by print CSS or left to default)
      */
    }
    h1 { text-align: center; color: #444; }
    /* If your content uses other specific classes that need styling, add them here */
  </style>
</head>
<body>
  <h1>${currentChapter}</h1>
  ${chapterContent || "<p><em>No content found for this chapter.</em></p>"}
</body>
</html>`;
  // Added lang="en" to html tag, meta charset, and some basic styling improvements.
  // Also added a fallback if chapterContent is empty.

  console.log("DEBUG: Final HTML file content being used for Blob in exportAsHTML: '", htmlFileContent + "'");

  const blob = new Blob([htmlFileContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentChapter + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("DEBUG: exportAsHTML() attempted download for", currentChapter + '.html');
}

// Export current chapter to PDF, with revised HTML preparation for PDF rendering
function exportToPDF() {
  console.log("DEBUG: Starting PDF export...");
  
  // Check if we have a chapter to export
  if (!currentChapter) {
    alert('No chapter open to export!');
    return;
  }

  // Save current content before exporting
  saveCurrentDoc();

  // Get the book dimensions and margins from your current project settings
  const pageDimensionsInPixels = getBookDimensions(currentProjectBookSizeKey);
  const pageMarginsInInches = calculateMargins(currentProjectEstimatedPageCount);
  
  // Convert pixel dimensions to points (PDF uses points, not pixels)
  // 1 inch = 72 points, 1 inch = 96 pixels, so: pixels * (72/96)
  const pageWidthPt = pageDimensionsInPixels.width * (72 / 96);
  const pageHeightPt = pageDimensionsInPixels.height * (72 / 96);
  
  // Convert margin inches to points
  const topMarginPt = pageMarginsInInches.top * 72;
  const bottomMarginPt = pageMarginsInInches.bottom * 72;
  const horizontalMarginPt = pageMarginsInInches.outside * 72;

  console.log("DEBUG: Page size will be", pageWidthPt, "x", pageHeightPt, "points");

  // Create a new PDF document with your book's exact size
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: pageWidthPt > pageHeightPt ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [pageWidthPt, pageHeightPt]
  });

  // Extract text with formatting information
  let formattedContent = [];
  const currentPages = document.querySelectorAll('.editable-page-content');
  
  for (let i = 0; i < currentPages.length; i++) {
    const pageElement = currentPages[i];
    
    // Process all text nodes and their formatting
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text.trim()) {
          // Check parent elements for formatting
          let isBold = false;
          let isItalic = false;
          let isUnderline = false;
          
          let parent = node.parentElement;
          while (parent && parent !== pageElement) {
            const style = window.getComputedStyle(parent);
            if (style.fontWeight === 'bold' || style.fontWeight >= '700' || parent.tagName === 'B' || parent.tagName === 'STRONG') {
              isBold = true;
            }
            if (style.fontStyle === 'italic' || parent.tagName === 'I' || parent.tagName === 'EM') {
              isItalic = true;
            }
            if (style.textDecoration.includes('underline') || parent.tagName === 'U') {
              isUnderline = true;
            }
            parent = parent.parentElement;
          }
          
          formattedContent.push({
            text: text,
            bold: isBold,
            italic: isItalic,
            underline: isUnderline
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle line breaks
        if (node.tagName === 'BR') {
          formattedContent.push({ text: '\n', bold: false, italic: false, underline: false });
        } else if (node.tagName === 'P' || node.tagName === 'DIV') {
          // Add paragraph breaks
          if (formattedContent.length > 0) {
            formattedContent.push({ text: '\n', bold: false, italic: false, underline: false });
          }
          // Process children
          for (let child of node.childNodes) {
            processNode(child);
          }
          formattedContent.push({ text: '\n', bold: false, italic: false, underline: false });
        } else {
          // Process children for other elements
          for (let child of node.childNodes) {
            processNode(child);
          }
        }
      }
    }
    
    processNode(pageElement);
    
    // Add page break marker
    if (i < currentPages.length - 1) {
      formattedContent.push({ text: '\n\n--- PAGE BREAK ---\n\n', bold: false, italic: false, underline: false });
    }
  }
  
  console.log("DEBUG: Extracted", formattedContent.length, "formatted text segments");

  if (!formattedContent || formattedContent.length === 0) {
    alert('No text content found to export. Please add some text to your chapter.');
    return;
  }

  // Use formatted text-based PDF generation
  try {
    // Set up the font and margins
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    
    // Calculate usable area (page size minus margins)
    const leftMargin = horizontalMarginPt;
    const topMargin = topMarginPt;
    const rightMargin = pageWidthPt - horizontalMarginPt;
    const bottomMargin = pageHeightPt - bottomMarginPt;
    const lineHeight = 14; // Points between lines
    
    // Add formatted text to PDF
    let currentY = topMargin;
    const maxWidth = rightMargin - leftMargin;
    
    for (let i = 0; i < formattedContent.length; i++) {
      const segment = formattedContent[i];
      
      // Skip empty segments
      if (!segment.text.trim() && segment.text !== '\n') continue;
      
      // Handle page breaks
      if (segment.text.includes('--- PAGE BREAK ---')) {
        doc.addPage();
        currentY = topMargin;
        continue;
      }
      
      // Set font style based on formatting
      let fontStyle = 'normal';
      if (segment.bold && segment.italic) {
        fontStyle = 'bolditalic';
      } else if (segment.bold) {
        fontStyle = 'bold';
      } else if (segment.italic) {
        fontStyle = 'italic';
      }
      
      doc.setFont('times', fontStyle);
      
      // Handle line breaks
      if (segment.text === '\n') {
        currentY += lineHeight;
        // Check if we need a new page
        if (currentY + lineHeight > bottomMargin) {
          doc.addPage();
          currentY = topMargin;
        }
        continue;
      }
      
      // Split long text into lines that fit
      const lines = doc.splitTextToSize(segment.text, maxWidth);
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        // Check if we need a new page
        if (currentY + lineHeight > bottomMargin) {
          doc.addPage();
          currentY = topMargin;
        }
        
        // Add the text line
        doc.text(lines[lineIndex], leftMargin, currentY);
        
        // Add underline if needed
        if (segment.underline) {
          const textWidth = doc.getTextWidth(lines[lineIndex]);
          doc.line(leftMargin, currentY + 2, leftMargin + textWidth, currentY + 2);
        }
        
        currentY += lineHeight;
      }
    }
    
    // Save the PDF
    doc.save(currentChapter + '.pdf');
    console.log("DEBUG: PDF saved successfully with", formattedContent.length, "content segments");
    alert('PDF exported successfully!');
    
  } catch (error) {
    console.error("DEBUG: Error creating PDF:", error);
    alert("Error creating PDF: " + error.message);
  }
}

function exportToDocx() {
  console.log("DEBUG: Starting DOC export...");
  
  // Check if we have a chapter to export
  if (!currentChapter) {
    alert('No chapter open to export!');
    return;
  }

  // Save current content before exporting
  saveCurrentDoc();

  // Get all text content from pages with basic formatting
  let allContent = '';
  const currentPages = document.querySelectorAll('.editable-page-content');
  
  currentPages.forEach((page, index) => {
    // Get the HTML content of the page
    let pageHTML = page.innerHTML;
    
    // Clean up the HTML - remove editor-specific elements
    pageHTML = pageHTML.replace(/<div[^>]*class="resize-handle"[^>]*>.*?<\/div>/g, '');
    pageHTML = pageHTML.replace(/<div[^>]*class="text-box"[^>]*>.*?<\/div>/g, '');
    
    allContent += pageHTML;
    
    // Add page break between pages (except for the last page)
    if (index < currentPages.length - 1) {
      allContent += '<br style="page-break-before: always; mso-break-type: page-break;">';
    }
  });
  
  console.log("DEBUG: Extracted content for DOC");

  if (!allContent.trim()) {
    alert('No content found to export. Please add some text to your chapter.');
    return;
  }

  try {
    // Create HTML that Word 97-2003 format can understand
    const docContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word">
    <meta name="Originator" content="Microsoft Word">
    <title>${currentChapter}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        @page Section1 {
            size: 8.5in 11in;
            margin: 0.75in 0.375in 0.75in 0.75in;
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
            mso-paper-source: 0;
        }
        div.Section1 {
            page: Section1;
        }
        body {
            font-family: "Times New Roman", serif;
            font-size: 12.0pt;
            line-height: 150%;
            margin: 0;
        }
        p {
            margin-top: 0;
            margin-bottom: 12pt;
            font-family: "Times New Roman", serif;
            font-size: 12.0pt;
        }
        strong, b {
            font-weight: bold;
        }
        em, i {
            font-style: italic;
        }
        u {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="Section1">
        ${allContent}
    </div>
</body>
</html>`;

    console.log("DEBUG: Created DOC-compatible HTML content");

    // Create the blob with Word 97-2003 MIME type
    const blob = new Blob([docContent], { 
        type: 'application/msword'
    });
    
    // Create download with .doc extension (Word 97-2003 format)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentChapter + '.doc';  // Changed to .doc instead of .docx
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("DEBUG: DOC file created and download initiated");
    alert('Word document exported successfully as .doc format! This will open in any version of Microsoft Word.');
    
  } catch (error) {
    console.error("DEBUG: Error in DOC export:", error);
    alert("Error creating Word document: " + error.message);
  }
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
  
  const bookTypeElement = document.getElementById('dialogBookType');
  const bookSizeElement = document.getElementById('dialogBookSize');
  const pageCountElement = document.getElementById('dialogPageCount');
  const projectNameElement = document.getElementById('dialogProjectName');
  
  if (!bookTypeElement || !bookSizeElement || !pageCountElement || !projectNameElement) {
    console.error('Missing form elements for new book');
    alert('Error: Form elements not found for new book setup.');
    return;
  }
  
  const bookTypeDialog = bookTypeElement.value;
  const bookSizeDialog = bookSizeElement.value; // This is the key, e.g., "6x9"
  const pageCountDialog = parseInt(pageCountElement.value);
  const projectNameDialog = projectNameElement.value.trim() || 'Untitled Project';
  
  console.log('Dialog Form values:', { bookTypeDialog, bookSizeDialog, pageCountDialog, projectNameDialog });
  
  // ✨ UPDATE GLOBAL PROJECT SETTINGS from dialog
  currentProjectBookType = bookTypeDialog;
  currentProjectBookSizeKey = bookSizeDialog;
  currentProjectEstimatedPageCount = pageCountDialog;
  currentProjectName = projectNameDialog;
  lastSavedFileName = null; // Reset last saved file name for a new project

  console.log('DEBUG: Global project settings updated by createNewBook - Size:', currentProjectBookSizeKey, 'Pages:', currentProjectEstimatedPageCount, 'Type:', currentProjectBookType, 'Name:', currentProjectName);
  
  try {
    // Calculate proper margins based on Amazon KDP specs
    const margins = calculateMargins(currentProjectEstimatedPageCount); // Use global var
    const dimensions = getBookDimensions(currentProjectBookSizeKey);   // Use global var
    console.log('Calculated margins and dimensions for new book');

    applyBookFormatting(dimensions, margins);
    console.log('Applied book formatting for new book');

    documents = {}; // Clear current project
    const firstChapterName = currentProjectName + " - Chapter 1";
    documents[firstChapterName] = ''; // Create a blank first chapter
    currentChapter = firstChapterName;
    refreshBinderList();
    loadChapter(currentChapter); // This will create an initial page
    console.log('Created new project structure');

    // Update the book info bar
    const bookTitleEl = document.getElementById('bookTitle');
    const bookTypeStatusEl = document.getElementById('bookType');
    const bookSizeStatusEl = document.getElementById('bookSize');
    const bookMarginsEl = document.getElementById('bookMargins');
    const estimatedPagesEl = document.getElementById('estimatedPages');
    const statusBarProjectNameEl = document.getElementById('projectName'); // Status bar project name
    
    if (bookTitleEl) bookTitleEl.textContent = currentProjectName;
    if (statusBarProjectNameEl) statusBarProjectNameEl.textContent = currentProjectName;
    if (bookTypeStatusEl) bookTypeStatusEl.textContent = currentProjectBookType.charAt(0).toUpperCase() + currentProjectBookType.slice(1);
    if (bookSizeStatusEl) bookSizeStatusEl.textContent = currentProjectBookSizeKey.replace('x', '" × ') + '"';
    if (bookMarginsEl) bookMarginsEl.textContent = `Gutter: ${margins.gutter}"`;
    if (estimatedPagesEl) estimatedPagesEl.textContent = `~${currentProjectEstimatedPageCount} pages`;

    alert(`Created "${currentProjectName}" as a ${currentProjectBookType} in ${currentProjectBookSizeKey} format!`);
    
  } catch (error) {
    console.error('Error in createNewBook:', error);
    alert('Error creating new book: ' + error.message);
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
// close current project
function closeCurrentProject() {
  // Check if there are unsaved changes
  const hasUnsavedChanges = document.getElementById('unsavedIndicator').style.display !== 'none';
  
  if (hasUnsavedChanges) {
    const saveFirst = confirm('You have unsaved changes. Would you like to save before closing the project?');
    if (saveFirst) {
      saveProject(); // Save first
    }
  }
  
  // Confirm closing
  const confirmClose = confirm('Are you sure you want to close the current project?');
  if (!confirmClose) return;
  
  // Clear all project data
  documents = {};
  currentChapter = null;
  lastSavedFileName = null;
  
  // Reset project settings to defaults
  currentProjectName = 'Untitled Project';
  currentProjectBookType = 'Novel';
  currentProjectBookSizeKey = '6x9';
  currentProjectEstimatedPageCount = 200;
  
  // Clear the editor
  const textArea = document.getElementById('textArea');
  textArea.innerHTML = '';
  
  // Reset to default state
  const defaultDimensions = getBookDimensions(currentProjectBookSizeKey);
  const defaultMargins = calculateMargins(currentProjectEstimatedPageCount);
  applyBookFormatting(defaultDimensions, defaultMargins);
  
  // Update UI elements
  document.getElementById('bookTitle').textContent = currentProjectName;
  document.getElementById('projectName').textContent = currentProjectName;
  document.getElementById('bookType').textContent = currentProjectBookType;
  document.getElementById('bookSize').textContent = currentProjectBookSizeKey.replace('x', '" × ') + '"';
  document.getElementById('bookMargins').textContent = `Gutter: ${defaultMargins.gutter}"`;
  document.getElementById('estimatedPages').textContent = `~${currentProjectEstimatedPageCount} pages`;
  
  // Clear binder
  refreshBinderList();
  
  // Create a fresh default chapter
  documents[currentProjectName + " - Chapter 1"] = '';
  currentChapter = currentProjectName + " - Chapter 1";
  refreshBinderList();
  loadChapter(currentChapter);
  
  // Update counts
  updateCounts();
  
  alert('Project closed. You now have a fresh project to work with.');
}
// open a saved project
function openProject() {
  // Check for unsaved changes first
  const hasUnsavedChanges = document.getElementById('unsavedIndicator').style.display !== 'none';
  
  if (hasUnsavedChanges) {
    const saveFirst = confirm('You have unsaved changes. Would you like to save before opening a different project?');
    if (saveFirst) {
      saveProject();
    }
  }
  
  // Create file input for project selection
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      alert('Please select a valid project file (.json)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const projectData = JSON.parse(event.target.result);
        
        // Validate project data
        if (!projectData.chapters) {
          alert('Invalid project file format. Missing chapters data.');
          return;
        }
        
        // Load project settings if available
        if (projectData.projectSettings) {
          currentProjectBookSizeKey = projectData.projectSettings.bookSizeKey || '6x9';
          currentProjectEstimatedPageCount = projectData.projectSettings.estimatedPageCount || 200;
          currentProjectBookType = projectData.projectSettings.bookType || 'Novel';
          currentProjectName = projectData.projectSettings.projectName || file.name.replace('.json', '');
        } else {
          // Fallback for older project files
          currentProjectName = file.name.replace('.json', '');
        }
        
        lastSavedFileName = currentProjectName;
        
        // Load chapters
        documents = projectData.chapters;
        
        // Set current chapter to first available chapter
        const chapterNames = Object.keys(documents);
        if (chapterNames.length > 0) {
          currentChapter = chapterNames[0];
        } else {
          // Create default chapter if none exist
          const defaultChapter = currentProjectName + " - Chapter 1";
          documents[defaultChapter] = '';
          currentChapter = defaultChapter;
        }
        
        // Apply book formatting
        const dimensions = getBookDimensions(currentProjectBookSizeKey);
        const margins = calculateMargins(currentProjectEstimatedPageCount);
        applyBookFormatting(dimensions, margins);
        
        // Update UI
        document.getElementById('bookTitle').textContent = currentProjectName;
        document.getElementById('projectName').textContent = currentProjectName;
        document.getElementById('bookType').textContent = currentProjectBookType.charAt(0).toUpperCase() + currentProjectBookType.slice(1);
        document.getElementById('bookSize').textContent = currentProjectBookSizeKey.replace('x', '" × ') + '"';
        document.getElementById('bookMargins').textContent = `Gutter: ${margins.gutter}"`;
        document.getElementById('estimatedPages').textContent = `~${currentProjectEstimatedPageCount} pages`;
        
        // Refresh binder and load chapter
        refreshBinderList();
        loadChapter(currentChapter);
        updateCounts();
        
        alert(`Project "${currentProjectName}" loaded successfully!`);
        
      } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project file. The file may be corrupted or in an unsupported format.');
      }
    };
    
    reader.readAsText(file);
    document.body.removeChild(fileInput);
  });
  
  document.body.appendChild(fileInput);
  fileInput.click();
}
// this is the print function
function printCurrentChapter() {
  // Check if we have a chapter to print
  if (!currentChapter) {
    alert('No chapter open to print!');
    return;
  }

  // Save current content before printing
  saveCurrentDoc();

  // Create a print-friendly version of the content
  let printContent = '';
  const currentPages = document.querySelectorAll('.editable-page-content');
  
  currentPages.forEach((page, index) => {
    // Get the text content and preserve basic formatting
    let pageHTML = page.innerHTML;
    
    // Clean up any editor-specific elements
    pageHTML = pageHTML.replace(/<div[^>]*class="resize-handle"[^>]*>.*?<\/div>/g, '');
    pageHTML = pageHTML.replace(/<div[^>]*class="text-box"[^>]*>.*?<\/div>/g, '');
    
    printContent += pageHTML;
    
    // Add page break between pages (except for the last page)
    if (index < currentPages.length - 1) {
      printContent += '<div style="page-break-before: always;"></div>';
    }
  });

  // Open print preview window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>Print - ${currentChapter}</title>
      <style>
        @page {
          margin: 0.75in 0.375in 0.75in 0.75in;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        u { text-decoration: underline; }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}


// delete a saved project
function showDeleteProjectDialog() {
  // Get list of saved projects from localStorage (we'll store a list there)
  const savedProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
  
  if (savedProjects.length === 0) {
    alert('No saved projects found to delete.');
    return;
  }
  
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
    max-width: 400px;
    width: 90%;
  `;
  
  // Build project options
  let projectOptions = '';
  savedProjects.forEach(project => {
    projectOptions += `<option value="${project.name}">${project.name}</option>`;
  });
  
  dialog.innerHTML = `
    <h2 style="margin-top: 0; color: #dc3545;">⚠️ Delete Project</h2>
    <p style="color: #666; margin-bottom: 20px;">
      <strong>Warning:</strong> This action cannot be undone. The project file will be permanently removed from your recent projects list.
    </p>
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Select project to delete:</label>
      <select id="projectToDelete" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <option value="">-- Choose a project --</option>
        ${projectOptions}
      </select>
    </div>
    
    <div style="text-align: right; margin-top: 30px;">
      <button id="cancelDelete" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="confirmDelete" style="padding: 8px 16px; border: none; background: #dc3545; color: white; border-radius: 4px; cursor: pointer;" disabled>Delete Project</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Enable/disable delete button based on selection
  const projectSelect = document.getElementById('projectToDelete');
  const deleteButton = document.getElementById('confirmDelete');
  
  projectSelect.addEventListener('change', () => {
    deleteButton.disabled = !projectSelect.value;
    deleteButton.style.opacity = projectSelect.value ? '1' : '0.5';
  });
  
  // Handle cancel
  document.getElementById('cancelDelete').onclick = () => {
    document.body.removeChild(overlay);
  };
  
  // Handle delete confirmation
  document.getElementById('confirmDelete').onclick = () => {
    const projectToDelete = projectSelect.value;
    if (!projectToDelete) return;
    
    const finalConfirm = confirm(`Are you absolutely sure you want to delete "${projectToDelete}"?\n\nThis action cannot be undone.`);
    if (finalConfirm) {
      deleteProject(projectToDelete);
      document.body.removeChild(overlay);
    }
  };
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
}

function deleteProject(projectName) {
  try {
    // Remove from recent projects list
    let savedProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
    savedProjects = savedProjects.filter(project => project.name !== projectName);
    localStorage.setItem('recentProjects', JSON.stringify(savedProjects));
    
    // Also remove from localStorage if it was stored there
    localStorage.removeItem('project_' + projectName);
    
    alert(`Project "${projectName}" has been deleted from your recent projects list.`);
    location.reload();
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Error deleting project. Please try again.');
  }
}
//recent projects function
function updateRecentProjectsMenu() {
  const recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
  const menu = document.getElementById('recentProjectsMenu');
  
  if (!menu) return;
  
  // Clear existing items
  menu.innerHTML = '';
  
  if (recentProjects.length === 0) {
    menu.innerHTML = '<div class="menu-option" style="color: #999; font-style: italic;">No recent projects</div>';
    return;
  }
  
  // Add each recent project
  recentProjects.forEach(project => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-option';
    menuItem.textContent = project.name;
    menuItem.addEventListener('click', () => {
      alert('Loading projects will be added in the next step!');
      closeAllMenus();
    });
    menu.appendChild(menuItem);
  });
}
// this is the functions on the edit menu

function selectAllText() {
  // Focus on the current editable page
  const currentPage = document.querySelector('.editable-page-content:focus') || 
                     document.querySelectorAll('.editable-page-content')[0];
  
  if (currentPage) {
    currentPage.focus();
    const range = document.createRange();
    range.selectNodeContents(currentPage);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function copySelectedText() {
  alert('Please use Ctrl+C to copy selected text.');
}

function cutSelectedText() {
  alert('Please use Ctrl+X to cut selected text.');
}

function pasteText() {
  alert('Please use Ctrl+V to paste text.');
}
// function for finding

function showFindDialog() {
  // Remove any existing find dialog
  const existingDialog = document.getElementById('findDialog');
  if (existingDialog) existingDialog.remove();
  
  // Create find dialog
  const dialog = document.createElement('div');
  dialog.id = 'findDialog';
  dialog.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1500;
    width: 300px;
  `;
  
  dialog.innerHTML = `
    <h3 style="margin: 0 0 10px 0;">🔍 Find</h3>
    <input type="text" id="findInput" placeholder="Search for..." 
           style="width: 100%; padding: 5px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 3px;">
    <div style="margin-bottom: 10px;">
      <label><input type="checkbox" id="caseSensitive"> Case sensitive</label>
    </div>
    <div style="text-align: right;">
      <button onclick="findText()" style="margin-right: 5px; padding: 5px 10px; background: #007cba; color: white; border: none; border-radius: 3px; cursor: pointer;">Find Next</button>
      <button onclick="closeFindDialog()" style="padding: 5px 10px; background: #ccc; border: none; border-radius: 3px; cursor: pointer;">Close</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  document.getElementById('findInput').focus();
  
  // Allow Enter key to search
  document.getElementById('findInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      findText();
    }
  });
}

function findText() {
  const searchTerm = document.getElementById('findInput').value;
  const caseSensitive = document.getElementById('caseSensitive').checked;
  
  if (!searchTerm) {
    alert('Please enter text to search for.');
    return;
  }
  
  // Simple browser find
  const flags = caseSensitive ? '' : 'i';
  window.find(searchTerm, false, false, true, false, true, false);
}

function closeFindDialog() {
  const dialog = document.getElementById('findDialog');
  if (dialog) dialog.remove();
}


// find and replace function

function showReplaceDialog() {
  // Remove any existing dialogs
  const existingDialog = document.getElementById('replaceDialog');
  if (existingDialog) existingDialog.remove();
  
  // Create replace dialog
  const dialog = document.createElement('div');
  dialog.id = 'replaceDialog';
  dialog.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1500;
    width: 350px;
  `;
  
  dialog.innerHTML = `
    <h3 style="margin: 0 0 10px 0;">🔍 Find & Replace</h3>
    <input type="text" id="replaceSearchInput" placeholder="Find..." 
           style="width: 100%; padding: 5px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 3px;">
    <input type="text" id="replaceWithInput" placeholder="Replace with..." 
           style="width: 100%; padding: 5px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 3px;">
    <div style="margin-bottom: 10px;">
      <label><input type="checkbox" id="replaceCaseSensitive"> Case sensitive</label>
    </div>
    <div style="text-align: right;">
      <button onclick="replaceNext()" style="margin-right: 5px; padding: 5px 8px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">Replace</button>
      <button onclick="replaceAll()" style="margin-right: 5px; padding: 5px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Replace All</button>
      <button onclick="closeReplaceDialog()" style="padding: 5px 8px; background: #ccc; border: none; border-radius: 3px; cursor: pointer;">Close</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  document.getElementById('replaceSearchInput').focus();
}

function replaceNext() {
  const searchTerm = document.getElementById('replaceSearchInput').value;
  const replaceWith = document.getElementById('replaceWithInput').value;
  const caseSensitive = document.getElementById('replaceCaseSensitive').checked;
  
  if (!searchTerm) {
    alert('Please enter text to find.');
    return;
  }
  
  // Get all editable pages
  const pages = document.querySelectorAll('.editable-page-content');
  let found = false;
  
  for (let page of pages) {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchTerm, flags);
    
    if (regex.test(page.innerHTML)) {
      page.innerHTML = page.innerHTML.replace(regex, replaceWith);
      found = true;
      saveCurrentDoc(); // Save changes
      break; // Only replace first occurrence
    }
  }
  
  if (!found) {
    alert(`"${searchTerm}" not found.`);
  } else {
    alert(`Replaced "${searchTerm}" with "${replaceWith}"`);
  }
}

function replaceAll() {
  const searchTerm = document.getElementById('replaceSearchInput').value;
  const replaceWith = document.getElementById('replaceWithInput').value;
  const caseSensitive = document.getElementById('replaceCaseSensitive').checked;
  
  if (!searchTerm) {
    alert('Please enter text to find.');
    return;
  }
  
  const confirmAll = confirm(`Replace ALL occurrences of "${searchTerm}" with "${replaceWith}"?\n\nThis cannot be undone.`);
  if (!confirmAll) return;
  
  // Get all editable pages
  const pages = document.querySelectorAll('.editable-page-content');
  let totalReplacements = 0;
  
  pages.forEach(page => {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchTerm, flags);
    const matches = page.innerHTML.match(regex);
    
    if (matches) {
      totalReplacements += matches.length;
      page.innerHTML = page.innerHTML.replace(regex, replaceWith);
    }
  });
  
  if (totalReplacements > 0) {
    saveCurrentDoc(); // Save changes
    alert(`Replaced ${totalReplacements} occurrence(s) of "${searchTerm}" with "${replaceWith}"`);
  } else {
    alert(`"${searchTerm}" not found.`);
  }
}

function closeReplaceDialog() {
  const dialog = document.getElementById('replaceDialog');
  if (dialog) dialog.remove();
}

// insert special character function
function insertSpecialCharacter() {
  // Remove any existing dialog
  const existingDialog = document.getElementById('characterDialog');
  if (existingDialog) existingDialog.remove();
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.id = 'characterDialog';
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 2000;
    width: 400px;
  `;
  
  dialog.innerHTML = `
    <h3 style="margin: 0 0 15px 0;">✨ Insert Special Character</h3>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">
      <button data-char="—" class="char-btn">— Em dash</button>
      <button data-char="–" class="char-btn">– En dash</button>
      <button data-char=""" class="char-btn">" Open quote</button>
      <button data-char=""" class="char-btn">" Close quote</button>
      <button data-char="'" class="char-btn">' Open single</button>
      <button data-char="'" class="char-btn">' Close single</button>
      <button data-char="©" class="char-btn">© Copyright</button>
      <button data-char="®" class="char-btn">® Registered</button>
      <button data-char="™" class="char-btn">™ Trademark</button>
      <button data-char="…" class="char-btn">… Ellipsis</button>
      <button data-char="§" class="char-btn">§ Section</button>
      <button data-char="¶" class="char-btn">¶ Paragraph</button>
    </div>
    <div style="text-align: right;">
      <button id="closeCharDialog" style="padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
    <style>
      .char-btn {
        padding: 8px 4px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        text-align: left;
      }
      .char-btn:hover {
        background: #f0f8ff;
      }
    </style>
  `;
  
  document.body.appendChild(dialog);
  
  // Add click handlers for character buttons
  const charButtons = dialog.querySelectorAll('.char-btn');
  charButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const char = btn.getAttribute('data-char');
      insertCharacter(char);
    });
  });
  
  // Add close button handler
  document.getElementById('closeCharDialog').addEventListener('click', () => {
    dialog.remove();
  });
}

function insertCharacter(character) {
  // Find the currently focused editable page
  let targetPage = document.querySelector('.editable-page-content:focus');
  
  if (!targetPage) {
    // If no page is focused, use the last page
    const pages = document.querySelectorAll('.editable-page-content');
    targetPage = pages[pages.length - 1];
  }
  
  if (targetPage) {
    // Focus the page and insert the character
    targetPage.focus();
    document.execCommand('insertText', false, character);
    saveCurrentDoc();
  }
  
  // Close the dialog
  const dialog = document.getElementById('characterDialog');
  if (dialog) dialog.remove();
}
function insertChar(character) {
  // Get the current cursor position
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    
    // Create a text node with the character
    const textNode = document.createTextNode(character);
    
    // Insert the character at the cursor position
    range.deleteContents();
    range.insertNode(textNode);
    
    // Move cursor after the inserted character
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    // If no selection, try to insert in the last page
    const pages = document.querySelectorAll('.editable-page-content');
    const lastPage = pages[pages.length - 1];
    if (lastPage) {
      lastPage.focus();
      lastPage.innerHTML += character;
    }
  }
  
  // Save the changes
  saveCurrentDoc();
  
  // Close the dialog
  closeCharacterDialog();
}

function closeCharacterDialog() {
  const dialogs = document.querySelectorAll('div');
  dialogs.forEach(dialog => {
    if (dialog.innerHTML && dialog.innerHTML.includes('Insert Special Character')) {
      dialog.remove();
    }
  });
}

// transform text functions
function transformSelectedTextDirect(transformation) {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  
  if (!selectedText) {
    alert('Please select some text first.');
    return;
  }
  
  let transformedText = '';
  switch (transformation) {
    case 'uppercase':
      transformedText = selectedText.toUpperCase();
      break;
    case 'lowercase':
      transformedText = selectedText.toLowerCase();
      break;
    case 'titlecase':
      transformedText = selectedText.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      break;
  }
  
  document.execCommand('insertText', false, transformedText);
  saveCurrentDoc();
}


// ===============================
// 📝 Formatting Toolbar Functions
// ===============================

// ADD THESE TWO FUNCTIONS SOMEWHERE ABOVE YOUR COLOR BUTTON CODE
let savedSelection = null;

function saveSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0);
  }
}

function restoreSelection() {
  if (savedSelection) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
  }
}


// Helper function to format text in either main editor or notes editor
function smartFormatText(command, value = null) {
  // Check if we're currently in the notes editor
  if (window.currentNotesEditor && document.activeElement === window.currentNotesEditor) {
    // Apply formatting to notes editor
    document.execCommand(command, false, value);
    
    // Save the note content
    if (worldbuildingData.currentFolder && worldbuildingData.currentNote) {
      worldbuildingData.folders[worldbuildingData.currentFolder][worldbuildingData.currentNote] = 
        window.currentNotesEditor.innerHTML;
      saveWorldbuildingData();
    }
  } else {
    // Use the original formatText function for main editor
    formatText(command, value);
  }
}
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

// Updated toolbar button event listeners
document.getElementById('boldBtn').addEventListener('click', () => {
  smartFormatText('bold');
});

document.getElementById('italicBtn').addEventListener('click', () => {
  smartFormatText('italic');
});

document.getElementById('underlineBtn').addEventListener('click', () => {
  smartFormatText('underline');
});

// Font family dropdown
document.getElementById('fontSelect').addEventListener('change', (e) => {
  smartFormatText('fontName', e.target.value);
});

// Font size dropdown
document.getElementById('fontSizeSelect').addEventListener('change', (e) => {
  const size = e.target.value;
  const sizeMap = {
    '10pt': '2',
    '12pt': '3',
    '14pt': '4',
    '16pt': '5',
    '18pt': '6'
  };
  smartFormatText('fontSize', sizeMap[size]);
});

// Heading dropdown
document.getElementById('headingSelect').addEventListener('change', (e) => {
  const value = e.target.value;
  if (value === 'normal') {
    smartFormatText('formatBlock', 'p');
  } else {
    smartFormatText('formatBlock', value);
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
  smartFormatText(alignments[e.target.value]);
});

// Undo and Redo buttons
document.getElementById('undoBtn').addEventListener('click', () => {
  smartFormatText('undo');
});

document.getElementById('redoBtn').addEventListener('click', () => {
  smartFormatText('redo');
});
// MISSING BUTTON CLICK HANDLERS - Add this BEFORE your existing palette code
const textColorButton = document.getElementById('textColorButton');
const highlightButton = document.getElementById('highlightButton');

// Text color BUTTON click handler (opens the palette)
if (textColorButton && textColorPalette) {
  textColorButton.addEventListener('click', (e) => {
    e.stopPropagation();
    saveSelection();
    
    // Toggle text color palette
    const isVisible = textColorPalette.style.display === 'block';
    textColorPalette.style.display = isVisible ? 'none' : 'block';
    
    // Hide highlight palette
    if (highlightPalette) highlightPalette.style.display = 'none';
  });
}

// Highlight BUTTON click handler (opens the palette)
if (highlightButton && highlightPalette) {
  highlightButton.addEventListener('click', (e) => {
    e.stopPropagation();
    saveSelection();
    
    // Toggle highlight palette
    const isVisible = highlightPalette.style.display === 'block';
    highlightPalette.style.display = isVisible ? 'none' : 'block';
    
    // Hide text color palette
    if (textColorPalette) textColorPalette.style.display = 'none';
  });
}
// Color palettes - these need special handling
textColorPalette.addEventListener('click', (e) => {
  if (e.target.classList.contains('color-swatch')) {
    const color = e.target.getAttribute('data-color');
    restoreSelection(); // Restore selection before applying color
    smartFormatText('foreColor', color);  // Changed from formatText to smartFormatText
    textColorPalette.style.display = 'none';
  }
});

highlightPalette.addEventListener('click', (e) => {
  if (e.target.classList.contains('color-swatch')) {
    const color = e.target.getAttribute('data-color');
    restoreSelection(); // Restore selection before applying color
    if (color === 'transparent') {
      smartFormatText('removeFormat');  // Changed from formatText to smartFormatText
    } else {
      smartFormatText('hiliteColor', color);  // Changed from formatText to smartFormatText
    }
    highlightPalette.style.display = 'none';
  }
});


// 📋 Menu-Option Click Handler
document.querySelectorAll('.menu-option').forEach((option, index) => {
  // DEBUG: Log which element we're attaching a listener to
 // Correction for the log statement around line 1022
console.log(`DEBUG: Attaching click listener to option index <span class="math-inline">\{index\}, ID\: '</span>{option.id || ""}', Text: '${(option.textContent || "").trim()}'`);

  option.addEventListener('click', function() { // 'this' refers to the clicked 'option'
    // DEBUG: Log 'this' right when the handler starts
    console.log("DEBUG: Click handler invoked. 'this' is:", this);

    const rawTextContent = this.textContent;
    let text = ""; // Default to empty string

    if (typeof rawTextContent === 'string') {
      text = rawTextContent.trim();
    } else {
      // If textContent isn't a string (e.g., it's undefined), we log it but avoid an error.
      console.warn('Clicked menu item has non-string textContent:', rawTextContent, 'Element:', this);
    }

    const clickedId = this.id || ""; // Ensure clickedId is a string, even if ID is missing

console.log(`DEBUG: Menu item clicked - ID: '${clickedId}', Raw Text: '${String(rawTextContent)}', Trimmed Text: '${text}'`);
    // ---- FILE → EXPORT submenu options ----
    if (clickedId === 'exportPdf') {
      console.log("DEBUG: Matched 'exportPdf'. Calling exportToPDF().");
      exportToPDF();
    } else if (clickedId === 'exportDocx') {
      console.log("DEBUG: Matched 'exportDocx'. Calling exportToDocx().");
      exportToDocx();
    } else if (clickedId === 'exportChapterTxt') {
      console.log("DEBUG: Matched 'exportChapterTxt'. Calling exportAsText().");
      exportAsText();
    } else if (clickedId === 'exportChapterHtml') {
      console.log("DEBUG: Matched 'exportChapterHtml'. Calling exportAsHTML().");
      exportAsHTML();

// ---- EDIT menu options ----
} else if (clickedId === 'undoOption') {
  document.execCommand('undo');
} else if (clickedId === 'redoOption') {
  document.execCommand('redo');
} else if (clickedId === 'cutOption') {
  cutSelectedText();
} else if (clickedId === 'copyOption') {
  copySelectedText();
} else if (clickedId === 'pasteOption') {
  pasteText();
} else if (clickedId === 'selectAllOption') {
  selectAllText();
} else if (clickedId === 'findOption') {
  showFindDialog();
} else if (clickedId === 'replaceOption') {
  showReplaceDialog();
} else if (clickedId === 'findOption') {
  showFindDialog();
} else if (clickedId === 'replaceOption') {
  showReplaceDialog();
} else if (clickedId === 'uppercaseOption') {
  transformSelectedText('uppercase');
} else if (clickedId === 'lowercaseOption') {
  transformSelectedText('lowercase');
} else if (clickedId === 'titlecaseOption') {
  transformSelectedText('titlecase');

    // ---- INSERT menu options ----
    } else if (clickedId === 'insertImageOption') {
      insertImageAtCursor();
    } else if (clickedId === 'insertCharOption') {
      insertSpecialCharacter();
    } else if (clickedId === 'insertTextBoxOption') {
      insertTextBox();

    // ---- VIEW menu options ----
    } else if (clickedId === 'writingGoalsOption') {
      showWritingGoalsDialog();
    } else if (clickedId === 'writingStatsOption') {
      showWritingStatistics();
    } else if (clickedId === 'focusModeOption') {
      toggleFocusMode();

    // ---- OTHER existing menu options ----
    // Using text match as a fallback if IDs aren't consistently used/set for all these old options
} else if (text === 'Save Project As...') {
  saveProjectAs();
} else if (text === 'Save Project') {
  saveProject();
} else if (text === 'Print...') {
  printCurrentChapter();
} else if (text === 'Close Project') {
  closeCurrentProject();
} else if (text === 'Open') {
  openProject();
} else if (text === 'Delete Project') {
  showDeleteProjectDialog();
} else if (text === 'New Project/Book') {
  showNewBookDialog(); 
    } else if (clickedId === 'importParent' || (text.includes('Import') && !clickedId) ) { 
      // Handles the main "Import" option which might open a dialog or submenu
      showImportDialog();
    } else if (clickedId === 'exportParent') {
      // This is the main "Export" label.
      // Since the submenu opens on hover (CSS), clicking this parent might do nothing,
      // or it could be used to toggle the submenu if hover wasn't desired.
      // For now, we'll just log it and not call showExportDialog().
      console.log("DEBUG: Clicked on 'exportParent' (main Export label). Submenu should appear on hover.");
    } else {
      // This logs if no specific condition was met
      if (!clickedId && text === "") {
        console.log("DEBUG: Clicked a separator or an item with no explicit ID and no text.");
      } else {
        console.log(`DEBUG: Unhandled menu click - ID:'<span class="math-inline">\{clickedId\}', Text\:'</span>{text}'`);
      }
    }

    // Close all top-level menus after any action.
    closeAllMenus(); //
    // And ensure the export submenu is also closed if it was somehow left open
    const exportMenu = document.getElementById('exportMenu');
    if (exportMenu && exportMenu.style.display === 'block') {
        exportMenu.style.display = 'none';
    }
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
  // Text transformation shortcuts
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
    e.preventDefault();
    transformSelectedTextDirect('uppercase');
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
    e.preventDefault();
    transformSelectedTextDirect('lowercase');
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
    e.preventDefault();
    transformSelectedTextDirect('titlecase');
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
  showImageOptions(wrapper);  // Add this line!
}


function showImageOptions(wrapper) {
  // Remove any existing options
  const existingOptions = document.getElementById('imageOptions');
  if (existingOptions) existingOptions.remove();
  
  // Create options panel
  const options = document.createElement('div');
  options.id = 'imageOptions';
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
    min-width: 180px;
  `;
  
  options.innerHTML = `
    <h4 style="margin: 0 0 10px 0;">Image Options</h4>
    
    <h5 style="margin: 10px 0 5px 0; color: #666;">Text Wrapping:</h5>
    <button onclick="setImageWrap('none')" style="display: block; width: 100%; margin-bottom: 3px; padding: 5px; border: 1px solid #007cba; background: white; cursor: pointer;">No Wrap</button>
    <button onclick="setImageWrap('left')" style="display: block; width: 100%; margin-bottom: 3px; padding: 5px; border: 1px solid #007cba; background: white; cursor: pointer;">Wrap Left</button>
    <button onclick="setImageWrap('right')" style="display: block; width: 100%; margin-bottom: 3px; padding: 5px; border: 1px solid #007cba; background: white; cursor: pointer;">Wrap Right</button>
    <button onclick="setImageWrap('center')" style="display: block; width: 100%; margin-bottom: 10px; padding: 5px; border: 1px solid #007cba; background: white; cursor: pointer;">Center (No Wrap)</button>
    
    <button onclick="deleteSelectedImage()" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px; border: 1px solid #dc3545; background: #dc3545; color: white; cursor: pointer;">Delete Image</button>
    <button onclick="closeImageOptions()" style="display: block; width: 100%; padding: 5px; border: 1px solid #6c757d; background: #6c757d; color: white; cursor: pointer;">Close</button>
  `;
  
  document.body.appendChild(options);
}   

function setImageWrap(wrapType) {
  const selected = document.querySelector('.image-selected');
  if (!selected) return;
  
  // Remove any existing wrap classes
  selected.classList.remove('wrap-left', 'wrap-right', 'wrap-center', 'wrap-none');
  
  // Apply the new wrap style
  switch(wrapType) {
    case 'left':
      selected.style.cssText += `
        float: left;
        margin: 5px 15px 5px 0;
        clear: left;
      `;
      selected.classList.add('wrap-left');
      break;
      
    case 'right':
      selected.style.cssText += `
        float: right;
        margin: 5px 0 5px 15px;
        clear: right;
      `;
      selected.classList.add('wrap-right');
      break;
      
    case 'center':
      selected.style.cssText += `
        float: none;
        display: block;
        margin: 10px auto;
        clear: both;
      `;
      selected.classList.add('wrap-center');
      break;
      
    case 'none':
    default:
      selected.style.cssText += `
        float: none;
        display: inline-block;
        margin: 10px;
        clear: both;
      `;
      selected.classList.add('wrap-none');
      break;
  }
  
  // Save the changes
  saveCurrentDoc();
  
  // Optional: Close the options panel after selection
  // closeImageOptions();
}


function deleteSelectedImage() {
  const selected = document.querySelector('.image-selected');
  if (!selected) return;
  
  if (confirm('Delete this image?')) {
    selected.remove();
    closeImageOptions();
    saveCurrentDoc();
    updateCounts();
  }
}

function closeImageOptions() {
  const options = document.getElementById('imageOptions');
  if (options) options.remove();
  
  // Remove selection from images
  document.querySelectorAll('.image-selected').forEach(el => {
    el.classList.remove('image-selected');
    removeResizeHandles();
  });
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


//WORLD BUILDING SECTION
// Worldbuilding Panel System
let worldbuildingData = {
  folders: {},  // Will store folders and their notes
  currentNote: null,
  currentFolder: null
};

// Toggle worldbuilding panel
document.getElementById('toggleWorldbuilding').addEventListener('click', () => {
    // Toggle binder panel
document.getElementById('toggleBinder').addEventListener('click', () => {
  const binder = document.getElementById('binder');
  binder.classList.toggle('hidden');
});
  const panel = document.getElementById('worldbuildingPanel');
  if (panel.style.display === 'none') {
    panel.style.display = 'flex';
  } else {
    panel.style.display = 'none';
  }
});

// Close worldbuilding panel
document.getElementById('closeWorldbuildingPanel').addEventListener('click', () => {
  document.getElementById('worldbuildingPanel').style.display = 'none';
});
// Expand/collapse worldbuilding panel
document.getElementById('expandWorldbuildingPanel').addEventListener('click', () => {
  const panel = document.getElementById('worldbuildingPanel');
  panel.classList.toggle('expanded');
});
// Tab switching
document.querySelectorAll('.wb-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    switchWorldbuildingTab(tabName);
  });
});

function switchWorldbuildingTab(tabName) {
  console.log("Tab clicked:", tabName);
  
  // Remove active class from all tabs and content
  document.querySelectorAll('.wb-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.wb-tab-content').forEach(c => c.classList.remove('active'));
  
  // Check if the tab content exists
  const targetTab = document.getElementById(tabName + 'Tab');
  console.log("Looking for element with ID:", tabName + 'Tab');
  console.log("Found element:", targetTab);
  
  if (targetTab) {
    // Add active class to selected tab and content
    document.querySelector(`.wb-tab[data-tab="${tabName}"]`).classList.add('active');
    targetTab.classList.add('active');
    console.log("Successfully activated:", tabName + 'Tab');
  } else {
    console.log("ERROR: Could not find element with ID:", tabName + 'Tab');
  }
}  

// Create new folder
document.getElementById('newNoteFolderButton').addEventListener('click', () => {
  const folderName = prompt('Enter folder name:');
  if (!folderName || worldbuildingData.folders[folderName]) {
    if (worldbuildingData.folders[folderName]) {
      alert('A folder with that name already exists!');
    }
    return;
  }
  
  worldbuildingData.folders[folderName] = {};
  refreshNotesFolderList();
  saveWorldbuildingData();
});

function refreshNotesFolderList() {
  const list = document.getElementById('notesFolderList');
  list.innerHTML = '';
  
  Object.keys(worldbuildingData.folders).forEach(folderName => {
    const folderItem = document.createElement('li');
    
    // Create folder header
    const folderDiv = document.createElement('div');
    folderDiv.className = 'notes-folder';
    folderDiv.innerHTML = `
      <span>${folderName}</span>
      <span class="folder-arrow">▶</span>
    `;
    
// Folder click to expand/collapse
folderDiv.addEventListener('click', () => {
  folderDiv.classList.toggle('expanded');
});

// Right click for folder options
folderDiv.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  e.stopPropagation();
  showNoteFolderContextMenu(e, folderName);
});
    
    // Create notes list for this folder
    const notesList = document.createElement('ul');
    notesList.className = 'notes-list';
    
// Add existing notes
// Add existing notes with drag and drop functionality
const noteNames = Object.keys(worldbuildingData.folders[folderName]);
noteNames.forEach((noteName, index) => {
  const noteItem = document.createElement('li');
  noteItem.className = 'note-item';
  noteItem.textContent = noteName;
  noteItem.draggable = true;  // Make it draggable
  noteItem.dataset.folderName = folderName;  // Store folder name
  noteItem.dataset.noteName = noteName;      // Store note name
  noteItem.dataset.noteIndex = index;       // Store original position
  
  // Left click to open note
  noteItem.addEventListener('click', () => loadNote(folderName, noteName));
  
  // Right click for options menu
  noteItem.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showNoteContextMenu(e, folderName, noteName);
  });
  
  // Drag and drop events
  noteItem.addEventListener('dragstart', handleNoteDragStart);
  noteItem.addEventListener('dragover', handleNoteDragOver);
  noteItem.addEventListener('drop', handleNoteDrop);
  noteItem.addEventListener('dragend', handleNoteDragEnd);
  
  notesList.appendChild(noteItem);
});
    
    // Add "new note" button
    const newNoteItem = document.createElement('li');
    newNoteItem.innerHTML = '<button style="width:100%; padding:4px; background:#A3C9A8; color:white; border:none; border-radius:3px; cursor:pointer; font-size:11px;">+ New Note</button>';
    newNoteItem.addEventListener('click', () => createNewNote(folderName));
    notesList.appendChild(newNoteItem);
    
    folderItem.appendChild(folderDiv);
    folderItem.appendChild(notesList);
    list.appendChild(folderItem);
  });
}

function showNoteContextMenu(e, folderName, noteName) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('noteContextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'noteContextMenu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 2500;
    min-width: 140px;
  `;
  
  menu.innerHTML = `
    <div class="context-option" onclick="renameNote('${folderName}', '${noteName}')">📝 Rename Note</div>
    <div class="context-option" onclick="deleteNote('${folderName}', '${noteName}')">🗑️ Delete Note</div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeNoteContextMenu);
  }, 10);
}

function renameNote(folderName, oldNoteName) {
  closeNoteContextMenu();
  
  const newNoteName = prompt('Enter new note name:', oldNoteName);
  if (!newNoteName || newNoteName === oldNoteName) return;
  
  // Check if name already exists in this folder
  if (worldbuildingData.folders[folderName][newNoteName]) {
    alert('A note with that name already exists in this folder!');
    return;
  }
  
  // Rename the note
  worldbuildingData.folders[folderName][newNoteName] = worldbuildingData.folders[folderName][oldNoteName];
  delete worldbuildingData.folders[folderName][oldNoteName];
  
  // Update current note if it was the renamed one
  if (worldbuildingData.currentNote === oldNoteName && worldbuildingData.currentFolder === folderName) {
    worldbuildingData.currentNote = newNoteName;
    document.getElementById('currentNoteTitle').textContent = `${folderName} / ${newNoteName}`;
  }
  
  // Refresh the folder list
  refreshNotesFolderList();
  saveWorldbuildingData();
  
  alert(`Note renamed to "${newNoteName}"`);
}

function closeNoteContextMenu() {
  const menu = document.getElementById('noteContextMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeNoteContextMenu);
}

function deleteNote(folderName, noteName) {
  closeNoteContextMenu();
  
  const confirmDelete = confirm(`Are you sure you want to delete the note "${noteName}"?\n\nThis cannot be undone.`);
  if (!confirmDelete) return;
  
  // Delete the note
  delete worldbuildingData.folders[folderName][noteName];
  
  // Clear editor if this was the current note
  if (worldbuildingData.currentNote === noteName && worldbuildingData.currentFolder === folderName) {
    document.getElementById('currentNoteTitle').textContent = 'Select a note to edit';
    document.getElementById('currentNoteContent').innerHTML = 'Click on a note in a folder to start editing...';
    document.getElementById('currentNoteContent').contentEditable = false;
    worldbuildingData.currentNote = null;
    worldbuildingData.currentFolder = null;
  }
  
  refreshNotesFolderList();
  saveWorldbuildingData();
}

function showNoteFolderContextMenu(e, folderName) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('noteFolderContextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'noteFolderContextMenu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 2500;
    min-width: 140px;
  `;
  
  const noteCount = Object.keys(worldbuildingData.folders[folderName]).length;
  
  menu.innerHTML = `
    <div class="context-option" onclick="renameNoteFolder('${folderName}')">📝 Rename Folder</div>
    <div class="context-option" onclick="deleteNoteFolder('${folderName}')">🗑️ Delete Folder${noteCount > 0 ? ` (${noteCount} notes)` : ''}</div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeNoteFolderContextMenu);
  }, 10);
}

function renameNoteFolder(oldFolderName) {
  closeNoteFolderContextMenu();
  
  const newFolderName = prompt('Enter new folder name:', oldFolderName);
  if (!newFolderName || newFolderName === oldFolderName) return;
  
  // Check if name already exists
  if (worldbuildingData.folders[newFolderName]) {
    alert('A folder with that name already exists!');
    return;
  }
  
  // Rename the folder
  worldbuildingData.folders[newFolderName] = worldbuildingData.folders[oldFolderName];
  delete worldbuildingData.folders[oldFolderName];
  
  // Update current folder if it was the renamed one
  if (worldbuildingData.currentFolder === oldFolderName) {
    worldbuildingData.currentFolder = newFolderName;
    document.getElementById('currentNoteTitle').textContent = `${newFolderName} / ${worldbuildingData.currentNote}`;
  }
  
  // Refresh the folder list
  refreshNotesFolderList();
  saveWorldbuildingData();
  
  alert(`Folder renamed to "${newFolderName}"`);
}

function closeNoteFolderContextMenu() {
  const menu = document.getElementById('noteFolderContextMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeNoteFolderContextMenu);
}

function deleteNoteFolder(folderName) {
  closeNoteFolderContextMenu();
  
  const noteCount = Object.keys(worldbuildingData.folders[folderName]).length;
  let confirmMessage = `Are you sure you want to delete the folder "${folderName}"?`;
  
  if (noteCount > 0) {
    confirmMessage += `\n\nThis will also delete ${noteCount} note${noteCount === 1 ? '' : 's'} inside it.`;
  }
  
  confirmMessage += '\n\nThis cannot be undone.';
  
  const confirmDelete = confirm(confirmMessage);
  if (!confirmDelete) return;
  
  // Clear editor if current note is in this folder
  if (worldbuildingData.currentFolder === folderName) {
    document.getElementById('currentNoteTitle').textContent = 'Select a note to edit';
    document.getElementById('currentNoteContent').innerHTML = 'Click on a note in a folder to start editing...';
    document.getElementById('currentNoteContent').contentEditable = false;
    worldbuildingData.currentNote = null;
    worldbuildingData.currentFolder = null;
  }
  
  // Delete the entire folder
  delete worldbuildingData.folders[folderName];
  
  refreshNotesFolderList();
  saveWorldbuildingData();
}

function createNewNote(folderName) {
  const noteName = prompt('Enter note name:');
  if (!noteName || worldbuildingData.folders[folderName][noteName]) {
    if (worldbuildingData.folders[folderName][noteName]) {
      alert('A note with that name already exists in this folder!');
    }
    return;
  }
  
  worldbuildingData.folders[folderName][noteName] = '';
  refreshNotesFolderList();
  loadNote(folderName, noteName);
  saveWorldbuildingData();
}

function loadNote(folderName, noteName) {
  worldbuildingData.currentFolder = folderName;
  worldbuildingData.currentNote = noteName;
  
  // Update UI
  document.getElementById('currentNoteTitle').textContent = `${folderName} / ${noteName}`;
  const editor = document.getElementById('currentNoteContent');
  editor.contentEditable = true;
  editor.innerHTML = worldbuildingData.folders[folderName][noteName] || '';
  
  // Make the toolbar work with notes
  setupNotesToolbarSupport(editor);
  
  editor.focus();
  
  // Highlight active note
  document.querySelectorAll('.note-item').forEach(item => item.classList.remove('active'));
  event.target.classList.add('active');
}

function setupNotesToolbarSupport(editor) {
  // Add click listener to detect when user clicks in notes editor
  editor.addEventListener('click', () => {
    // Store reference to notes editor for toolbar functions
    window.currentNotesEditor = editor;
  });
  
  editor.addEventListener('focus', () => {
    window.currentNotesEditor = editor;
  });
}

// Drag and Drop handlers for notes
let draggedNoteElement = null;

function handleNoteDragStart(e) {
  draggedNoteElement = this;
  this.style.opacity = '0.5';
  this.style.backgroundColor = '#e8f4fd';
  e.dataTransfer.effectAllowed = 'move';
  
  // Add a visual indicator
  this.style.border = '2px dashed #007cba';
}

function handleNoteDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  
  // Only allow dropping on other notes in the same folder
  if (this.classList.contains('note-item') && 
      this.dataset.folderName === draggedNoteElement.dataset.folderName) {
    
    // Visual feedback - show where the item will be inserted
    this.style.borderTop = '3px solid #007cba';
  }
  
  return false;
}

function handleNoteDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  // Only allow dropping on notes in the same folder
  if (draggedNoteElement && 
      this.classList.contains('note-item') && 
      this.dataset.folderName === draggedNoteElement.dataset.folderName &&
      draggedNoteElement !== this) {
    
    const folderName = this.dataset.folderName;
    const draggedNoteName = draggedNoteElement.dataset.noteName;
    const targetNoteName = this.dataset.noteName;
    
    // Reorder the notes in the data
    reorderNotesInFolder(folderName, draggedNoteName, targetNoteName);
    
    // Refresh the display
    refreshNotesFolderList();
    
    // Show success message
    console.log(`Moved "${draggedNoteName}" near "${targetNoteName}" in folder "${folderName}"`);
  }
  
  return false;
}

function handleNoteDragEnd(e) {
  // Clean up visual effects
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => {
    item.style.opacity = '';
    item.style.backgroundColor = '';
    item.style.border = '';
    item.style.borderTop = '';
  });
  draggedNoteElement = null;
}

function reorderNotesInFolder(folderName, draggedNoteName, targetNoteName) {
  const folder = worldbuildingData.folders[folderName];
  const noteNames = Object.keys(folder);
  
  // Get the content of both notes
  const draggedContent = folder[draggedNoteName];
  const targetIndex = noteNames.indexOf(targetNoteName);
  
  // Create new ordered folder object
  const newFolder = {};
  
  // Add notes in new order
  noteNames.forEach((noteName, index) => {
    if (noteName === draggedNoteName) {
      // Skip the dragged note for now
      return;
    }
    
    if (index === targetIndex) {
      // Insert dragged note before target
      newFolder[draggedNoteName] = draggedContent;
    }
    
    newFolder[noteName] = folder[noteName];
  });
  
  // If dragged to the end, add it last
  if (targetIndex === noteNames.length - 1) {
    newFolder[draggedNoteName] = draggedContent;
  }
  
  // Replace the folder with reordered version
  worldbuildingData.folders[folderName] = newFolder;
  
  // Save the changes
  saveWorldbuildingData();
}

// Save note content when editing
document.getElementById('currentNoteContent').addEventListener('input', () => {
  if (worldbuildingData.currentFolder && worldbuildingData.currentNote) {
    worldbuildingData.folders[worldbuildingData.currentFolder][worldbuildingData.currentNote] = 
      document.getElementById('currentNoteContent').innerHTML;
    saveWorldbuildingData();
  }
});

function saveWorldbuildingData() {
  // Save with the current project
  localStorage.setItem('worldbuilding_' + (currentProjectName || 'default'), JSON.stringify(worldbuildingData));
}

function loadWorldbuildingData() {
  const saved = localStorage.getItem('worldbuilding_' + (currentProjectName || 'default'));
  if (saved) {
    worldbuildingData = JSON.parse(saved);
    refreshNotesFolderList();
  }
}

// Initialize worldbuilding data when app loads
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadWorldbuildingData();
  }, 1000);
});

// Research System
let researchData = {
  folders: {},  // Will store folders and their research items
  currentItem: null,
  currentFolder: null
};

// Create new research folder
document.getElementById('newResearchFolderButton').addEventListener('click', () => {
  const folderName = prompt('Enter research folder name:');
  if (!folderName || researchData.folders[folderName]) {
    if (researchData.folders[folderName]) {
      alert('A folder with that name already exists!');
    }
    return;
  }
  
  researchData.folders[folderName] = {};
  refreshResearchFolderList();
  saveResearchData();
});

function refreshResearchFolderList() {
  const list = document.getElementById('researchFolderList');
  list.innerHTML = '';
  
  Object.keys(researchData.folders).forEach(folderName => {
    const folderItem = document.createElement('li');
    
    // Create folder header
    const folderDiv = document.createElement('div');
    folderDiv.className = 'research-folder';
    folderDiv.innerHTML = `
      <span>${folderName}</span>
      <span class="folder-arrow">▶</span>
    `;
    
// Folder click to expand/collapse
folderDiv.addEventListener('click', () => {
  folderDiv.classList.toggle('expanded');
});

// Right click for folder options
folderDiv.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  e.stopPropagation();
  showResearchFolderContextMenu(e, folderName);
});
    
    // Create research list for this folder
    const researchList = document.createElement('ul');
    researchList.className = 'research-list';
    
// Add existing research items
Object.keys(researchData.folders[folderName]).forEach(itemName => {
  const researchItem = document.createElement('li');
  researchItem.className = 'research-item';
  researchItem.textContent = itemName;
  researchItem.addEventListener('click', () => loadResearchItem(folderName, itemName));
  
  // Right click for delete
  researchItem.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showResearchContextMenu(e, folderName, itemName);
  });
  
  researchList.appendChild(researchItem);
});
    
    // Add "new research" button
    const newResearchItem = document.createElement('li');
    newResearchItem.innerHTML = '<button style="width:100%; padding:4px; background:#D0D0D0; color:#333; border:none; border-radius:3px; cursor:pointer; font-size:11px;">+ New Research</button>';
    newResearchItem.addEventListener('click', () => showNewResearchDialog(folderName));
    researchList.appendChild(newResearchItem);
    
    folderItem.appendChild(folderDiv);
    folderItem.appendChild(researchList);
    list.appendChild(folderItem);
  });
}

function showNewResearchDialog(folderName) {
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
    <h2 style="margin-top: 0; color: #333;">📖 Add Research Item</h2>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Title:</label>
      <input type="text" id="researchTitle" placeholder="Name this research item..." 
             style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Type:</label>
      <select id="researchType" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <option value="link">🔗 Web Link</option>
        <option value="image">🖼️ Image</option>
        <option value="note">📝 Text Note</option>
      </select>
    </div>
    
    <div id="researchContentArea">
      <!-- Content will change based on type -->
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description/Tags:</label>
      <textarea id="researchDescription" placeholder="Brief description or tags..." 
                style="width: 100%; height: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
    </div>
    
    <div style="text-align: right; margin-top: 30px;">
      <button id="cancelResearch" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="saveResearch" style="padding: 8px 16px; border: none; background: #D0D0D0; color: #333; border-radius: 4px; cursor: pointer;">Save Research</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Update content area based on type
  updateResearchContentArea();
  document.getElementById('researchType').addEventListener('change', updateResearchContentArea);
  
  // Handle save and cancel
  document.getElementById('saveResearch').onclick = () => saveNewResearch(folderName, overlay);
  document.getElementById('cancelResearch').onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
}

function updateResearchContentArea() {
  const type = document.getElementById('researchType').value;
  const contentArea = document.getElementById('researchContentArea');
  
  if (type === 'link') {
    contentArea.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Web URL:</label>
        <input type="url" id="researchContent" placeholder="https://example.com" 
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
    `;
  } else if (type === 'image') {
    contentArea.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Image:</label>
        <input type="url" id="researchContent" placeholder="Image URL (https://...)" 
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;">
        <div style="text-align: center;">
          <span style="color: #666;">OR</span>
        </div>
        <button type="button" id="uploadImageBtn" style="width: 100%; padding: 8px; background: #E8E8E8; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          📁 Upload Image File
        </button>
        <input type="file" id="imageFileInput" accept="image/*" style="display: none;">
      </div>
    `;
    
    // Handle image upload
    document.getElementById('uploadImageBtn').onclick = () => {
      document.getElementById('imageFileInput').click();
    };
    
    document.getElementById('imageFileInput').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('researchContent').value = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    
  } else if (type === 'note') {
    contentArea.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Notes:</label>
        <textarea id="researchContent" placeholder="Enter your research notes here..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
  }
}

function saveNewResearch(folderName, overlay) {
  const title = document.getElementById('researchTitle').value.trim();
  const type = document.getElementById('researchType').value;
  const content = document.getElementById('researchContent').value.trim();
  const description = document.getElementById('researchDescription').value.trim();
  
  if (!title) {
    alert('Please enter a title for this research item.');
    return;
  }
  
  if (!content) {
    alert('Please enter content for this research item.');
    return;
  }
  
  if (researchData.folders[folderName][title]) {
    alert('A research item with that title already exists in this folder!');
    return;
  }
  
  // Save the research item
  researchData.folders[folderName][title] = {
    type: type,
    content: content,
    description: description,
    created: new Date().toISOString()
  };
  
  refreshResearchFolderList();
  loadResearchItem(folderName, title);
  saveResearchData();
  
  document.body.removeChild(overlay);
}

function loadResearchItem(folderName, itemName) {
  researchData.currentFolder = folderName;
  researchData.currentItem = itemName;
  
  const item = researchData.folders[folderName][itemName];
  
  // Update UI
  document.getElementById('currentResearchTitle').textContent = `${folderName} / ${itemName}`;
  const viewer = document.getElementById('currentResearchContent');
  
  // Display content based on type
  if (item.type === 'link') {
    viewer.innerHTML = `
      <div style="margin-bottom: 15px;">
        <strong>Web Link:</strong><br>
        <a href="${item.content}" target="_blank" style="color: #007cba; text-decoration: none;">
          ${item.content}
        </a>
        <button onclick="window.open('${item.content}', '_blank')" 
                style="margin-left: 10px; padding: 4px 8px; background: #E8E8E8; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
          🔗 Open Link
        </button>
      </div>
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; border-left: 3px solid #D0D0D0;">
        <strong>Description:</strong><br>
        ${item.description || 'No description provided.'}
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #666;">
        Added: ${new Date(item.created).toLocaleDateString()}
      </div>
    `;
    
  } else if (item.type === 'image') {
    viewer.innerHTML = `
      <div style="margin-bottom: 15px; text-align: center;">
        <img src="${item.content}" alt="${itemName}" 
             style="max-width: 100%; max-height: 300px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; border-left: 3px solid #D0D0D0;">
        <strong>Description:</strong><br>
        ${item.description || 'No description provided.'}
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #666;">
        Added: ${new Date(item.created).toLocaleDateString()}
      </div>
    `;
    
  } else if (item.type === 'note') {
    viewer.innerHTML = `
      <div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap; line-height: 1.5;">
        ${item.content}
      </div>
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; border-left: 3px solid #D0D0D0;">
        <strong>Tags/Description:</strong><br>
        ${item.description || 'No tags or description provided.'}
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #666;">
        Added: ${new Date(item.created).toLocaleDateString()}
      </div>
    `;
  }
  
  // Highlight active research item
  document.querySelectorAll('.research-item').forEach(item => item.classList.remove('active'));
  event.target.classList.add('active');
}

function saveResearchData() {
  // Save with the current project
  localStorage.setItem('research_' + (currentProjectName || 'default'), JSON.stringify(researchData));
}

function loadResearchData() {
  const saved = localStorage.getItem('research_' + (currentProjectName || 'default'));
  if (saved) {
    researchData = JSON.parse(saved);
    refreshResearchFolderList();
  }
}

function showResearchContextMenu(e, folderName, itemName) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('researchContextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'researchContextMenu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 2500;
    min-width: 140px;
  `;
  
  menu.innerHTML = `
    <div class="context-option" onclick="deleteResearchItem('${folderName}', '${itemName}')">🗑️ Delete Research</div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeResearchContextMenu);
  }, 10);
}

function closeResearchContextMenu() {
  const menu = document.getElementById('researchContextMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeResearchContextMenu);
}

function deleteResearchItem(folderName, itemName) {
  closeResearchContextMenu();
  
  const confirmDelete = confirm(`Are you sure you want to delete the research item "${itemName}"?\n\nThis cannot be undone.`);
  if (!confirmDelete) return;
  
  // Delete the research item
  delete researchData.folders[folderName][itemName];
  
  // Clear viewer if this was the current item
  if (researchData.currentItem === itemName && researchData.currentFolder === folderName) {
    document.getElementById('currentResearchTitle').textContent = 'Select a research item to view';
    document.getElementById('currentResearchContent').innerHTML = 'Click on a research item in a folder to view it here...';
    researchData.currentItem = null;
    researchData.currentFolder = null;
  }
  
  refreshResearchFolderList();
  saveResearchData();
}

function showResearchFolderContextMenu(e, folderName) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('researchFolderContextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'researchFolderContextMenu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 2500;
    min-width: 160px;
  `;
  
  const itemCount = Object.keys(researchData.folders[folderName]).length;
  
  menu.innerHTML = `
    <div class="context-option" onclick="deleteResearchFolder('${folderName}')">🗑️ Delete Folder${itemCount > 0 ? ` (${itemCount} items)` : ''}</div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeResearchFolderContextMenu);
  }, 10);
}

function closeResearchFolderContextMenu() {
  const menu = document.getElementById('researchFolderContextMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeResearchFolderContextMenu);
}

function deleteResearchFolder(folderName) {
  closeResearchFolderContextMenu();
  
  const itemCount = Object.keys(researchData.folders[folderName]).length;
  let confirmMessage = `Are you sure you want to delete the folder "${folderName}"?`;
  
  if (itemCount > 0) {
    confirmMessage += `\n\nThis will also delete ${itemCount} research item${itemCount === 1 ? '' : 's'} inside it.`;
  }
  
  confirmMessage += '\n\nThis cannot be undone.';
  
  const confirmDelete = confirm(confirmMessage);
  if (!confirmDelete) return;
  
  // Clear viewer if current item is in this folder
  if (researchData.currentFolder === folderName) {
    document.getElementById('currentResearchTitle').textContent = 'Select a research item to view';
    document.getElementById('currentResearchContent').innerHTML = 'Click on a research item in a folder to view it here...';
    researchData.currentItem = null;
    researchData.currentFolder = null;
  }
  
  // Delete the entire folder
  delete researchData.folders[folderName];
  
  refreshResearchFolderList();
  saveResearchData();
}

// Initialize research data when app loads
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadResearchData();
  }, 1000);
});

// Info for the Index card functions
// Index Cards System
let indexCardsData = {
  cards: {
    "Character": {},
    "Story Development": {},
     "Location": {},
    "Lore & Culture": {},
    "Objects & Tools": {},
    "Biology & Science": {},
    "Research & Notes": {},
    "Magic": {}
  },
  currentCard: null,
  currentType: null,
  currentCardName: null
};

// Dropdown toggle functionality
document.getElementById('newIndexCardButton').addEventListener('click', (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('newIndexCardDropdown');
  const viewDropdown = document.getElementById('viewIndexCardsDropdown');
  
  // Close view dropdown
  viewDropdown.classList.remove('show');
  
  // Toggle new card dropdown
  dropdown.classList.toggle('show');
});

document.getElementById('viewIndexCardsButton').addEventListener('click', (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('viewIndexCardsDropdown');
  const newDropdown = document.getElementById('newIndexCardDropdown');
  
  // Close new card dropdown
  newDropdown.classList.remove('show');
  
  // Toggle view dropdown
  dropdown.classList.toggle('show');
});

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
  document.getElementById('newIndexCardDropdown').classList.remove('show');
  document.getElementById('viewIndexCardsDropdown').classList.remove('show');
});

// Handle new card type selection
document.querySelectorAll('.index-card-type').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const cardType = item.getAttribute('data-type');
    showNewCardDialog(cardType);
    document.getElementById('newIndexCardDropdown').classList.remove('show');
  });
});

// Handle view card type selection
document.querySelectorAll('.view-card-type').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const cardType = item.getAttribute('data-type');
    showCardsOfType(cardType);
    document.getElementById('viewIndexCardsDropdown').classList.remove('show');
  });
});

function showNewCardDialog(cardType) {
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
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 600px;
    max-height: 80vh;
    width: 90%;
    overflow-y: auto;
  `;
  
dialog.innerHTML = `
  <h2 style="margin-top: 0; color: #333;">📇 New ${cardType} Card</h2>
  
  <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Card Name:</label>
    <input type="text" id="cardName" placeholder="Enter card name..." 
           style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  </div>
  
  <div id="cardFormContent">
    <!-- Content will be generated based on card type -->
  </div>
  
  <div style="text-align: right; margin-top: 30px;">
    <button id="cancelCard" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
    <button id="saveCard" style="padding: 8px 16px; border: none; background: #D0D0D0; color: #333; border-radius: 4px; cursor: pointer;">Save Card</button>
  </div>
`;
  // Generate form based on card type
 overlay.appendChild(dialog);
document.body.appendChild(overlay);

// Handle save and cancel FIRST
document.getElementById('saveCard').onclick = () => saveNewCard(cardType, overlay);
document.getElementById('cancelCard').onclick = () => document.body.removeChild(overlay);
overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

// THEN generate form based on card type (after dialog is in DOM)
generateCardForm(cardType);

// Focus on name input
document.getElementById('cardName').focus();
}

function generateCardForm(cardType) {
  const formContent = document.getElementById('cardFormContent');
  
  if (cardType === 'Character') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👤 Basic Information</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Name</label>
            <input type="text" data-field="name" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Date of Birth</label>
            <input type="text" data-field="dateOfBirth" placeholder="Year, season, date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Age</label>
            <input type="text" data-field="age" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Death Date</label>
            <input type="text" data-field="deathDate" placeholder="Year or N/A..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Significant Event Date</label>
            <input type="text" data-field="significantEventDate" placeholder="Important date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Happened</label>
            <input type="text" data-field="significantEventDescription" placeholder="Describe the event..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>

      <!-- Section 2: Details -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🎭 Details</h4>
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Appearance</label>
          <textarea data-field="appearance" placeholder="Physical description..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Species</label>
            <input type="text" data-field="species" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Language</label>
            <input type="text" data-field="language" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Height/Weight</label>
            <input type="text" data-field="heightWeight" placeholder="5'6", 140 lbs..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Voice & Speech</label>
            <input type="text" data-field="voiceSpeech" placeholder="Deep voice, stutters..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Distinctive Features</label>
          <textarea data-field="distinctiveFeatures" placeholder="Scars, tattoos, birthmarks, unique traits..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Skills</label>
            <input type="text" data-field="skills" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Secrets</label>
            <input type="text" data-field="secrets" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Goals</label>
            <input type="text" data-field="goals" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Mythical</label>
            <input type="text" data-field="mythical" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Goals</label>
            <input type="text" data-field="goals" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Mythical</label>
            <input type="text" data-field="mythical" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
     <!-- Section 3: Psychology & Personality -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🧠 Psychology & Personality</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Core Personality Traits</label>
          <textarea data-field="personalityTraits" placeholder="Brave, curious, stubborn, compassionate..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Fears & Phobias</label>
            <textarea data-field="fearsPhobias" placeholder="Heights, betrayal, spiders..." 
                      style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Core Motivations</label>
            <textarea data-field="coreMotivations" placeholder="Protect family, seek revenge, find truth..." 
                      style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Moral Alignment</label>
            <select data-field="moralAlignment" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select alignment...</option>
              <option value="Good">Good</option>
              <option value="Neutral">Neutral</option>
              <option value="Evil">Evil</option>
              <option value="Chaotic Good">Chaotic Good</option>
              <option value="Lawful Good">Lawful Good</option>
              <option value="Chaotic Neutral">Chaotic Neutral</option>
              <option value="True Neutral">True Neutral</option>
              <option value="Lawful Neutral">Lawful Neutral</option>
              <option value="Chaotic Evil">Chaotic Evil</option>
              <option value="Lawful Evil">Lawful Evil</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Quirks & Mannerisms</label>
            <input type="text" data-field="quirksMannerisms" placeholder="Taps fingers, avoids eye contact..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Section 4: Background & Social World -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🌍 Background & Social World</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Education Level</label>
            <select data-field="educationLevel" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select level...</option>
              <option value="None">No Formal Education</option>
              <option value="Basic">Basic Education</option>
              <option value="Apprentice">Apprenticed/Trained</option>
              <option value="Advanced">Advanced Learning</option>
              <option value="Scholar">Scholar/Expert</option>
              <option value="Master">Master Level</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Occupation/Profession</label>
            <input type="text" data-field="occupation" placeholder="Blacksmith, mage, farmer..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Wealth Level</label>
            <select data-field="wealthLevel" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select level...</option>
              <option value="Destitute">Destitute</option>
              <option value="Poor">Poor</option>
              <option value="Modest">Modest</option>
              <option value="Comfortable">Comfortable</option>
              <option value="Wealthy">Wealthy</option>
              <option value="Rich">Rich</option>
              <option value="Noble">Noble/Royal</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Social Status</label>
            <input type="text" data-field="socialStatus" placeholder="Commoner, noble, outcast..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Allies & Friends</label>
          <div class="card-link-field" data-field="alliesFriends"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Enemies & Rivals</label>
          <div class="card-link-field" data-field="enemiesRivals"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Major Life Events</label>
          <textarea data-field="majorLifeEvents" placeholder="Key moments that shaped this character..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Reputation & How Others See Them</label>
          <textarea data-field="reputation" placeholder="How are they viewed by others? What's their reputation?" 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      <!-- Section 3: Relationships -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👥 Relationships</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Mother</label>
            <div class="card-link-field" data-field="mother"></div>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Father</label>
            <div class="card-link-field" data-field="father"></div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Spouse</label>
            <div class="card-link-field" data-field="spouse"></div>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Love Interest</label>
            <div class="card-link-field" data-field="loveInterest"></div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Siblings</label>
            <div class="card-link-field" data-field="siblings"></div>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Children</label>
            <div class="card-link-field" data-field="children"></div>
          </div>
        </div>
      </div>

      <!-- Section 4: Back Story -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📖 Back Story</h4>
        <textarea data-field="backStory" placeholder="Character's history and background..." 
                  style="width: 100%; height: 100px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas</small>
</div>
      <!-- Section 5: Other -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Other Notes:</label>
        <textarea data-field="content" placeholder="Additional character information..." 
                  style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    
    // Initialize card link fields
} else if (cardType === 'Story Development') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Story Elements -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📚 Basic Story Elements</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Plot Point Type</label>
            <select data-field="plotPointType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Opening">Opening</option>
              <option value="Inciting Incident">Inciting Incident</option>
              <option value="Plot Point 1">Plot Point 1</option>
              <option value="Midpoint">Midpoint</option>
              <option value="Plot Point 2">Plot Point 2</option>
              <option value="Climax">Climax</option>
              <option value="Resolution">Resolution</option>
              <option value="Character Arc">Character Arc</option>
              <option value="Subplot">Subplot</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Story Year/Setting</label>
            <input type="text" data-field="storyYearSetting" placeholder="When does this happen..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Event/Conflict Date</label>
            <input type="text" data-field="eventConflictDate" placeholder="Specific date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Happens</label>
            <input type="text" data-field="eventConflictDescription" placeholder="Describe the event/conflict..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Chapter/Scene</label>
            <input type="text" data-field="chapterScene" placeholder="Chapter 5, Scene 2..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Characters Involved</label>
            <input type="text" data-field="charactersInvolved" placeholder="Main characters in this scene..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Conflict Type</label>
            <select data-field="conflictType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select conflict...</option>
              <option value="Internal">Internal (character vs self)</option>
              <option value="Interpersonal">Interpersonal (character vs character)</option>
              <option value="External">External (character vs world)</option>
              <option value="Societal">Societal (character vs society)</option>
              <option value="Natural">Natural (character vs nature)</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Section 2: Scene Details -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🎬 Scene Details</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Setting/Location</label>
            <input type="text" data-field="settingLocation" placeholder="Where does this happen..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">POV Character</label>
            <input type="text" data-field="povCharacter" placeholder="Whose perspective..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Mood/Atmosphere</label>
            <select data-field="moodAtmosphere" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select mood...</option>
              <option value="Tense">Tense</option>
              <option value="Romantic">Romantic</option>
              <option value="Mysterious">Mysterious</option>
              <option value="Action-Packed">Action-Packed</option>
              <option value="Peaceful">Peaceful</option>
              <option value="Humorous">Humorous</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Stakes (What's at Risk?)</label>
            <input type="text" data-field="stakes" placeholder="What happens if they fail..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Section 3: Story Structure & Development -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📈 Story Structure & Development</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Character Arcs (How Characters Change)</label>
          <textarea data-field="characterArcs" placeholder="How do characters grow or change in this scene..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Foreshadowing & Setup</label>
          <textarea data-field="foreshadowing" placeholder="What does this scene set up for later..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Subplots</label>
            <input type="text" data-field="subplots" placeholder="Which subplot threads this advances..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Connected Scenes</label>
            <input type="text" data-field="connectedScenes" placeholder="Links to other scenes..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Section 4: Writing Progress -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">✍️ Writing Progress</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Status</label>
            <select data-field="status" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select status...</option>
              <option value="Planned">Planned</option>
              <option value="Outlined">Outlined</option>
              <option value="First Draft">First Draft</option>
              <option value="Second Draft">Second Draft</option>
              <option value="Revised">Revised</option>
              <option value="Final">Final</option>
              <option value="Cut">Cut</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Word Count Target</label>
            <input type="number" data-field="wordCountTarget" placeholder="500" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Actual Word Count</label>
            <input type="number" data-field="actualWordCount" placeholder="0" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Notes for Revision</label>
          <textarea data-field="revisionNotes" placeholder="What needs improvement, feedback, ideas..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>
      <!-- Section 2: Story Notes -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">📝 Story Notes:</label>
        <textarea data-field="content" placeholder="Detailed description of this story element..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
        // Initialize card link fields for Location cards
} else if (cardType === 'Location') {
    formContent.innerHTML = `
      <!-- Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🌍 Basic Information</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Name</label>
            <input type="text" data-field="locationName" placeholder="Location name..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Type</label>
            <select data-field="locationType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="City">City</option>
              <option value="Town">Town</option>
              <option value="Village">Village</option>
              <option value="Castle">Castle</option>
              <option value="Forest">Forest</option>
              <option value="Mountain">Mountain</option>
              <option value="Desert">Desert</option>
              <option value="Ocean">Ocean</option>
              <option value="Planet">Planet</option>
              <option value="Kingdom">Kingdom</option>
              <option value="Region">Region</option>
              <option value="Building">Building</option>
              <option value="Room">Room</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Region / Country / World</label>
            <input type="text" data-field="region" placeholder="Where is this located..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Map Reference</label>
            <input type="text" data-field="mapReference" placeholder="Grid coords, directions..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Description</label>
          <textarea data-field="description" placeholder="What does this place look like..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        <!-- Timeline & History -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📅 Timeline & History</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Year Location Developed</label>
            <input type="text" data-field="yearLocationDeveloped" placeholder="When was it built/founded..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Happened</label>
            <input type="text" data-field="developmentDescription" placeholder="How it was created..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Environmental Changes Date</label>
            <input type="text" data-field="environmentalChangesDate" placeholder="When environment changed..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Changed</label>
            <input type="text" data-field="environmentalChangesDescription" placeholder="Describe the change..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Key Events Date</label>
            <input type="text" data-field="keyEventsDate" placeholder="Important date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Event</label>
            <input type="text" data-field="keyEventsDescription" placeholder="Describe the event..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      </div>
      
<!-- Details -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🏛️ Details</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Climate</label>
            <input type="text" data-field="climate" placeholder="Weather, temperature..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Population Size</label>
            <select data-field="populationSize" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select size...</option>
              <option value="Uninhabited">Uninhabited</option>
              <option value="Tiny (1-50)">Tiny (1-50)</option>
              <option value="Small (51-500)">Small (51-500)</option>
              <option value="Medium (501-5,000)">Medium (501-5,000)</option>
              <option value="Large (5,001-50,000)">Large (5,001-50,000)</option>
              <option value="Huge (50,000+)">Huge (50,000+)</option>
              <option value="Massive (500,000+)">Massive (500,000+)</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Culture / Inhabitants</label>
            <input type="text" data-field="inhabitants" placeholder="Who lives here..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Mood/Atmosphere</label>
            <select data-field="moodAtmosphere" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select mood...</option>
              <option value="Bustling">Bustling</option>
              <option value="Peaceful">Peaceful</option>
              <option value="Mysterious">Mysterious</option>
              <option value="Dangerous">Dangerous</option>
              <option value="Magical">Magical</option>
              <option value="Decaying">Decaying</option>
              <option value="Prosperous">Prosperous</option>
              <option value="Isolated">Isolated</option>
              <option value="Tense">Tense</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Sensory Details (Sounds, Smells, Feeling)</label>
          <textarea data-field="sensoryDetails" placeholder="What does this place sound like, smell like, feel like..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Points of Interest</label>
          <textarea data-field="pointsOfInterest" placeholder="Notable landmarks, buildings, areas..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Conflicts / Factions</label>
          <textarea data-field="conflicts" placeholder="Political tensions, warring groups..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      <!-- Government & Leadership -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🏛️ Government & Leadership</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Government Type</label>
            <select data-field="governmentType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Monarchy">Monarchy</option>
              <option value="Democracy">Democracy</option>
              <option value="Republic">Republic</option>
              <option value="Theocracy">Theocracy</option>
              <option value="Tribal Council">Tribal Council</option>
              <option value="Oligarchy">Oligarchy</option>
              <option value="Dictatorship">Dictatorship</option>
              <option value="Anarchy">Anarchy</option>
              <option value="Magocracy">Magocracy</option>
              <option value="Council of Elders">Council of Elders</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Ruler/Leader</label>
            <input type="text" data-field="rulerLeader" placeholder="Who's in charge..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Laws & Legal System</label>
          <textarea data-field="lawsLegal" placeholder="Key laws, justice system, punishments..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Political Tensions</label>
          <textarea data-field="politicalTensions" placeholder="Political issues, power struggles..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      <!-- Economy & Trade -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">💰 Economy & Trade</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Wealth Level</label>
            <select data-field="wealthLevel" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select level...</option>
              <option value="Destitute">Destitute</option>
              <option value="Poor">Poor</option>
              <option value="Struggling">Struggling</option>
              <option value="Modest">Modest</option>
              <option value="Comfortable">Comfortable</option>
              <option value="Prosperous">Prosperous</option>
              <option value="Wealthy">Wealthy</option>
              <option value="Opulent">Opulent</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Currency Used</label>
            <input type="text" data-field="currency" placeholder="Gold coins, credits, shells..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Major Industries & Resources</label>
          <textarea data-field="majorIndustries" placeholder="What do they produce, mine, grow, manufacture..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Exports (What They Sell)</label>
            <textarea data-field="exports" placeholder="What they trade to others..." 
                      style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Imports (What They Buy)</label>
            <textarea data-field="imports" placeholder="What they need from others..." 
                      style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
      </div>
      <!-- Infrastructure & Defenses -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🛡️ Infrastructure & Defenses</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Notable Buildings & Landmarks</label>
          <textarea data-field="notableBuildings" placeholder="Temples, markets, guildhalls, monuments..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Defenses & Military</label>
            <textarea data-field="defenses" placeholder="Walls, guards, army, magical wards..." 
                      style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Transportation</label>
            <textarea data-field="transportation" placeholder="Roads, bridges, boats, teleportation..." 
                      style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Infrastructure & Services</label>
          <textarea data-field="infrastructure" placeholder="Water supply, sewers, hospitals, schools..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      <!-- Threats & Dangers -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">⚠️ Threats & Dangers</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Crime & Safety</label>
            <select data-field="crimeLevel" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select level...</option>
              <option value="Very Safe">Very Safe</option>
              <option value="Safe">Safe</option>
              <option value="Moderate">Moderate</option>
              <option value="Dangerous">Dangerous</option>
              <option value="Very Dangerous">Very Dangerous</option>
              <option value="Lawless">Lawless</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Natural Hazards</label>
            <input type="text" data-field="naturalHazards" placeholder="Earthquakes, storms, floods..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Monster/Creature Threats</label>
            <textarea data-field="monsterThreats" placeholder="Dragons, bandits, wild beasts..." 
                      style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Other Dangers</label>
            <textarea data-field="otherDangers" placeholder="Magical curses, political intrigue..." 
                      style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
      </div>
<!-- Connected People & Organizations -->
<div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
  <h4 style="margin: 0 0 10px 0; color: #333;">👥 Connected People & Organizations</h4>
  
  <div style="margin-bottom: 10px;">
    <label style="font-size: 12px; color: #666;">Characters who live here or visit this location</label>
    <div class="card-link-field" data-field="connectedCharacters"></div>
  </div>
  
  <div style="margin-bottom: 10px;">
    <label style="font-size: 12px; color: #666;">Organizations based here or operating here</label>
    <div class="card-link-field" data-field="connectedOrganizations"></div>
  </div>
  
  <div style="margin-bottom: 10px;">
    <label style="font-size: 12px; color: #666;">Cultures & Peoples who live here</label>
    <div class="card-link-field" data-field="connectedCultures"></div>
  </div>
  
  <div style="margin-bottom: 10px;">
    <label style="font-size: 12px; color: #666;">Important Events that happened here</label>
    <div class="card-link-field" data-field="connectedEvents"></div>
  </div>
</div>

<!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>

      <!-- History & Events -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">History & Important Events:</label>
        <textarea data-field="content" placeholder="Historical events, founding, important moments, additional notes..." 
                  style="width: 100%; height: 100px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    } else if (cardType === 'Organizations') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🏛️ Basic Information</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Organization Type</label>
            <select data-field="organizationType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Government">Government</option>
              <option value="Guild">Guild</option>
              <option value="Military">Military</option>
              <option value="Religious Order">Religious Order</option>
              <option value="Secret Society">Secret Society</option>
              <option value="Trading Company">Trading Company</option>
              <option value="Criminal Organization">Criminal Organization</option>
              <option value="Noble House">Noble House</option>
              <option value="Mercenary Group">Mercenary Group</option>
              <option value="Academic Institution">Academic Institution</option>
              <option value="Adventuring Party">Adventuring Party</option>
              <option value="Cult">Cult</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Size</label>
            <select data-field="organizationSize" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select size...</option>
              <option value="Tiny (2-10 members)">Tiny (2-10 members)</option>
              <option value="Small (11-50 members)">Small (11-50 members)</option>
              <option value="Medium (51-200 members)">Medium (51-200 members)</option>
              <option value="Large (201-1,000 members)">Large (201-1,000 members)</option>
              <option value="Huge (1,001-10,000 members)">Huge (1,001-10,000 members)</option>
              <option value="Massive (10,000+ members)">Massive (10,000+ members)</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Founded</label>
            <input type="text" data-field="founded" placeholder="When was it established..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Status</label>
            <select data-field="status" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select status...</option>
              <option value="Active">Active</option>
              <option value="Growing">Growing</option>
              <option value="Declining">Declining</option>
              <option value="Disbanded">Disbanded</option>
              <option value="Hidden">Hidden</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Headquarters/Base</label>
          <input type="text" data-field="headquarters" placeholder="Where is their main base..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
        </div>
      </div>
      
      <!-- Section 2: Leadership & Structure -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👑 Leadership & Structure</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Leader/Head</label>
            <input type="text" data-field="leader" placeholder="Who leads this organization..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Leadership Type</label>
            <select data-field="leadershipType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Autocracy">Autocracy (Single Leader)</option>
              <option value="Council">Council</option>
              <option value="Democracy">Democracy</option>
              <option value="Hierarchy">Hierarchy</option>
              <option value="Meritocracy">Meritocracy</option>
              <option value="Oligarchy">Oligarchy</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Organizational Structure</label>
          <textarea data-field="organizationalStructure" placeholder="How is the organization structured? Ranks, departments, chains of command..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Key Members</label>
          <div class="card-link-field" data-field="keyMembers"></div>
        </div>
      </div>
      
      <!-- Section 3: Purpose & Activities -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🎯 Purpose & Activities</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Primary Goals</label>
          <textarea data-field="primaryGoals" placeholder="What does this organization want to achieve..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Methods & Activities</label>
          <textarea data-field="methodsActivities" placeholder="How do they operate? What do they do..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Resources</label>
            <textarea data-field="resources" placeholder="Money, weapons, influence..." 
                      style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Territory/Influence</label>
            <textarea data-field="territory" placeholder="Where do they operate..." 
                      style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
      </div>
      
      <!-- Section 4: Relationships & Politics -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🤝 Relationships & Politics</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Allies</label>
          <div class="card-link-field" data-field="allies"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Enemies</label>
          <div class="card-link-field" data-field="enemies"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Reputation</label>
          <textarea data-field="reputation" placeholder="How are they viewed by others..." 
                    style="width: 100%; height: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Public vs Secret</label>
          <select data-field="publicSecret" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
            <option value="">Select visibility...</option>
            <option value="Completely Public">Completely Public</option>
            <option value="Mostly Public">Mostly Public</option>
            <option value="Semi-Secret">Semi-Secret</option>
            <option value="Secret">Secret</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>
      <!-- Timeline & History -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📅 Timeline & History</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Creation Date</label>
            <input type="text" data-field="creationDate" placeholder="When was it founded..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">How it was Founded</label>
            <input type="text" data-field="foundingDescription" placeholder="Founding story..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Structural Changes Date</label>
            <input type="text" data-field="structuralChangesDate" placeholder="When organization changed..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Changed</label>
            <input type="text" data-field="structuralChangesDescription" placeholder="Describe the changes..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Major Events Date</label>
            <input type="text" data-field="majorEventsDate" placeholder="Important date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Event</label>
            <input type="text" data-field="majorEventsDescription" placeholder="Describe the event..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>

      <!-- Section 5: Additional Details -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">📝 Additional Details:</label>
        <textarea data-field="content" placeholder="History, culture, traditions, notable events, additional information..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    } else if (cardType === 'Events') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📜 Basic Information</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Event Type</label>
            <select data-field="eventType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Battle/War">Battle/War</option>
              <option value="Political Event">Political Event</option>
              <option value="Discovery">Discovery</option>
              <option value="Natural Disaster">Natural Disaster</option>
              <option value="Cultural/Religious">Cultural/Religious</option>
              <option value="Magical Event">Magical Event</option>
              <option value="Technological">Technological</option>
              <option value="Economic">Economic</option>
              <option value="Personal/Character">Personal/Character</option>
              <option value="Diplomatic">Diplomatic</option>
              <option value="Catastrophe">Catastrophe</option>
              <option value="Celebration">Celebration</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Scale/Impact</label>
            <select data-field="scale" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select scale...</option>
              <option value="Personal">Personal (affects individuals)</option>
              <option value="Local">Local (affects a town/area)</option>
              <option value="Regional">Regional (affects a region/country)</option>
              <option value="Continental">Continental (affects continent)</option>
              <option value="Global">Global (affects the world)</option>
              <option value="Cosmic">Cosmic (affects multiple worlds)</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Date/Time</label>
            <input type="text" data-field="eventDate" placeholder="When did this happen..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Duration</label>
            <input type="text" data-field="duration" placeholder="How long did it last..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
  <div>
    <label style="font-size: 12px; color: #666;">Location(s) - Text</label>
    <input type="text" data-field="eventLocation" placeholder="Where did this happen..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
  </div>
  <div>
    <label style="font-size: 12px; color: #666;">Linked Locations</label>
    <div class="card-link-field" data-field="linkedLocations"></div>
  </div>
</div>
      </div>
      
      <!-- Section 2: Participants & Involved Parties -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👥 Participants & Involved Parties</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Key Characters</label>
          <div class="card-link-field" data-field="keyCharacters"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Organizations Involved</label>
          <div class="card-link-field" data-field="organizationsInvolved"></div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Primary Instigator</label>
            <input type="text" data-field="primaryInstigator" placeholder="Who/what started this..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Other Participants</label>
            <input type="text" data-field="otherParticipants" placeholder="Other people/groups involved..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      
      <!-- Section 3: Causes & Background -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🔍 Causes & Background</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Root Causes</label>
          <textarea data-field="rootCauses" placeholder="What led to this event? Why did it happen..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Immediate Trigger</label>
          <textarea data-field="immediateTrigger" placeholder="What was the final trigger that started the event..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Previous Related Events</label>
          <input type="text" data-field="previousEvents" placeholder="Events that led up to this..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
        </div>
      </div>
      
      <!-- Section 4: Consequences & Aftermath -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">⚡ Consequences & Aftermath</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Immediate Consequences</label>
          <textarea data-field="immediateConsequences" placeholder="What happened right after the event..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Long-term Effects</label>
          <textarea data-field="longTermEffects" placeholder="How did this change the world/characters..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Winners/Beneficiaries</label>
            <textarea data-field="winners" placeholder="Who gained from this..." 
                      style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Losers/Victims</label>
            <textarea data-field="losers" placeholder="Who suffered from this..." 
                      style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>
      <!-- Section 5: Event Description -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">📝 Event Description:</label>
        <textarea data-field="content" placeholder="Detailed description of what happened, key moments, quotes, additional information..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    } else if (cardType === 'Objects & Items') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📦 Basic Information</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Item Type</label>
            <select data-field="itemType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Weapon">Weapon</option>
              <option value="Tool">Tool</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Artifact">Artifact</option>
              <option value="Document">Document</option>
              <option value="Technology">Technology</option>
              <option value="Clothing/Armor">Clothing/Armor</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Book/Scroll">Book/Scroll</option>
              <option value="Food/Potion">Food/Potion</option>
              <option value="Currency">Currency</option>
              <option value="Art/Decoration">Art/Decoration</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Rarity/Value</label>
            <select data-field="rarity" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select rarity...</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Very Rare">Very Rare</option>
              <option value="Legendary">Legendary</option>
              <option value="Unique">Unique</option>
              <option value="Priceless">Priceless</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Size/Weight</label>
            <input type="text" data-field="sizeWeight" placeholder="How big/heavy is it..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Material/Construction</label>
            <input type="text" data-field="material" placeholder="What is it made of..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Physical Description</label>
          <textarea data-field="physicalDescription" placeholder="What does it look like..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      
      <!-- Section 2: Function & Powers -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">⚡ Function & Powers</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Primary Function/Purpose</label>
          <textarea data-field="primaryFunction" placeholder="What is this item used for..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Special Powers/Abilities</label>
          <textarea data-field="specialPowers" placeholder="Magical powers, technological features, special properties..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Activation Method</label>
            <input type="text" data-field="activationMethod" placeholder="How to use/activate..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Limitations/Drawbacks</label>
            <input type="text" data-field="limitations" placeholder="What are the limits..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      
      <!-- Section 3: Ownership & Location -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👤 Ownership & Location</h4>
        
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
  <div>
    <label style="font-size: 12px; color: #666;">Current Owner - Character</label>
    <div class="card-link-field" data-field="currentOwner"></div>
  </div>
  <div>
    <label style="font-size: 12px; color: #666;">Current Owner - Organization</label>
    <div class="card-link-field" data-field="currentOwnerOrg"></div>
  </div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
  <div>
    <label style="font-size: 12px; color: #666;">Current Location - Text</label>
    <input type="text" data-field="currentLocation" placeholder="Where is it now..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
  </div>
  <div>
    <label style="font-size: 12px; color: #666;">Current Location - Linked</label>
    <div class="card-link-field" data-field="currentLocationLinked"></div>
  </div>
</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Previous Owners</label>
            <input type="text" data-field="previousOwners" placeholder="Who owned it before..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">How Acquired</label>
            <input type="text" data-field="howAcquired" placeholder="How did they get it..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      
      <!-- Section 4: History & Significance -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📜 History & Significance</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Origin/Creation</label>
          <textarea data-field="origin" placeholder="Where did it come from? Who made it..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Historical Significance</label>
          <textarea data-field="historicalSignificance" placeholder="Important events involving this item..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Cultural/Religious Meaning</label>
            <input type="text" data-field="culturalMeaning" placeholder="Symbolic importance..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Condition</label>
            <select data-field="condition" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select condition...</option>
              <option value="Perfect">Perfect</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Broken">Broken</option>
              <option value="Destroyed">Destroyed</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Timeline & History -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📅 Timeline & History</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Creation Date</label>
            <input type="text" data-field="creationDate" placeholder="When was it created..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">How it was Created</label>
            <input type="text" data-field="creationDescription" placeholder="Creation story..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Changed/Affected Date</label>
            <input type="text" data-field="changedAffectedDate" placeholder="When was it modified..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Changed</label>
            <input type="text" data-field="changedAffectedDescription" placeholder="Describe the changes..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>
      <!-- Section 5: Additional Details -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">📝 Additional Details:</label>
        <textarea data-field="content" placeholder="Additional information, stories, legends, technical details..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    } else if (cardType === 'Cultures & Peoples') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🌍 Basic Information</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Type</label>
            <select data-field="cultureType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Human Culture">Human Culture</option>
              <option value="Non-Human Species">Non-Human Species</option>
              <option value="Mixed Society">Mixed Society</option>
              <option value="Religious Group">Religious Group</option>
              <option value="Social Class">Social Class</option>
              <option value="Professional Group">Professional Group</option>
              <option value="Tribal Society">Tribal Society</option>
              <option value="City-State">City-State</option>
              <option value="Nomadic People">Nomadic People</option>
              <option value="Subculture">Subculture</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Population Size</label>
            <select data-field="populationSize" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select size...</option>
              <option value="Extinct">Extinct</option>
              <option value="Nearly Extinct (1-100)">Nearly Extinct (1-100)</option>
              <option value="Very Small (100-1,000)">Very Small (100-1,000)</option>
              <option value="Small (1,000-10,000)">Small (1,000-10,000)</option>
              <option value="Medium (10,000-100,000)">Medium (10,000-100,000)</option>
              <option value="Large (100,000-1M)">Large (100,000-1M)</option>
              <option value="Very Large (1M+)">Very Large (1M+)</option>
              <option value="Dominant">Dominant Population</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Primary Location</label>
            <input type="text" data-field="primaryLocation" placeholder="Where do they live..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Lifespan</label>
            <input type="text" data-field="lifespan" placeholder="How long do they live..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">General Description</label>
          <textarea data-field="generalDescription" placeholder="Overall description of this culture/people..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      
      <!-- Section 2: Physical Characteristics -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👤 Physical Characteristics</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Average Height/Size</label>
            <input type="text" data-field="averageHeight" placeholder="How tall/big are they..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Distinctive Features</label>
            <input type="text" data-field="distinctiveFeatures" placeholder="What makes them unique..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Physical Appearance</label>
          <textarea data-field="physicalAppearance" placeholder="What do they look like? Skin, hair, eyes, body type..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Special Abilities/Traits</label>
          <textarea data-field="specialAbilities" placeholder="Natural abilities, magical powers, enhanced senses..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      
      <!-- Section 3: Culture & Society -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🏛️ Culture & Society</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Social Structure</label>
            <select data-field="socialStructure" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select structure...</option>
              <option value="Egalitarian">Egalitarian</option>
              <option value="Hierarchical">Hierarchical</option>
              <option value="Caste System">Caste System</option>
              <option value="Tribal">Tribal</option>
              <option value="Democratic">Democratic</option>
              <option value="Monarchical">Monarchical</option>
              <option value="Theocratic">Theocratic</option>
              <option value="Anarchistic">Anarchistic</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Technology Level</label>
            <select data-field="technologyLevel" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select level...</option>
              <option value="Stone Age">Stone Age</option>
              <option value="Bronze Age">Bronze Age</option>
              <option value="Iron Age">Iron Age</option>
              <option value="Medieval">Medieval</option>
              <option value="Renaissance">Renaissance</option>
              <option value="Industrial">Industrial</option>
              <option value="Modern">Modern</option>
              <option value="Advanced">Advanced</option>
              <option value="Futuristic">Futuristic</option>
              <option value="Mixed/Uneven">Mixed/Uneven</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Core Values & Beliefs</label>
          <textarea data-field="coreValues" placeholder="What do they believe in? What's important to them..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Customs & Traditions</label>
          <textarea data-field="customsTraditions" placeholder="Festivals, rituals, ceremonies, daily customs..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Primary Language</label>
            <input type="text" data-field="primaryLanguage" placeholder="What language do they speak..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Writing System</label>
            <input type="text" data-field="writingSystem" placeholder="How do they write..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      
      <!-- Section 4: Relationships & Politics -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🤝 Relationships & Politics</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Allied Cultures/Peoples</label>
          <div class="card-link-field" data-field="alliedCultures"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Enemy Cultures/Peoples</label>
          <div class="card-link-field" data-field="enemyCultures"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Notable Members</label>
          <div class="card-link-field" data-field="notableMembers"></div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Attitude to Outsiders</label>
            <select data-field="attitudeToOutsiders" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select attitude...</option>
              <option value="Welcoming">Welcoming</option>
              <option value="Friendly">Friendly</option>
              <option value="Neutral">Neutral</option>
              <option value="Suspicious">Suspicious</option>
              <option value="Hostile">Hostile</option>
              <option value="Isolationist">Isolationist</option>
              <option value="Varies">Varies by Group</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Current Status</label>
            <select data-field="currentStatus" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select status...</option>
              <option value="Thriving">Thriving</option>
              <option value="Stable">Stable</option>
              <option value="Struggling">Struggling</option>
              <option value="In Crisis">In Crisis</option>
              <option value="At War">At War</option>
              <option value="In Decline">In Decline</option>
              <option value="Extinct">Extinct</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Timeline & History -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📅 Timeline & History</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Creation/Origin Date</label>
            <input type="text" data-field="creationOriginDate" placeholder="When did they emerge..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">How they Originated</label>
            <input type="text" data-field="originDescription" placeholder="Origin story..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Cultural Events Date</label>
            <input type="text" data-field="culturalEventsDate" placeholder="Important cultural date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Event</label>
            <input type="text" data-field="culturalEventsDescription" placeholder="Describe the event..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Changes Date</label>
            <input type="text" data-field="changesDate" placeholder="When they changed..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Changed</label>
            <input type="text" data-field="changesDescription" placeholder="Describe the changes..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>
      <!-- Section 5: Additional Details -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">📝 Additional Details:</label>
        <textarea data-field="content" placeholder="History, legends, additional cultural information, notable events..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
    } else if (cardType === 'Systems & Powers') {
    formContent.innerHTML = `
      <!-- Section 1: Basic Information -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">⚡ Basic Information</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">System Type</label>
            <select data-field="systemType" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select type...</option>
              <option value="Magic System">Magic System</option>
              <option value="Supernatural Powers">Supernatural Powers</option>
              <option value="Technology System">Technology System</option>
              <option value="Scientific Principle">Scientific Principle</option>
              <option value="Divine/Religious Power">Divine/Religious Power</option>
              <option value="Psychic/Mental Powers">Psychic/Mental Powers</option>
              <option value="Biological System">Biological System</option>
              <option value="Energy System">Energy System</option>
              <option value="Dimensional/Planar">Dimensional/Planar</option>
              <option value="Elemental System">Elemental System</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Scope/Scale</label>
            <select data-field="scope" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select scope...</option>
              <option value="Personal">Personal (individual use)</option>
              <option value="Local">Local (small area/group)</option>
              <option value="Regional">Regional (large area)</option>
              <option value="Global">Global (world-wide)</option>
              <option value="Universal">Universal (affects reality)</option>
              <option value="Multiversal">Multiversal (cross-dimensional)</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Origin/Source</label>
            <input type="text" data-field="origin" placeholder="Where does this come from..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Discovery/Creation Date</label>
            <input type="text" data-field="discoveryDate" placeholder="When was it discovered/created..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">General Description</label>
          <textarea data-field="generalDescription" placeholder="Overall description of this system/power..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      
      <!-- Section 2: How It Works -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🔬 How It Works</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Basic Mechanics</label>
          <textarea data-field="basicMechanics" placeholder="How does this system/power actually work..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Activation Requirements</label>
          <textarea data-field="activationRequirements" placeholder="What's needed to use/activate this..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Energy/Fuel Source</label>
            <input type="text" data-field="energySource" placeholder="What powers this system..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Manifestation</label>
            <input type="text" data-field="manifestation" placeholder="How does it appear/manifest..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      
      <!-- Section 3: Rules & Limitations -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📏 Rules & Limitations</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Fundamental Rules</label>
          <textarea data-field="fundamentalRules" placeholder="What are the unbreakable laws/rules of this system..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Limitations & Weaknesses</label>
          <textarea data-field="limitations" placeholder="What are the limits, costs, drawbacks..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Range/Distance Limits</label>
            <input type="text" data-field="rangeLimits" placeholder="How far can it reach..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Duration Limits</label>
            <input type="text" data-field="durationLimits" placeholder="How long does it last..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      
      <!-- Section 4: Users & Access -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">👥 Users & Access</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Who Can Use It</label>
            <select data-field="whoCanUse" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select access...</option>
              <option value="Anyone">Anyone</option>
              <option value="Born With It">Those Born With It</option>
              <option value="Trained Users">Trained Users Only</option>
              <option value="Specific Bloodline">Specific Bloodline</option>
              <option value="Chosen/Blessed">Chosen/Blessed Individuals</option>
              <option value="Species Specific">Specific Species Only</option>
              <option value="Technology Users">Technology Users</option>
              <option value="Very Few">Very Few People</option>
              <option value="Single User">Single User Only</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Learning Difficulty</label>
            <select data-field="learningDifficulty" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select difficulty...</option>
              <option value="Instinctive">Instinctive</option>
              <option value="Very Easy">Very Easy</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Difficult">Difficult</option>
              <option value="Very Difficult">Very Difficult</option>
              <option value="Nearly Impossible">Nearly Impossible</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Known Users</label>
          <div class="card-link-field" data-field="knownUsers"></div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Training/Learning Methods</label>
          <textarea data-field="trainingMethods" placeholder="How do people learn to use this..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
      </div>
      
      <!-- Section 5: Impact & Consequences -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🌍 Impact & Consequences</h4>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Societal Impact</label>
          <textarea data-field="societalImpact" placeholder="How has this affected society, culture, politics..." 
                    style="width: 100%; height: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #666;">Potential Dangers</label>
          <textarea data-field="potentialDangers" placeholder="What could go wrong? Risks and dangers..." 
                    style="width: 100%; height: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Current Status</label>
            <select data-field="currentStatus" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select status...</option>
              <option value="Active/Common">Active/Common</option>
              <option value="Active/Rare">Active/Rare</option>
              <option value="Declining">Declining</option>
              <option value="Hidden/Secret">Hidden/Secret</option>
              <option value="Forbidden">Forbidden</option>
              <option value="Lost/Forgotten">Lost/Forgotten</option>
              <option value="Experimental">Experimental</option>
              <option value="Evolving">Evolving</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Public Knowledge</label>
            <select data-field="publicKnowledge" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
              <option value="">Select level...</option>
              <option value="Common Knowledge">Common Knowledge</option>
              <option value="Widely Known">Widely Known</option>
              <option value="Some Know">Some Know</option>
              <option value="Few Know">Few Know</option>
              <option value="Secret">Secret</option>
              <option value="Myth/Legend">Myth/Legend</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Timeline & History -->
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📅 Timeline & History</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 12px; color: #666;">Creation/Beginning Date</label>
            <input type="text" data-field="creationBeginningDate" placeholder="When did it begin..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">How it Began</label>
            <input type="text" data-field="beginningDescription" placeholder="Origin story..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">Major Events Date</label>
            <input type="text" data-field="majorEventsDate" placeholder="Important date..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
          <div>
            <label style="font-size: 12px; color: #666;">What Event</label>
            <input type="text" data-field="majorEventsDescription" placeholder="Describe the event..." style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          </div>
        </div>
      </div>
      <!-- Tags Section -->
<div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #007cba;">
  <label style="display: block; margin-bottom: 5px; font-weight: bold;">🏷️ Tags:</label>
  <input type="text" data-field="tags" placeholder="Enter tags separated by commas (e.g., protagonist, noble, magic-user)" 
         style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
  <small style="color: #666; font-size: 11px;">Separate multiple tags with commas. Use tags to organize and find your cards easily!</small>
</div>
      <!-- Section 6: Additional Details -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">📝 Additional Details:</label>
        <textarea data-field="content" placeholder="History, variations, examples, technical details, related systems..." 
                  style="width: 100%; height: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
} else {
    // Default form for other card types
    formContent.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Content:</label>
        <textarea data-field="content" placeholder="Enter card details..." 
                  style="width: 100%; height: 200px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
      </div>
    `;
  }
  // Initialize card link fields after form is complete
setTimeout(() => {
  initializeCardLinkFields();
}, 100);
}

function initializeCardLinkFields() {
  document.querySelectorAll('.card-link-field').forEach(field => {
    const fieldName = field.getAttribute('data-field');
    
    field.innerHTML = `
      <div class="card-link-container">
        <input type="text" class="card-search-input" placeholder="Search for a character..." 
               style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
        <div class="card-search-results" style="display: none;"></div>
        <div class="selected-cards"></div>
      </div>
    `;
    
    const searchInput = field.querySelector('.card-search-input');
    const resultsDiv = field.querySelector('.card-search-results');
    const selectedDiv = field.querySelector('.selected-cards');
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      if (searchTerm.length < 2) {
        resultsDiv.style.display = 'none';
        return;
      }
      
      // Get all existing cards
      const allCards = getAllExistingCards();
      const matchingCards = allCards.filter(card => 
        card.name.toLowerCase().includes(searchTerm)
      );
      
      if (matchingCards.length > 0) {
        resultsDiv.innerHTML = matchingCards.map(card => `
          <div class="card-search-result" data-type="${card.type}" data-name="${card.name}"
               style="padding: 6px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 12px;">
            <span style="background: #e0e0e0; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 6px;">
              ${card.type}
            </span>
            ${card.name}
          </div>
        `).join('');
        
        resultsDiv.style.cssText = `
          display: block;
          position: absolute;
          background: white;
          border: 1px solid #ccc;
          border-radius: 3px;
          max-height: 150px;
          overflow-y: auto;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        
        // Add click handlers to results
        resultsDiv.querySelectorAll('.card-search-result').forEach(result => {
          result.addEventListener('click', () => {
            const cardType = result.getAttribute('data-type');
            const cardName = result.getAttribute('data-name');
            selectCardForField(selectedDiv, cardType, cardName, searchInput, resultsDiv);
          });
        });
      } else {
        resultsDiv.style.display = 'none';
      }
    });
    
    // Hide results when clicking outside
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        resultsDiv.style.display = 'none';
      }, 400);
    });
  });
}

function getAllExistingCards() {
  const allCards = [];
  
  // Get all index cards
  Object.keys(indexCardsData.cards).forEach(cardType => {
    Object.keys(indexCardsData.cards[cardType]).forEach(cardName => {
      allCards.push({
        type: cardType,
        name: cardName
      });
    });
  });
  
  return allCards;
}

function selectCardForField(selectedDiv, cardType, cardName, searchInput, resultsDiv) {
  // Clear search
  searchInput.value = '';
  resultsDiv.style.display = 'none';
  
  // Add selected card tag
  const cardTag = document.createElement('div');
  cardTag.style.cssText = `
    display: inline-flex;
    align-items: center;
    background: #e8f4fd;
    border: 1px solid #b8daf0;
    border-radius: 15px;
    padding: 4px 8px;
    margin: 2px 4px 2px 0;
    font-size: 11px;
    color: #333;
  `;
  
  cardTag.innerHTML = `
    <span style="background: #d0d0d0; padding: 1px 4px; border-radius: 8px; font-size: 9px; margin-right: 4px;">
      ${cardType}
    </span>
    ${cardName}
    <button onclick="this.parentElement.remove()" 
            style="background: none; border: none; margin-left: 6px; cursor: pointer; color: #666; font-size: 12px;">×</button>
  `;
  
  selectedDiv.appendChild(cardTag);
}
// this is the function for saving the index card types
function saveNewCard(cardType, overlay) {
  const cardName = document.getElementById('cardName').value.trim();
  
  if (!cardName) {
    alert('Please enter a name for this card.');
    return;
  }
  
  if (indexCardsData.cards[cardType] && indexCardsData.cards[cardType][cardName]) {
    alert('A card with that name already exists in this category!');
    return;
  }
  
  // Collect all field data
  const cardData = {
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  };
  
if (cardType === 'Character') {
    // Section 1: Basic Information
    cardData.name = document.querySelector('[data-field="name"]')?.value || '';
    cardData.dateOfBirth = document.querySelector('[data-field="dateOfBirth"]')?.value || '';
    cardData.age = document.querySelector('[data-field="age"]')?.value || '';
    cardData.deathDate = document.querySelector('[data-field="deathDate"]')?.value || '';
    cardData.significantEventDate = document.querySelector('[data-field="significantEventDate"]')?.value || '';
    cardData.significantEventDescription = document.querySelector('[data-field="significantEventDescription"]')?.value || '';
    
    // Section 2: Details
    cardData.appearance = document.querySelector('[data-field="appearance"]')?.value || '';
    cardData.species = document.querySelector('[data-field="species"]')?.value || '';
    cardData.language = document.querySelector('[data-field="language"]')?.value || '';
    cardData.skills = document.querySelector('[data-field="skills"]')?.value || '';
    cardData.secrets = document.querySelector('[data-field="secrets"]')?.value || '';
    cardData.goals = document.querySelector('[data-field="goals"]')?.value || '';
    cardData.mythical = document.querySelector('[data-field="mythical"]')?.value || '';
    // NEW: Enhanced Physical Details
    cardData.heightWeight = document.querySelector('[data-field="heightWeight"]')?.value || '';
    cardData.voiceSpeech = document.querySelector('[data-field="voiceSpeech"]')?.value || '';
    cardData.distinctiveFeatures = document.querySelector('[data-field="distinctiveFeatures"]')?.value || '';
    
    // NEW: Psychology & Personality
    cardData.personalityTraits = document.querySelector('[data-field="personalityTraits"]')?.value || '';
    cardData.fearsPhobias = document.querySelector('[data-field="fearsPhobias"]')?.value || '';
    cardData.coreMotivations = document.querySelector('[data-field="coreMotivations"]')?.value || '';
    cardData.moralAlignment = document.querySelector('[data-field="moralAlignment"]')?.value || '';
    cardData.quirksMannerisms = document.querySelector('[data-field="quirksMannerisms"]')?.value || '';
    
    // NEW: Background & Social World
    cardData.educationLevel = document.querySelector('[data-field="educationLevel"]')?.value || '';
    cardData.occupation = document.querySelector('[data-field="occupation"]')?.value || '';
    cardData.wealthLevel = document.querySelector('[data-field="wealthLevel"]')?.value || '';
    cardData.socialStatus = document.querySelector('[data-field="socialStatus"]')?.value || '';
    cardData.majorLifeEvents = document.querySelector('[data-field="majorLifeEvents"]')?.value || '';
    cardData.reputation = document.querySelector('[data-field="reputation"]')?.value || '';
    
    // NEW: Enhanced Relationships (allies and enemies)
    cardData.alliesFriends = [];
    const alliesField = document.querySelector('[data-field="alliesFriends"]');
    if (alliesField) {
      alliesField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.alliesFriends.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    cardData.enemiesRivals = [];
    const enemiesField = document.querySelector('[data-field="enemiesRivals"]');
    if (enemiesField) {
      enemiesField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.enemiesRivals.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    // Section 4: Back Story
    cardData.backStory = document.querySelector('[data-field="backStory"]')?.value || '';
    // Adding tags section
    cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';
    // Section 5: Other
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
    
    // Section 3: Relationships
    cardData.relationships = {};
    ['mother', 'father', 'spouse', 'loveInterest', 'siblings', 'children'].forEach(relationshipType => {
      const field = document.querySelector(`[data-field="${relationshipType}"]`);
      const selectedCards = [];
      
      if (field) {
        field.querySelectorAll('.selected-cards > div').forEach(cardTag => {
          const typeSpan = cardTag.querySelector('span');
          const cardType = typeSpan ? typeSpan.textContent.trim() : '';
          const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
          
          if (cardType && cardName) {
            selectedCards.push({
              type: cardType,
              name: cardName
            });
          }
        });
      }
      
      cardData.relationships[relationshipType] = selectedCards;
    });
     
} else if (cardType === 'Story Development') {
    // Basic Story Elements
    cardData.plotPointType = document.querySelector('[data-field="plotPointType"]')?.value || '';
    cardData.storyYearSetting = document.querySelector('[data-field="storyYearSetting"]')?.value || '';
    cardData.eventConflictDate = document.querySelector('[data-field="eventConflictDate"]')?.value || '';
    cardData.eventConflictDescription = document.querySelector('[data-field="eventConflictDescription"]')?.value || '';
    cardData.chapterScene = document.querySelector('[data-field="chapterScene"]')?.value || '';
    cardData.charactersInvolved = document.querySelector('[data-field="charactersInvolved"]')?.value || '';
    cardData.conflictType = document.querySelector('[data-field="conflictType"]')?.value || '';
    
    // Scene Details
    cardData.settingLocation = document.querySelector('[data-field="settingLocation"]')?.value || '';
    cardData.povCharacter = document.querySelector('[data-field="povCharacter"]')?.value || '';
    cardData.moodAtmosphere = document.querySelector('[data-field="moodAtmosphere"]')?.value || '';
    cardData.stakes = document.querySelector('[data-field="stakes"]')?.value || '';
    
    // Story Structure & Development
    cardData.characterArcs = document.querySelector('[data-field="characterArcs"]')?.value || '';
    cardData.foreshadowing = document.querySelector('[data-field="foreshadowing"]')?.value || '';
    cardData.subplots = document.querySelector('[data-field="subplots"]')?.value || '';
    cardData.connectedScenes = document.querySelector('[data-field="connectedScenes"]')?.value || '';
    
    // Writing Progress
    cardData.status = document.querySelector('[data-field="status"]')?.value || '';
    cardData.wordCountTarget = document.querySelector('[data-field="wordCountTarget"]')?.value || '';
    cardData.actualWordCount = document.querySelector('[data-field="actualWordCount"]')?.value || '';
    cardData.revisionNotes = document.querySelector('[data-field="revisionNotes"]')?.value || '';
    
    // Tags (added to every card type section)
    cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Story Notes
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
} else if (cardType === 'Location') {
    // Basic Information
    cardData.locationName = document.querySelector('[data-field="locationName"]')?.value || '';
    cardData.locationType = document.querySelector('[data-field="locationType"]')?.value || '';
    cardData.region = document.querySelector('[data-field="region"]')?.value || '';
    cardData.mapReference = document.querySelector('[data-field="mapReference"]')?.value || '';
    cardData.description = document.querySelector('[data-field="description"]')?.value || '';
    // Timeline & History
    cardData.yearLocationDeveloped = document.querySelector('[data-field="yearLocationDeveloped"]')?.value || '';
    cardData.developmentDescription = document.querySelector('[data-field="developmentDescription"]')?.value || '';
    cardData.environmentalChangesDate = document.querySelector('[data-field="environmentalChangesDate"]')?.value || '';
    cardData.environmentalChangesDescription = document.querySelector('[data-field="environmentalChangesDescription"]')?.value || '';
    cardData.keyEventsDate = document.querySelector('[data-field="keyEventsDate"]')?.value || '';
    cardData.keyEventsDescription = document.querySelector('[data-field="keyEventsDescription"]')?.value || '';
    
    // Enhanced Details
    cardData.climate = document.querySelector('[data-field="climate"]')?.value || '';
    cardData.populationSize = document.querySelector('[data-field="populationSize"]')?.value || '';
    cardData.inhabitants = document.querySelector('[data-field="inhabitants"]')?.value || '';
    cardData.moodAtmosphere = document.querySelector('[data-field="moodAtmosphere"]')?.value || '';
    cardData.sensoryDetails = document.querySelector('[data-field="sensoryDetails"]')?.value || '';
    cardData.pointsOfInterest = document.querySelector('[data-field="pointsOfInterest"]')?.value || '';
    cardData.conflicts = document.querySelector('[data-field="conflicts"]')?.value || '';
    
    // Government & Leadership
    cardData.governmentType = document.querySelector('[data-field="governmentType"]')?.value || '';
    cardData.rulerLeader = document.querySelector('[data-field="rulerLeader"]')?.value || '';
    cardData.lawsLegal = document.querySelector('[data-field="lawsLegal"]')?.value || '';
    cardData.politicalTensions = document.querySelector('[data-field="politicalTensions"]')?.value || '';
    
    // Economy & Trade
    cardData.wealthLevel = document.querySelector('[data-field="wealthLevel"]')?.value || '';
    cardData.currency = document.querySelector('[data-field="currency"]')?.value || '';
    cardData.majorIndustries = document.querySelector('[data-field="majorIndustries"]')?.value || '';
    cardData.exports = document.querySelector('[data-field="exports"]')?.value || '';
    cardData.imports = document.querySelector('[data-field="imports"]')?.value || '';
    
    // Infrastructure & Defenses
    cardData.notableBuildings = document.querySelector('[data-field="notableBuildings"]')?.value || '';
    cardData.defenses = document.querySelector('[data-field="defenses"]')?.value || '';
    cardData.transportation = document.querySelector('[data-field="transportation"]')?.value || '';
    cardData.infrastructure = document.querySelector('[data-field="infrastructure"]')?.value || '';
    
    // Threats & Dangers
    cardData.crimeLevel = document.querySelector('[data-field="crimeLevel"]')?.value || '';
    cardData.naturalHazards = document.querySelector('[data-field="naturalHazards"]')?.value || '';
    cardData.monsterThreats = document.querySelector('[data-field="monsterThreats"]')?.value || '';
    cardData.otherDangers = document.querySelector('[data-field="otherDangers"]')?.value || '';
    
    // Tags (add this to every card type section)
    cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Connected Characters
    cardData.connectedCharacters = [];
    const connectedField = document.querySelector('[data-field="connectedCharacters"]');
    if (connectedField) {
      connectedField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.connectedCharacters.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    // Connected Organizations
cardData.connectedOrganizations = [];
const orgsField = document.querySelector('[data-field="connectedOrganizations"]');
if (orgsField) {
  orgsField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
    const typeSpan = cardTag.querySelector('span');
    const cardType = typeSpan ? typeSpan.textContent.trim() : '';
    const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
    
    if (cardType && cardName) {
      cardData.connectedOrganizations.push({
        type: cardType,
        name: cardName
      });
    }
  });
}

// Connected Cultures
cardData.connectedCultures = [];
const culturesField = document.querySelector('[data-field="connectedCultures"]');
if (culturesField) {
  culturesField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
    const typeSpan = cardTag.querySelector('span');
    const cardType = typeSpan ? typeSpan.textContent.trim() : '';
    const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
    
    if (cardType && cardName) {
      cardData.connectedCultures.push({
        type: cardType,
        name: cardName
      });
    }
  });
}

// Connected Events
cardData.connectedEvents = [];
const eventsField = document.querySelector('[data-field="connectedEvents"]');
if (eventsField) {
  eventsField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
    const typeSpan = cardTag.querySelector('span');
    const cardType = typeSpan ? typeSpan.textContent.trim() : '';
    const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
    
    if (cardType && cardName) {
      cardData.connectedEvents.push({
        type: cardType,
        name: cardName
      });
    }
  });
}
    // History & Events
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
    } else if (cardType === 'Organizations') {
    // Basic Information
    cardData.organizationType = document.querySelector('[data-field="organizationType"]')?.value || '';
    cardData.organizationSize = document.querySelector('[data-field="organizationSize"]')?.value || '';
    cardData.founded = document.querySelector('[data-field="founded"]')?.value || '';
    cardData.status = document.querySelector('[data-field="status"]')?.value || '';
    cardData.headquarters = document.querySelector('[data-field="headquarters"]')?.value || '';
    
    // Leadership & Structure
    cardData.leader = document.querySelector('[data-field="leader"]')?.value || '';
    cardData.leadershipType = document.querySelector('[data-field="leadershipType"]')?.value || '';
    cardData.organizationalStructure = document.querySelector('[data-field="organizationalStructure"]')?.value || '';
    
    // Purpose & Activities
    cardData.primaryGoals = document.querySelector('[data-field="primaryGoals"]')?.value || '';
    cardData.methodsActivities = document.querySelector('[data-field="methodsActivities"]')?.value || '';
    cardData.resources = document.querySelector('[data-field="resources"]')?.value || '';
    cardData.territory = document.querySelector('[data-field="territory"]')?.value || '';
    
    // Relationships & Politics
    cardData.reputation = document.querySelector('[data-field="reputation"]')?.value || '';
    cardData.publicSecret = document.querySelector('[data-field="publicSecret"]')?.value || '';
    
    // Key Members
    cardData.keyMembers = [];
    const keyMembersField = document.querySelector('[data-field="keyMembers"]');
    if (keyMembersField) {
      keyMembersField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.keyMembers.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    // Allies
    cardData.allies = [];
    const alliesField = document.querySelector('[data-field="allies"]');
    if (alliesField) {
      alliesField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.allies.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    // Enemies
    cardData.enemies = [];
    const enemiesField = document.querySelector('[data-field="enemies"]');
    if (enemiesField) {
      enemiesField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.enemies.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    // Timeline & History
    cardData.creationDate = document.querySelector('[data-field="creationDate"]')?.value || '';
    cardData.foundingDescription = document.querySelector('[data-field="foundingDescription"]')?.value || '';
    cardData.structuralChangesDate = document.querySelector('[data-field="structuralChangesDate"]')?.value || '';
    cardData.structuralChangesDescription = document.querySelector('[data-field="structuralChangesDescription"]')?.value || '';
    cardData.majorEventsDate = document.querySelector('[data-field="majorEventsDate"]')?.value || '';
    cardData.majorEventsDescription = document.querySelector('[data-field="majorEventsDescription"]')?.value || '';

    // Tags (added to every card type section)
    cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Additional Details
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
    } else if (cardType === 'Events') {
    // Basic Information
    cardData.eventType = document.querySelector('[data-field="eventType"]')?.value || '';
    cardData.scale = document.querySelector('[data-field="scale"]')?.value || '';
    cardData.eventDate = document.querySelector('[data-field="eventDate"]')?.value || '';
    cardData.duration = document.querySelector('[data-field="duration"]')?.value || '';
    cardData.eventLocation = document.querySelector('[data-field="eventLocation"]')?.value || '';
    
    // Participants & Involved Parties
    cardData.primaryInstigator = document.querySelector('[data-field="primaryInstigator"]')?.value || '';
    cardData.otherParticipants = document.querySelector('[data-field="otherParticipants"]')?.value || '';
    
    // Causes & Background
    cardData.rootCauses = document.querySelector('[data-field="rootCauses"]')?.value || '';
    cardData.immediateTrigger = document.querySelector('[data-field="immediateTrigger"]')?.value || '';
    cardData.previousEvents = document.querySelector('[data-field="previousEvents"]')?.value || '';
    
    // Consequences & Aftermath
    cardData.immediateConsequences = document.querySelector('[data-field="immediateConsequences"]')?.value || '';
    cardData.longTermEffects = document.querySelector('[data-field="longTermEffects"]')?.value || '';
    cardData.winners = document.querySelector('[data-field="winners"]')?.value || '';
    cardData.losers = document.querySelector('[data-field="losers"]')?.value || '';
    
    // Key Characters
    cardData.keyCharacters = [];
    const keyCharField = document.querySelector('[data-field="keyCharacters"]');
    if (keyCharField) {
      keyCharField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.keyCharacters.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    // Organizations Involved
    cardData.organizationsInvolved = [];
    const orgsField = document.querySelector('[data-field="organizationsInvolved"]');
    if (orgsField) {
      orgsField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.organizationsInvolved.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    // Linked Locations
cardData.linkedLocations = [];
const locationsField = document.querySelector('[data-field="linkedLocations"]');
if (locationsField) {
  locationsField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
    const typeSpan = cardTag.querySelector('span');
    const cardType = typeSpan ? typeSpan.textContent.trim() : '';
    const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
    
    if (cardType && cardName) {
      cardData.linkedLocations.push({
        type: cardType,
        name: cardName
      });
    }
  });
}
    // Tags (added to every card type section)
cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Event Description
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';

    } else if (cardType === 'Objects & Items') {
    // Basic Information
    cardData.itemType = document.querySelector('[data-field="itemType"]')?.value || '';
    cardData.rarity = document.querySelector('[data-field="rarity"]')?.value || '';
    cardData.sizeWeight = document.querySelector('[data-field="sizeWeight"]')?.value || '';
    cardData.material = document.querySelector('[data-field="material"]')?.value || '';
    cardData.physicalDescription = document.querySelector('[data-field="physicalDescription"]')?.value || '';
    
    // Function & Powers
    cardData.primaryFunction = document.querySelector('[data-field="primaryFunction"]')?.value || '';
    cardData.specialPowers = document.querySelector('[data-field="specialPowers"]')?.value || '';
    cardData.activationMethod = document.querySelector('[data-field="activationMethod"]')?.value || '';
    cardData.limitations = document.querySelector('[data-field="limitations"]')?.value || '';
    
    // Ownership & Location
    cardData.currentLocation = document.querySelector('[data-field="currentLocation"]')?.value || '';
    cardData.previousOwners = document.querySelector('[data-field="previousOwners"]')?.value || '';
    cardData.howAcquired = document.querySelector('[data-field="howAcquired"]')?.value || '';
    
    // History & Significance
    cardData.origin = document.querySelector('[data-field="origin"]')?.value || '';
    cardData.historicalSignificance = document.querySelector('[data-field="historicalSignificance"]')?.value || '';
    cardData.culturalMeaning = document.querySelector('[data-field="culturalMeaning"]')?.value || '';
    cardData.condition = document.querySelector('[data-field="condition"]')?.value || '';
    
    // Current Owner (linked card)
    cardData.currentOwner = [];
    const ownerField = document.querySelector('[data-field="currentOwner"]');
    if (ownerField) {
      ownerField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.currentOwner.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    // Current Owner - Organization (linked card)
cardData.currentOwnerOrg = [];
const ownerOrgField = document.querySelector('[data-field="currentOwnerOrg"]');
if (ownerOrgField) {
  ownerOrgField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
    const typeSpan = cardTag.querySelector('span');
    const cardType = typeSpan ? typeSpan.textContent.trim() : '';
    const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
    
    if (cardType && cardName) {
      cardData.currentOwnerOrg.push({
        type: cardType,
        name: cardName
      });
    }
  });
}

// Current Location - Linked (linked card)
cardData.currentLocationLinked = [];
const locationLinkedField = document.querySelector('[data-field="currentLocationLinked"]');
if (locationLinkedField) {
  locationLinkedField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
    const typeSpan = cardTag.querySelector('span');
    const cardType = typeSpan ? typeSpan.textContent.trim() : '';
    const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
    
    if (cardType && cardName) {
      cardData.currentLocationLinked.push({
        type: cardType,
        name: cardName
      });
    }
  });
}
// Timeline & History
    cardData.creationDate = document.querySelector('[data-field="creationDate"]')?.value || '';
    cardData.creationDescription = document.querySelector('[data-field="creationDescription"]')?.value || '';
    cardData.changedAffectedDate = document.querySelector('[data-field="changedAffectedDate"]')?.value || '';
    cardData.changedAffectedDescription = document.querySelector('[data-field="changedAffectedDescription"]')?.value || '';

// Tags (added to every card type section)
cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Additional Details
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
} else if (cardType === 'Cultures & Peoples') {
    // Basic Information
    cardData.cultureType = document.querySelector('[data-field="cultureType"]')?.value || '';
    cardData.populationSize = document.querySelector('[data-field="populationSize"]')?.value || '';
    cardData.primaryLocation = document.querySelector('[data-field="primaryLocation"]')?.value || '';
    cardData.lifespan = document.querySelector('[data-field="lifespan"]')?.value || '';
    cardData.generalDescription = document.querySelector('[data-field="generalDescription"]')?.value || '';
    
    // Physical Characteristics
    cardData.averageHeight = document.querySelector('[data-field="averageHeight"]')?.value || '';
    cardData.distinctiveFeatures = document.querySelector('[data-field="distinctiveFeatures"]')?.value || '';
    cardData.physicalAppearance = document.querySelector('[data-field="physicalAppearance"]')?.value || '';
    cardData.specialAbilities = document.querySelector('[data-field="specialAbilities"]')?.value || '';
    
    // Culture & Society
    cardData.socialStructure = document.querySelector('[data-field="socialStructure"]')?.value || '';
    cardData.technologyLevel = document.querySelector('[data-field="technologyLevel"]')?.value || '';
    cardData.coreValues = document.querySelector('[data-field="coreValues"]')?.value || '';
    cardData.customsTraditions = document.querySelector('[data-field="customsTraditions"]')?.value || '';
    cardData.primaryLanguage = document.querySelector('[data-field="primaryLanguage"]')?.value || '';
    cardData.writingSystem = document.querySelector('[data-field="writingSystem"]')?.value || '';
    
    // Relationships & Politics
    cardData.attitudeToOutsiders = document.querySelector('[data-field="attitudeToOutsiders"]')?.value || '';
    cardData.currentStatus = document.querySelector('[data-field="currentStatus"]')?.value || '';
    
    // Allied Cultures (linked cards)
    cardData.alliedCultures = [];
    const alliedField = document.querySelector('[data-field="alliedCultures"]');
    if (alliedField) {
      alliedField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.alliedCultures.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    // Enemy Cultures (linked cards)
    cardData.enemyCultures = [];
    const enemyField = document.querySelector('[data-field="enemyCultures"]');
    if (enemyField) {
      enemyField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.enemyCultures.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    
    // Notable Members (linked cards)
    cardData.notableMembers = [];
    const membersField = document.querySelector('[data-field="notableMembers"]');
    if (membersField) {
      membersField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.notableMembers.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
// Timeline & History
    cardData.creationOriginDate = document.querySelector('[data-field="creationOriginDate"]')?.value || '';
    cardData.originDescription = document.querySelector('[data-field="originDescription"]')?.value || '';
    cardData.culturalEventsDate = document.querySelector('[data-field="culturalEventsDate"]')?.value || '';
    cardData.culturalEventsDescription = document.querySelector('[data-field="culturalEventsDescription"]')?.value || '';
    cardData.changesDate = document.querySelector('[data-field="changesDate"]')?.value || '';
    cardData.changesDescription = document.querySelector('[data-field="changesDescription"]')?.value || '';

// Tags (added to every card type section)
cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Additional Details
    cardData.content = document.querySelector('[data-field="content"]')?.value || ''; 
} else if (cardType === 'Systems & Powers') {
    // Basic Information
    cardData.systemType = document.querySelector('[data-field="systemType"]')?.value || '';
    cardData.scope = document.querySelector('[data-field="scope"]')?.value || '';
    cardData.origin = document.querySelector('[data-field="origin"]')?.value || '';
    cardData.discoveryDate = document.querySelector('[data-field="discoveryDate"]')?.value || '';
    cardData.generalDescription = document.querySelector('[data-field="generalDescription"]')?.value || '';
    
    // How It Works
    cardData.basicMechanics = document.querySelector('[data-field="basicMechanics"]')?.value || '';
    cardData.activationRequirements = document.querySelector('[data-field="activationRequirements"]')?.value || '';
    cardData.energySource = document.querySelector('[data-field="energySource"]')?.value || '';
    cardData.manifestation = document.querySelector('[data-field="manifestation"]')?.value || '';
    
    // Rules & Limitations
    cardData.fundamentalRules = document.querySelector('[data-field="fundamentalRules"]')?.value || '';
    cardData.limitations = document.querySelector('[data-field="limitations"]')?.value || '';
    cardData.rangeLimits = document.querySelector('[data-field="rangeLimits"]')?.value || '';
    cardData.durationLimits = document.querySelector('[data-field="durationLimits"]')?.value || '';
    
    // Users & Access
    cardData.whoCanUse = document.querySelector('[data-field="whoCanUse"]')?.value || '';
    cardData.learningDifficulty = document.querySelector('[data-field="learningDifficulty"]')?.value || '';
    cardData.trainingMethods = document.querySelector('[data-field="trainingMethods"]')?.value || '';
    
    // Impact & Consequences
    cardData.societalImpact = document.querySelector('[data-field="societalImpact"]')?.value || '';
    cardData.potentialDangers = document.querySelector('[data-field="potentialDangers"]')?.value || '';
    cardData.currentStatus = document.querySelector('[data-field="currentStatus"]')?.value || '';
    cardData.publicKnowledge = document.querySelector('[data-field="publicKnowledge"]')?.value || '';
    
    // Known Users (linked cards)
    cardData.knownUsers = [];
    const usersField = document.querySelector('[data-field="knownUsers"]');
    if (usersField) {
      usersField.querySelectorAll('.selected-cards > div').forEach(cardTag => {
        const typeSpan = cardTag.querySelector('span');
        const cardType = typeSpan ? typeSpan.textContent.trim() : '';
        const cardName = cardTag.textContent.replace(cardType, '').replace('×', '').trim();
        
        if (cardType && cardName) {
          cardData.knownUsers.push({
            type: cardType,
            name: cardName
          });
        }
      });
    }
    // Timeline & History
    cardData.creationBeginningDate = document.querySelector('[data-field="creationBeginningDate"]')?.value || '';
    cardData.beginningDescription = document.querySelector('[data-field="beginningDescription"]')?.value || '';
    cardData.majorEventsDate = document.querySelector('[data-field="majorEventsDate"]')?.value || '';
    cardData.majorEventsDescription = document.querySelector('[data-field="majorEventsDescription"]')?.value || '';

    // Tags (added to every card type section)
    cardData.tags = document.querySelector('[data-field="tags"]')?.value || '';

    // Additional Details
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
} else {
    // For other card types, just collect content
    cardData.content = document.querySelector('[data-field="content"]')?.value || '';
  }
  
  // Save the card
  if (!indexCardsData.cards[cardType]) {
  indexCardsData.cards[cardType] = {};
}
indexCardsData.cards[cardType][cardName] = cardData;
  
  // Show the card immediately
  showCardsOfType(cardType);
  loadIndexCard(cardType, cardName);
  saveIndexCardsData();
  
  document.body.removeChild(overlay);
}

function showCardsOfType(cardType) {
  indexCardsData.currentType = cardType;
  
  // Update the type display
  document.getElementById('currentCardType').textContent = `${cardType} Cards`;
  
  // Clear and populate the cards list
  const cardsList = document.getElementById('cardsInType');
  cardsList.innerHTML = '';
  
  const cardsInType = indexCardsData.cards[cardType];
  
  if (Object.keys(cardsInType).length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.style.cssText = 'padding: 10px; color: #666; font-style: italic; text-align: center;';
    emptyItem.textContent = 'No cards yet. Create one above!';
    cardsList.appendChild(emptyItem);
  } else {
    Object.keys(cardsInType).forEach(cardName => {
      const cardItem = document.createElement('li');
      cardItem.className = 'card-item';
      cardItem.textContent = cardName;
      
      // Click to load card
      cardItem.addEventListener('click', () => loadIndexCard(cardType, cardName));
      
      // Right click for delete
      cardItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showCardContextMenu(e, cardType, cardName);
      });
      
      cardsList.appendChild(cardItem);
    });
  }
}

function loadIndexCard(cardType, cardName) {
  indexCardsData.currentType = cardType;
  indexCardsData.currentCardName = cardName;
  
  const card = indexCardsData.cards[cardType][cardName];
  
  // Update UI
  document.getElementById('currentCardTitle').textContent = `${cardType} / ${cardName}`;
  const viewer = document.getElementById('currentCardContent');

  if (cardType === 'Character') {
    // Display character card with all fields
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Section 1: Basic Information -->
          <div class="card-section">
            <h4>👤 Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Name:</label>
                <span class="editable-field" data-field="name">${card.name || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Date of Birth:</label>
                <span class="editable-field" data-field="dateOfBirth">${card.dateOfBirth || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Age:</label>
                <span class="editable-field" data-field="age">${card.age || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Death Date:</label>
                <span class="editable-field" data-field="deathDate">${card.deathDate || 'N/A'}</span>
              </div>
              <div class="field-item">
                <label>Significant Event Date:</label>
                <span class="editable-field" data-field="significantEventDate">${card.significantEventDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Happened:</label>
                <span class="editable-field" data-field="significantEventDescription">${card.significantEventDescription || 'No details'}</span>
              </div>
            </div>
          </div>
          
          <!-- Section 2: Details -->
<!-- Section 2: Enhanced Details -->
          <div class="card-section">
            <h4>🎭 Enhanced Details</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Appearance:</label>
              <div class="card-content" contenteditable="true" data-field="appearance">${card.appearance || 'Click here to add appearance description...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Height/Weight:</label>
                <span class="editable-field" data-field="heightWeight">${card.heightWeight || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Voice & Speech:</label>
                <span class="editable-field" data-field="voiceSpeech">${card.voiceSpeech || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin: 10px 0;">
              <label>Distinctive Features:</label>
              <div class="card-content" contenteditable="true" data-field="distinctiveFeatures">${card.distinctiveFeatures || 'Click here to add distinctive features...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Species:</label>
                <span class="editable-field" data-field="species">${card.species || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Language:</label>
                <span class="editable-field" data-field="language">${card.language || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Skills:</label>
                <span class="editable-field" data-field="skills">${card.skills || 'None listed'}</span>
              </div>
              <div class="field-item">
                <label>Secrets:</label>
                <span class="editable-field" data-field="secrets">${card.secrets || 'None known'}</span>
              </div>
              <div class="field-item">
                <label>Goals:</label>
                <span class="editable-field" data-field="goals">${card.goals || 'None specified'}</span>
              </div>
              <div class="field-item">
                <label>Mythical:</label>
                <span class="editable-field" data-field="mythical">${card.mythical || 'None'}</span>
              </div>
            </div>
          </div>
          
          <!-- Section 3: Psychology & Personality -->
          <div class="card-section">
            <h4>🧠 Psychology & Personality</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Core Personality Traits:</label>
              <div class="card-content" contenteditable="true" data-field="personalityTraits">${card.personalityTraits || 'Click here to add personality traits...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Fears & Phobias:</label>
                <div class="card-content" contenteditable="true" data-field="fearsPhobias">${card.fearsPhobias || 'Click here to add fears...'}</div>
              </div>
              <div class="field-item">
                <label>Core Motivations:</label>
                <div class="card-content" contenteditable="true" data-field="coreMotivations">${card.coreMotivations || 'Click here to add motivations...'}</div>
              </div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Moral Alignment:</label>
                <span class="editable-field" data-field="moralAlignment">${card.moralAlignment || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Quirks & Mannerisms:</label>
                <span class="editable-field" data-field="quirksMannerisms">${card.quirksMannerisms || 'None noted'}</span>
              </div>
            </div>
          </div>
          
          <!-- Section 4: Background & Social World -->
          <div class="card-section">
            <h4>🌍 Background & Social World</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Education Level:</label>
                <span class="editable-field" data-field="educationLevel">${card.educationLevel || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Occupation:</label>
                <span class="editable-field" data-field="occupation">${card.occupation || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Wealth Level:</label>
                <span class="editable-field" data-field="wealthLevel">${card.wealthLevel || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Social Status:</label>
                <span class="editable-field" data-field="socialStatus">${card.socialStatus || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin: 15px 0;">
              <label>Allies & Friends:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.alliesFriends || [])}
              </div>
            </div>
            <div class="field-item" style="margin: 15px 0;">
              <label>Enemies & Rivals:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.enemiesRivals || [])}
              </div>
            </div>
            <div class="field-item" style="margin: 15px 0;">
              <label>Major Life Events:</label>
              <div class="card-content" contenteditable="true" data-field="majorLifeEvents">${card.majorLifeEvents || 'Click here to add major life events...'}</div>
            </div>
            <div class="field-item" style="margin: 15px 0;">
              <label>Reputation:</label>
              <div class="card-content" contenteditable="true" data-field="reputation">${card.reputation || 'Click here to add reputation details...'}</div>
            </div>
          </div>
          
          <!-- Section 3: Relationships -->
          <div class="card-section">
            <h4>👥 Relationships</h4>
            <div class="relationships-grid">
              ${generateRelationshipDisplay('Mother', card.relationships?.mother || [])}
              ${generateRelationshipDisplay('Father', card.relationships?.father || [])}
              ${generateRelationshipDisplay('Spouse', card.relationships?.spouse || [])}
              ${generateRelationshipDisplay('Love Interest', card.relationships?.loveInterest || [])}
              ${generateRelationshipDisplay('Siblings', card.relationships?.siblings || [])}
              ${generateRelationshipDisplay('Children', card.relationships?.children || [])}
            </div>
          </div>
          
          <!-- Section 4: Back Story -->
          <div class="card-section">
            <h4>📖 Back Story</h4>
            <div class="card-content" contenteditable="true" data-field="backStory">${card.backStory || 'Click here to add character backstory...'}</div>
          </div>
          
          <!-- Tags Display -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>

          <!-- Section 5: Other -->
          <div class="card-section">
            <h4>📝 Other Notes</h4>
            <div class="card-content" contenteditable="true">${card.content || 'Click here to add additional notes...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
 } else if (cardType === 'Story Development') {
    // Display story development card with all fields
   viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Story Elements -->
          <div class="card-section">
            <h4>📚 Basic Story Elements</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Plot Point Type:</label>
                <span class="editable-field" data-field="plotPointType">${card.plotPointType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Story Year/Setting:</label>
                <span class="editable-field" data-field="storyYearSetting">${card.storyYearSetting || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Event/Conflict Date:</label>
                <span class="editable-field" data-field="eventConflictDate">${card.eventConflictDate || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>What Happens:</label>
                <span class="editable-field" data-field="eventConflictDescription">${card.eventConflictDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Chapter/Scene:</label>
                <span class="editable-field" data-field="chapterScene">${card.chapterScene || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Characters Involved:</label>
                <span class="editable-field" data-field="charactersInvolved">${card.charactersInvolved || 'None listed'}</span>
              </div>
              <div class="field-item">
                <label>Conflict Type:</label>
                <span class="editable-field" data-field="conflictType">${card.conflictType || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <!-- Scene Details -->
          <div class="card-section">
            <h4>🎬 Scene Details</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Setting/Location:</label>
                <span class="editable-field" data-field="settingLocation">${card.settingLocation || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>POV Character:</label>
                <span class="editable-field" data-field="povCharacter">${card.povCharacter || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Mood/Atmosphere:</label>
                <span class="editable-field" data-field="moodAtmosphere">${card.moodAtmosphere || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Stakes:</label>
                <span class="editable-field" data-field="stakes">${card.stakes || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <!-- Story Structure & Development -->
          <div class="card-section">
            <h4>📈 Story Structure & Development</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Character Arcs:</label>
              <div class="card-content" contenteditable="true" data-field="characterArcs">${card.characterArcs || 'Click here to add character development...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Foreshadowing & Setup:</label>
              <div class="card-content" contenteditable="true" data-field="foreshadowing">${card.foreshadowing || 'Click here to add foreshadowing...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Subplots:</label>
                <span class="editable-field" data-field="subplots">${card.subplots || 'None specified'}</span>
              </div>
              <div class="field-item">
                <label>Connected Scenes:</label>
                <span class="editable-field" data-field="connectedScenes">${card.connectedScenes || 'None specified'}</span>
              </div>
            </div>
          </div>
          
          <!-- Writing Progress -->
          <div class="card-section">
            <h4>✍️ Writing Progress</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Status:</label>
                <span class="editable-field" data-field="status">${card.status || 'Not set'}</span>
              </div>
              <div class="field-item">
                <label>Word Count Target:</label>
                <span class="editable-field" data-field="wordCountTarget">${card.wordCountTarget || 'Not set'}</span>
              </div>
              <div class="field-item">
                <label>Actual Word Count:</label>
                <span class="editable-field" data-field="actualWordCount">${card.actualWordCount || '0'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Revision Notes:</label>
              <div class="card-content" contenteditable="true" data-field="revisionNotes">${card.revisionNotes || 'Click here to add revision notes...'}</div>
            </div>
          </div>
          <!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>
          <!-- Story Notes -->
          <div class="card-section">
            <h4>📝 Story Notes</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add story notes...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
    } else if (cardType === 'Location') {
    // Display location card with all fields
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Information -->
          <div class="card-section">
            <h4>🌍 Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Name:</label>
                <span class="editable-field" data-field="locationName">${card.locationName || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Type:</label>
                <span class="editable-field" data-field="locationType">${card.locationType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Region/Country/World:</label>
                <span class="editable-field" data-field="region">${card.region || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Map Reference:</label>
                <span class="editable-field" data-field="mapReference">${card.mapReference || 'None'}</span>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div class="card-section">
            <h4>📝 Description</h4>
            <div class="card-content" contenteditable="true" data-field="description">${card.description || 'Click here to add location description...'}</div>
          </div>
      <!-- Timeline & History -->
          <div class="card-section">
            <h4>📅 Timeline & History</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Year Location Developed:</label>
                <span class="editable-field" data-field="yearLocationDeveloped">${card.yearLocationDeveloped || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>What Happened:</label>
                <span class="editable-field" data-field="developmentDescription">${card.developmentDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Environmental Changes Date:</label>
                <span class="editable-field" data-field="environmentalChangesDate">${card.environmentalChangesDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Changed:</label>
                <span class="editable-field" data-field="environmentalChangesDescription">${card.environmentalChangesDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Key Events Date:</label>
                <span class="editable-field" data-field="keyEventsDate">${card.keyEventsDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Event:</label>
                <span class="editable-field" data-field="keyEventsDescription">${card.keyEventsDescription || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Enhanced Details -->
          <div class="card-section">
            <h4>🏛️ Details</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Climate:</label>
                <span class="editable-field" data-field="climate">${card.climate || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Population Size:</label>
                <span class="editable-field" data-field="populationSize">${card.populationSize || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Culture/Inhabitants:</label>
                <span class="editable-field" data-field="inhabitants">${card.inhabitants || 'None listed'}</span>
              </div>
              <div class="field-item">
                <label>Mood/Atmosphere:</label>
                <span class="editable-field" data-field="moodAtmosphere">${card.moodAtmosphere || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Sensory Details:</label>
              <div class="card-content" contenteditable="true" data-field="sensoryDetails">${card.sensoryDetails || 'Click here to add sensory details...'}</div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Points of Interest:</label>
              <div class="card-content" contenteditable="true" data-field="pointsOfInterest">${card.pointsOfInterest || 'Click here to add points of interest...'}</div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Conflicts/Factions:</label>
              <div class="card-content" contenteditable="true" data-field="conflicts">${card.conflicts || 'Click here to add conflicts and factions...'}</div>
            </div>
          </div>
          
          <!-- Government & Leadership -->
          <div class="card-section">
            <h4>🏛️ Government & Leadership</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Government Type:</label>
                <span class="editable-field" data-field="governmentType">${card.governmentType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Ruler/Leader:</label>
                <span class="editable-field" data-field="rulerLeader">${card.rulerLeader || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Laws & Legal System:</label>
              <div class="card-content" contenteditable="true" data-field="lawsLegal">${card.lawsLegal || 'Click here to add laws and legal system...'}</div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Political Tensions:</label>
              <div class="card-content" contenteditable="true" data-field="politicalTensions">${card.politicalTensions || 'Click here to add political tensions...'}</div>
            </div>
          </div>
          
          <!-- Economy & Trade -->
          <div class="card-section">
            <h4>💰 Economy & Trade</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Wealth Level:</label>
                <span class="editable-field" data-field="wealthLevel">${card.wealthLevel || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Currency Used:</label>
                <span class="editable-field" data-field="currency">${card.currency || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Major Industries & Resources:</label>
              <div class="card-content" contenteditable="true" data-field="majorIndustries">${card.majorIndustries || 'Click here to add industries and resources...'}</div>
            </div>
            <div class="field-grid" style="margin-top: 10px;">
              <div class="field-item">
                <label>Exports:</label>
                <div class="card-content" contenteditable="true" data-field="exports">${card.exports || 'Click here to add exports...'}</div>
              </div>
              <div class="field-item">
                <label>Imports:</label>
                <div class="card-content" contenteditable="true" data-field="imports">${card.imports || 'Click here to add imports...'}</div>
              </div>
            </div>
          </div>
          
          <!-- Infrastructure & Defenses -->
          <div class="card-section">
            <h4>🛡️ Infrastructure & Defenses</h4>
            <div class="field-item" style="margin-bottom: 10px;">
              <label>Notable Buildings & Landmarks:</label>
              <div class="card-content" contenteditable="true" data-field="notableBuildings">${card.notableBuildings || 'Click here to add notable buildings...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Defenses & Military:</label>
                <div class="card-content" contenteditable="true" data-field="defenses">${card.defenses || 'Click here to add defenses...'}</div>
              </div>
              <div class="field-item">
                <label>Transportation:</label>
                <div class="card-content" contenteditable="true" data-field="transportation">${card.transportation || 'Click here to add transportation...'}</div>
              </div>
            </div>
            <div class="field-item" style="margin-top: 10px;">
              <label>Infrastructure & Services:</label>
              <div class="card-content" contenteditable="true" data-field="infrastructure">${card.infrastructure || 'Click here to add infrastructure...'}</div>
            </div>
          </div>
          
          <!-- Threats & Dangers -->
          <div class="card-section">
            <h4>⚠️ Threats & Dangers</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Crime & Safety:</label>
                <span class="editable-field" data-field="crimeLevel">${card.crimeLevel || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Natural Hazards:</label>
                <span class="editable-field" data-field="naturalHazards">${card.naturalHazards || 'None known'}</span>
              </div>
            </div>
            <div class="field-grid" style="margin-top: 10px;">
              <div class="field-item">
                <label>Monster/Creature Threats:</label>
                <div class="card-content" contenteditable="true" data-field="monsterThreats">${card.monsterThreats || 'Click here to add creature threats...'}</div>
              </div>
              <div class="field-item">
                <label>Other Dangers:</label>
                <div class="card-content" contenteditable="true" data-field="otherDangers">${card.otherDangers || 'Click here to add other dangers...'}</div>
              </div>
            </div>
          </div>
      
<!-- Connected People & Organizations -->
<div class="card-section">
  <h4>👥 Connected People & Organizations</h4>
  
  <div class="field-item" style="margin-bottom: 15px;">
    <label>Characters who live here or visit:</label>
    <div class="connected-characters-display">
      ${generateConnectedCharactersDisplay(card.connectedCharacters || [])}
    </div>
  </div>
  
  <div class="field-item" style="margin-bottom: 15px;">
    <label>Organizations based here or operating here:</label>
    <div class="connected-characters-display">
      ${generateConnectedCharactersDisplay(card.connectedOrganizations || [])}
    </div>
  </div>
  
  <div class="field-item" style="margin-bottom: 15px;">
    <label>Cultures & Peoples who live here:</label>
    <div class="connected-characters-display">
      ${generateConnectedCharactersDisplay(card.connectedCultures || [])}
    </div>
  </div>
  
  <div class="field-item" style="margin-bottom: 15px;">
    <label>Important Events that happened here:</label>
    <div class="connected-characters-display">
      ${generateConnectedCharactersDisplay(card.connectedEvents || [])}
    </div>
  </div>
</div>
      
<!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>

          <!-- History & Events -->
          <div class="card-section">
            <h4>📖 History & Important Events</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add historical events and additional notes...'}</div>
          </div>
      
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
} else if (cardType === 'Organizations') {
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Information -->
          <div class="card-section">
            <h4>🏛️ Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Organization Type:</label>
                <span class="editable-field" data-field="organizationType">${card.organizationType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Size:</label>
                <span class="editable-field" data-field="organizationSize">${card.organizationSize || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Founded:</label>
                <span class="editable-field" data-field="founded">${card.founded || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Status:</label>
                <span class="editable-field" data-field="status">${card.status || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Headquarters:</label>
                <span class="editable-field" data-field="headquarters">${card.headquarters || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <!-- Leadership & Structure -->
          <div class="card-section">
            <h4>👑 Leadership & Structure</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Leader/Head:</label>
                <span class="editable-field" data-field="leader">${card.leader || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Leadership Type:</label>
                <span class="editable-field" data-field="leadershipType">${card.leadershipType || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Organizational Structure:</label>
              <div class="card-content" contenteditable="true" data-field="organizationalStructure">${card.organizationalStructure || 'Click here to add organizational structure...'}</div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Key Members:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.keyMembers || [])}
              </div>
            </div>
          </div>
          
          <!-- Purpose & Activities -->
          <div class="card-section">
            <h4>🎯 Purpose & Activities</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Primary Goals:</label>
              <div class="card-content" contenteditable="true" data-field="primaryGoals">${card.primaryGoals || 'Click here to add primary goals...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Methods & Activities:</label>
              <div class="card-content" contenteditable="true" data-field="methodsActivities">${card.methodsActivities || 'Click here to add methods and activities...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Resources:</label>
                <div class="card-content" contenteditable="true" data-field="resources">${card.resources || 'Click here to add resources...'}</div>
              </div>
              <div class="field-item">
                <label>Territory/Influence:</label>
                <div class="card-content" contenteditable="true" data-field="territory">${card.territory || 'Click here to add territory...'}</div>
              </div>
            </div>
          </div>
          
          <!-- Relationships & Politics -->
          <div class="card-section">
            <h4>🤝 Relationships & Politics</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Allies:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.allies || [])}
              </div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Enemies:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.enemies || [])}
              </div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Reputation:</label>
                <div class="card-content" contenteditable="true" data-field="reputation">${card.reputation || 'Click here to add reputation...'}</div>
              </div>
              <div class="field-item">
                <label>Public vs Secret:</label>
                <span class="editable-field" data-field="publicSecret">${card.publicSecret || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Timeline & History -->
          <div class="card-section">
            <h4>📅 Timeline & History</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Creation Date:</label>
                <span class="editable-field" data-field="creationDate">${card.creationDate || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>How it was Founded:</label>
                <span class="editable-field" data-field="foundingDescription">${card.foundingDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Structural Changes Date:</label>
                <span class="editable-field" data-field="structuralChangesDate">${card.structuralChangesDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Changed:</label>
                <span class="editable-field" data-field="structuralChangesDescription">${card.structuralChangesDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Major Events Date:</label>
                <span class="editable-field" data-field="majorEventsDate">${card.majorEventsDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Event:</label>
                <span class="editable-field" data-field="majorEventsDescription">${card.majorEventsDescription || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>
          <!-- Additional Details -->
          <div class="card-section">
            <h4>📝 Additional Details</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add history, culture, traditions, and additional information...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
    } else if (cardType === 'Events') {
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Information -->
          <div class="card-section">
            <h4>📜 Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Event Type:</label>
                <span class="editable-field" data-field="eventType">${card.eventType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Scale/Impact:</label>
                <span class="editable-field" data-field="scale">${card.scale || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Date/Time:</label>
                <span class="editable-field" data-field="eventDate">${card.eventDate || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Duration:</label>
                <span class="editable-field" data-field="duration">${card.duration || 'Not specified'}</span>
              </div>
<div class="field-item">
  <label>Location(s) - Text:</label>
  <span class="editable-field" data-field="eventLocation">${card.eventLocation || 'Not specified'}</span>
</div>
<div class="field-item">
  <label>Linked Locations:</label>
  <div class="connected-characters-display">
    ${generateConnectedCharactersDisplay(card.linkedLocations || [])}
  </div>
</div>
            </div>
          </div>
          
          <!-- Participants & Involved Parties -->
          <div class="card-section">
            <h4>👥 Participants & Involved Parties</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Key Characters:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.keyCharacters || [])}
              </div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Organizations Involved:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.organizationsInvolved || [])}
              </div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Primary Instigator:</label>
                <span class="editable-field" data-field="primaryInstigator">${card.primaryInstigator || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Other Participants:</label>
                <span class="editable-field" data-field="otherParticipants">${card.otherParticipants || 'None listed'}</span>
              </div>
            </div>
          </div>
          
          <!-- Causes & Background -->
          <div class="card-section">
            <h4>🔍 Causes & Background</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Root Causes:</label>
              <div class="card-content" contenteditable="true" data-field="rootCauses">${card.rootCauses || 'Click here to add root causes...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Immediate Trigger:</label>
              <div class="card-content" contenteditable="true" data-field="immediateTrigger">${card.immediateTrigger || 'Click here to add immediate trigger...'}</div>
            </div>
            <div class="field-item">
              <label>Previous Related Events:</label>
              <span class="editable-field" data-field="previousEvents">${card.previousEvents || 'None specified'}</span>
            </div>
          </div>
          
          <!-- Consequences & Aftermath -->
          <div class="card-section">
            <h4>⚡ Consequences & Aftermath</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Immediate Consequences:</label>
              <div class="card-content" contenteditable="true" data-field="immediateConsequences">${card.immediateConsequences || 'Click here to add immediate consequences...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Long-term Effects:</label>
              <div class="card-content" contenteditable="true" data-field="longTermEffects">${card.longTermEffects || 'Click here to add long-term effects...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Winners/Beneficiaries:</label>
                <div class="card-content" contenteditable="true" data-field="winners">${card.winners || 'Click here to add winners...'}</div>
              </div>
              <div class="field-item">
                <label>Losers/Victims:</label>
                <div class="card-content" contenteditable="true" data-field="losers">${card.losers || 'Click here to add losers...'}</div>
              </div>
            </div>
          </div>
          <!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>
          <!-- Event Description -->
          <div class="card-section">
            <h4>📝 Event Description</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add detailed event description...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
    } else if (cardType === 'Objects & Items') {
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Information -->
          <div class="card-section">
            <h4>📦 Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Item Type:</label>
                <span class="editable-field" data-field="itemType">${card.itemType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Rarity/Value:</label>
                <span class="editable-field" data-field="rarity">${card.rarity || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Size/Weight:</label>
                <span class="editable-field" data-field="sizeWeight">${card.sizeWeight || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Material/Construction:</label>
                <span class="editable-field" data-field="material">${card.material || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Physical Description:</label>
              <div class="card-content" contenteditable="true" data-field="physicalDescription">${card.physicalDescription || 'Click here to add physical description...'}</div>
            </div>
          </div>
          
          <!-- Function & Powers -->
          <div class="card-section">
            <h4>⚡ Function & Powers</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Primary Function/Purpose:</label>
              <div class="card-content" contenteditable="true" data-field="primaryFunction">${card.primaryFunction || 'Click here to add primary function...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Special Powers/Abilities:</label>
              <div class="card-content" contenteditable="true" data-field="specialPowers">${card.specialPowers || 'Click here to add special powers...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Activation Method:</label>
                <span class="editable-field" data-field="activationMethod">${card.activationMethod || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Limitations/Drawbacks:</label>
                <span class="editable-field" data-field="limitations">${card.limitations || 'None known'}</span>
              </div>
            </div>
          </div>
          
          <!-- Ownership & Location -->
<div class="card-section">
  <h4>👤 Ownership & Location</h4>
  
  <div class="field-item" style="margin-bottom: 15px;">
    <label>Current Owner - Character:</label>
    <div class="connected-characters-display">
      ${generateConnectedCharactersDisplay(card.currentOwner || [])}
    </div>
  </div>
  
  <div class="field-item" style="margin-bottom: 15px;">
    <label>Current Owner - Organization:</label>
    <div class="connected-characters-display">
      ${generateConnectedCharactersDisplay(card.currentOwnerOrg || [])}
    </div>
  </div>
  
  <div class="field-grid">
    <div class="field-item">
      <label>Current Location - Text:</label>
      <span class="editable-field" data-field="currentLocation">${card.currentLocation || 'Unknown'}</span>
    </div>
    <div class="field-item">
      <label>Current Location - Linked:</label>
      <div class="connected-characters-display">
        ${generateConnectedCharactersDisplay(card.currentLocationLinked || [])}
      </div>
    </div>
    <div class="field-item">
      <label>Previous Owners:</label>
      <span class="editable-field" data-field="previousOwners">${card.previousOwners || 'Unknown'}</span>
    </div>
    <div class="field-item">
      <label>How Acquired:</label>
      <span class="editable-field" data-field="howAcquired">${card.howAcquired || 'Unknown'}</span>
    </div>
    <div class="field-item">
      <label>Condition:</label>
      <span class="editable-field" data-field="condition">${card.condition || 'Unknown'}</span>
    </div>
  </div>
</div>
          
          <!-- History & Significance -->
          <div class="card-section">
            <h4>📜 History & Significance</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Origin/Creation:</label>
              <div class="card-content" contenteditable="true" data-field="origin">${card.origin || 'Click here to add origin story...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Historical Significance:</label>
              <div class="card-content" contenteditable="true" data-field="historicalSignificance">${card.historicalSignificance || 'Click here to add historical significance...'}</div>
            </div>
            <div class="field-item">
              <label>Cultural/Religious Meaning:</label>
              <span class="editable-field" data-field="culturalMeaning">${card.culturalMeaning || 'None specified'}</span>
            </div>
          </div>
          <!-- Timeline & History -->
          <div class="card-section">
            <h4>📅 Timeline & History</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Creation Date:</label>
                <span class="editable-field" data-field="creationDate">${card.creationDate || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>How it was Created:</label>
                <span class="editable-field" data-field="creationDescription">${card.creationDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Changed/Affected Date:</label>
                <span class="editable-field" data-field="changedAffectedDate">${card.changedAffectedDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Changed:</label>
                <span class="editable-field" data-field="changedAffectedDescription">${card.changedAffectedDescription || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>
          <!-- Additional Details -->
          <div class="card-section">
            <h4>📝 Additional Details</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add additional details...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
} else if (cardType === 'Cultures & Peoples') {
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Information -->
          <div class="card-section">
            <h4>🌍 Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Type:</label>
                <span class="editable-field" data-field="cultureType">${card.cultureType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Population Size:</label>
                <span class="editable-field" data-field="populationSize">${card.populationSize || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Primary Location:</label>
                <span class="editable-field" data-field="primaryLocation">${card.primaryLocation || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Lifespan:</label>
                <span class="editable-field" data-field="lifespan">${card.lifespan || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>General Description:</label>
              <div class="card-content" contenteditable="true" data-field="generalDescription">${card.generalDescription || 'Click here to add general description...'}</div>
            </div>
          </div>
          
          <!-- Physical Characteristics -->
          <div class="card-section">
            <h4>👤 Physical Characteristics</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Average Height/Size:</label>
                <span class="editable-field" data-field="averageHeight">${card.averageHeight || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Distinctive Features:</label>
                <span class="editable-field" data-field="distinctiveFeatures">${card.distinctiveFeatures || 'None noted'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Physical Appearance:</label>
              <div class="card-content" contenteditable="true" data-field="physicalAppearance">${card.physicalAppearance || 'Click here to add physical appearance...'}</div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Special Abilities/Traits:</label>
              <div class="card-content" contenteditable="true" data-field="specialAbilities">${card.specialAbilities || 'Click here to add special abilities...'}</div>
            </div>
          </div>
          
          <!-- Culture & Society -->
          <div class="card-section">
            <h4>🏛️ Culture & Society</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Social Structure:</label>
                <span class="editable-field" data-field="socialStructure">${card.socialStructure || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Technology Level:</label>
                <span class="editable-field" data-field="technologyLevel">${card.technologyLevel || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Primary Language:</label>
                <span class="editable-field" data-field="primaryLanguage">${card.primaryLanguage || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Writing System:</label>
                <span class="editable-field" data-field="writingSystem">${card.writingSystem || 'Unknown'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Core Values & Beliefs:</label>
              <div class="card-content" contenteditable="true" data-field="coreValues">${card.coreValues || 'Click here to add core values...'}</div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Customs & Traditions:</label>
              <div class="card-content" contenteditable="true" data-field="customsTraditions">${card.customsTraditions || 'Click here to add customs and traditions...'}</div>
            </div>
          </div>
          
          <!-- Relationships & Politics -->
          <div class="card-section">
            <h4>🤝 Relationships & Politics</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Allied Cultures/Peoples:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.alliedCultures || [])}
              </div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Enemy Cultures/Peoples:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.enemyCultures || [])}
              </div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Notable Members:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.notableMembers || [])}
              </div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Attitude to Outsiders:</label>
                <span class="editable-field" data-field="attitudeToOutsiders">${card.attitudeToOutsiders || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Current Status:</label>
                <span class="editable-field" data-field="currentStatus">${card.currentStatus || 'Unknown'}</span>
              </div>
            </div>
          </div>
          <!-- Timeline & History -->
          <div class="card-section">
            <h4>📅 Timeline & History</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Creation/Origin Date:</label>
                <span class="editable-field" data-field="creationOriginDate">${card.creationOriginDate || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>How they Originated:</label>
                <span class="editable-field" data-field="originDescription">${card.originDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Cultural Events Date:</label>
                <span class="editable-field" data-field="culturalEventsDate">${card.culturalEventsDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Event:</label>
                <span class="editable-field" data-field="culturalEventsDescription">${card.culturalEventsDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Changes Date:</label>
                <span class="editable-field" data-field="changesDate">${card.changesDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Changed:</label>
                <span class="editable-field" data-field="changesDescription">${card.changesDescription || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>
          <!-- Additional Details -->
          <div class="card-section">
            <h4>📝 Additional Details</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add additional details...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
} else if (cardType === 'Systems & Powers') {
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <!-- Basic Information -->
          <div class="card-section">
            <h4>⚡ Basic Information</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>System Type:</label>
                <span class="editable-field" data-field="systemType">${card.systemType || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Scope/Scale:</label>
                <span class="editable-field" data-field="scope">${card.scope || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Origin/Source:</label>
                <span class="editable-field" data-field="origin">${card.origin || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>Discovery/Creation Date:</label>
                <span class="editable-field" data-field="discoveryDate">${card.discoveryDate || 'Unknown'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>General Description:</label>
              <div class="card-content" contenteditable="true" data-field="generalDescription">${card.generalDescription || 'Click here to add general description...'}</div>
            </div>
          </div>
          
          <!-- How It Works -->
          <div class="card-section">
            <h4>🔬 How It Works</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Basic Mechanics:</label>
              <div class="card-content" contenteditable="true" data-field="basicMechanics">${card.basicMechanics || 'Click here to add basic mechanics...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Activation Requirements:</label>
              <div class="card-content" contenteditable="true" data-field="activationRequirements">${card.activationRequirements || 'Click here to add activation requirements...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Energy/Fuel Source:</label>
                <span class="editable-field" data-field="energySource">${card.energySource || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Manifestation:</label>
                <span class="editable-field" data-field="manifestation">${card.manifestation || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <!-- Rules & Limitations -->
          <div class="card-section">
            <h4>📏 Rules & Limitations</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Fundamental Rules:</label>
              <div class="card-content" contenteditable="true" data-field="fundamentalRules">${card.fundamentalRules || 'Click here to add fundamental rules...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Limitations & Weaknesses:</label>
              <div class="card-content" contenteditable="true" data-field="limitations">${card.limitations || 'Click here to add limitations...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Range/Distance Limits:</label>
                <span class="editable-field" data-field="rangeLimits">${card.rangeLimits || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Duration Limits:</label>
                <span class="editable-field" data-field="durationLimits">${card.durationLimits || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <!-- Users & Access -->
          <div class="card-section">
            <h4>👥 Users & Access</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Who Can Use It:</label>
                <span class="editable-field" data-field="whoCanUse">${card.whoCanUse || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Learning Difficulty:</label>
                <span class="editable-field" data-field="learningDifficulty">${card.learningDifficulty || 'Not specified'}</span>
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Known Users:</label>
              <div class="connected-characters-display">
                ${generateConnectedCharactersDisplay(card.knownUsers || [])}
              </div>
            </div>
            <div class="field-item" style="margin-top: 15px;">
              <label>Training/Learning Methods:</label>
              <div class="card-content" contenteditable="true" data-field="trainingMethods">${card.trainingMethods || 'Click here to add training methods...'}</div>
            </div>
          </div>
          
          <!-- Impact & Consequences -->
          <div class="card-section">
            <h4>🌍 Impact & Consequences</h4>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Societal Impact:</label>
              <div class="card-content" contenteditable="true" data-field="societalImpact">${card.societalImpact || 'Click here to add societal impact...'}</div>
            </div>
            <div class="field-item" style="margin-bottom: 15px;">
              <label>Potential Dangers:</label>
              <div class="card-content" contenteditable="true" data-field="potentialDangers">${card.potentialDangers || 'Click here to add potential dangers...'}</div>
            </div>
            <div class="field-grid">
              <div class="field-item">
                <label>Current Status:</label>
                <span class="editable-field" data-field="currentStatus">${card.currentStatus || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Public Knowledge:</label>
                <span class="editable-field" data-field="publicKnowledge">${card.publicKnowledge || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Timeline & History -->
          <div class="card-section">
            <h4>📅 Timeline & History</h4>
            <div class="field-grid">
              <div class="field-item">
                <label>Creation/Beginning Date:</label>
                <span class="editable-field" data-field="creationBeginningDate">${card.creationBeginningDate || 'Unknown'}</span>
              </div>
              <div class="field-item">
                <label>How it Began:</label>
                <span class="editable-field" data-field="beginningDescription">${card.beginningDescription || 'Not specified'}</span>
              </div>
              <div class="field-item">
                <label>Major Events Date:</label>
                <span class="editable-field" data-field="majorEventsDate">${card.majorEventsDate || 'None recorded'}</span>
              </div>
              <div class="field-item">
                <label>What Event:</label>
                <span class="editable-field" data-field="majorEventsDescription">${card.majorEventsDescription || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <!-- Tags Section -->
<div class="card-section">
  <h4>🏷️ Tags</h4>
  <div class="tags-display">
    ${generateTagsDisplay(card.tags || '')}
  </div>
</div>
          <!-- Additional Details -->
          <div class="card-section">
            <h4>📝 Additional Details</h4>
            <div class="card-content" contenteditable="true" data-field="content">${card.content || 'Click here to add additional details...'}</div>
          </div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
            <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
} else {
    // Default display for other card types
    viewer.innerHTML = `
      <div class="index-card-display">
        <div class="index-card-header">
          <div class="card-type-badge">${cardType}</div>
          <div class="card-name" contenteditable="true">${cardName}</div>
        </div>
        <div class="index-card-body">
          <div class="card-content" contenteditable="true">${card.content || 'Click here to add content...'}</div>
          
          <!-- Related Cards -->
          <div class="card-section">
            <h4>🔗 Related Cards</h4>
           <div class="related-cards-container">
              ${displayRelatedCards(findRelatedCards(cardType, cardName))}
            </div>
          </div>
        </div>
        <div class="index-card-footer">
          <small>Created: ${new Date(card.created).toLocaleDateString()}</small>
          ${card.modified !== card.created ? `<small>Modified: ${new Date(card.modified).toLocaleDateString()}</small>` : ''}
        </div>
      </div>
    `;
  }
  
  // Highlight active card
  document.querySelectorAll('.card-item').forEach(item => item.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  // Setup editing functionality
  setupIndexCardEditing();
}

function generateConnectedCharactersDisplay(connectedCharacters) {
  if (!connectedCharacters || connectedCharacters.length === 0) {
    return `<div class="no-connections">No connected characters yet.</div>`;
  }
  
  const characterTags = connectedCharacters.map(character => `
    <span class="relationship-tag" 
          onclick="openLinkedCard('${character.type}', '${character.name}')"
          title="Click to view ${character.name}">
      <span class="card-type-mini">${character.type}</span>
      ${character.name}
    </span>
  `).join('');
  
  return `<div class="relationship-tags">${characterTags}</div>`;
}

function generateRelationshipDisplay(relationshipType, relationships) {
  const relationshipKey = relationshipType.toLowerCase().replace(/\s+/g, '');
  
  if (relationships.length === 0) {
    return `
      <div class="relationship-item">
        <label>${relationshipType}:</label>
        <span class="no-relationship clickable-relationship" 
              onclick="editRelationship('${relationshipKey}', '${relationshipType}')"
              title="Click to add ${relationshipType.toLowerCase()}">
          None specified + Add
        </span>
      </div>
    `;
  }
  
  const relationshipTags = relationships.map(rel => `
    <span class="relationship-tag" 
          onclick="openLinkedCard('${rel.type}', '${rel.name}')"
          title="Click to view ${rel.name}">
      <span class="card-type-mini">${rel.type}</span>
      ${rel.name}
      <button class="remove-relationship" 
              onclick="event.stopPropagation(); removeRelationship('${relationshipKey}', '${rel.type}', '${rel.name}')"
              title="Remove this relationship">×</button>
    </span>
  `).join('');
  
  return `
    <div class="relationship-item">
      <label>${relationshipType}:</label>
      <div class="relationship-tags">
        ${relationshipTags}
        <span class="add-relationship clickable-relationship" 
              onclick="editRelationship('${relationshipKey}', '${relationshipType}')"
              title="Add another ${relationshipType.toLowerCase()}">+ Add</span>
      </div>
    </div>
  `;
}

function generateTagsDisplay(tagsString) {
  if (!tagsString || tagsString.trim() === '') {
    return '<div class="no-tags">No tags yet. <span class="editable-field clickable-tag" data-field="tags" onclick="editTags()">+ Add tags</span></div>';
  }
  
  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
  const tagElements = tags.map(tag => `
    <span class="tag-badge">${tag}</span>
  `).join('');
  
  return `
    <div class="tags-container">
      ${tagElements}
      <span class="editable-field clickable-tag" data-field="tags" onclick="editTags()">+ Edit tags</span>
    </div>
  `;
}

function editTags() {
  const newTags = prompt('Enter tags (separated by commas):', indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName].tags || '');
  if (newTags !== null) {
    indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName].tags = newTags;
    indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName].modified = new Date().toISOString();
    saveIndexCardsData();
    loadIndexCard(indexCardsData.currentType, indexCardsData.currentCardName);
  }
}

function openLinkedCard(cardType, cardName) {
  // Check if the card still exists
  if (!indexCardsData.cards[cardType] || !indexCardsData.cards[cardType][cardName]) {
    alert(`The linked ${cardType} card "${cardName}" no longer exists.`);
    return;
  }
  
  // Update the current type BEFORE calling showCardsOfType
  indexCardsData.currentType = cardType;
  indexCardsData.currentCardName = cardName;
  
  // Switch to the correct card type view
  showCardsOfType(cardType);
  
  // Small delay to ensure the card list is updated, then load the card
  setTimeout(() => {
    loadIndexCard(cardType, cardName);
    
    // Highlight the active card in the list
    document.querySelectorAll('.card-item').forEach(item => {
      item.classList.remove('active');
      if (item.textContent.trim() === cardName) {
        item.classList.add('active');
      }
    });
  }, 50);
  
  // Optional: Show a brief notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 4px;
    z-index: 3000;
    font-size: 12px;
  `;
  notification.textContent = `Opened: ${cardName}`;
  document.body.appendChild(notification);
  
  // Remove notification after 2 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 2000);
}

// Find cards that mention the current card  this is the find card function
function findRelatedCards(currentCardType, currentCardName) {
  const relatedCards = [];
  const searchTerms = [currentCardName.toLowerCase()];
  
  // Add additional search terms based on card type
  if (currentCardType === 'Character') {
    const card = indexCardsData.cards[currentCardType][currentCardName];
    if (card.fullName && card.fullName !== currentCardName) {
      searchTerms.push(card.fullName.toLowerCase());
    }
    if (card.nickname) {
      searchTerms.push(card.nickname.toLowerCase());
    }
  }
  
  // Search through all card types
  Object.keys(indexCardsData.cards).forEach(cardType => {
    Object.keys(indexCardsData.cards[cardType]).forEach(cardName => {
      // Skip the current card
      if (cardType === currentCardType && cardName === currentCardName) {
        return;
      }
      
      const card = indexCardsData.cards[cardType][cardName];
      let foundMatch = false;
      

const fieldsToSearch = [
  card.content || '',
  card.charactersInvolved || '',
  card.peopleInvolved || '',
  card.location || '',
  card.fullName || '',
  card.name || '', 
  card.stakes || '',
  card.associatedPeople || '',
  card.summary || '',
  card.worldName || '',
  card.symbol || '',
  card.chapterScene || '',
  card.eventDate || '',
  card.duration || '',
  card.age || '',
  card.nickname || '',
  card.gender || '',
  card.species || '',
  card.category || '',
  card.plotPointType || '',
  card.conflictType || '',
  // ADD THESE NEW LINES:
  card.locationName || '',
  card.description || '',
  card.pointsOfInterest || '',
  card.conflicts || '',
  card.inhabitants || '',
  card.climate || '',
  card.region || ''
  // END OF NEW LINES
];
      
      // Search each field for our terms
      fieldsToSearch.forEach(fieldText => {
        if (fieldText && typeof fieldText === 'string') {
          const lowerFieldText = fieldText.toLowerCase();
          searchTerms.forEach(term => {
            if (term && lowerFieldText.includes(term)) {
              foundMatch = true;
            }
          });
        }
      });
      
      // Check relationships for Character cards
      if (card.relationships) {
        Object.values(card.relationships).forEach(relationshipArray => {
          if (Array.isArray(relationshipArray)) {
            relationshipArray.forEach(rel => {
              if (rel.name && rel.name.toLowerCase() === currentCardName.toLowerCase()) {
                foundMatch = true;
              }
            });
          }
        });
      }
      
      if (foundMatch) {
        relatedCards.push({
          type: cardType,
          name: cardName,
          card: card
        });
      }
    });
  });
  
  return relatedCards;
}

// Display related cards in the UI
function displayRelatedCards(relatedCards) {
  if (relatedCards.length === 0) {
    return '<div class="related-cards-empty">No related cards found yet. Links will appear here automatically as you mention this card in others.</div>';
  }
  
  // Group cards by type
  const groupedCards = {};
  relatedCards.forEach(card => {
    if (!groupedCards[card.type]) {
      groupedCards[card.type] = [];
    }
    groupedCards[card.type].push(card);
  });
  
  let html = '<div class="related-cards-found">';
  
  // Display each group
  Object.keys(groupedCards).forEach(cardType => {
    html += `<div class="related-card-group">`;
    html += `<div class="related-card-type-header">${cardType} Cards (${groupedCards[cardType].length})</div>`;
    
    groupedCards[cardType].forEach(card => {
      html += `
        <div class="related-card-item" onclick="openLinkedCard('${card.type}', '${card.name}')" title="Click to view ${card.name}">
          <span class="related-card-name">${card.name}</span>
          <span class="related-card-preview">${getCardPreview(card.card)}</span>
        </div>
      `;
    });
    
    html += `</div>`;
  });
  
  html += '</div>';
  return html;
}

// Get a short preview of card content
function getCardPreview(card) {
  let preview = '';
  
  if (card.content) {
    preview = card.content;
  } else if (card.plotPointType) {
    preview = card.plotPointType;
  } else if (card.eventDate) {
    preview = card.eventDate;
  } else if (card.fullName) {
    preview = card.fullName;
  }
  
  // Clean and truncate
  preview = preview.replace(/<[^>]*>/g, ''); // Remove HTML
  if (preview.length > 50) {
    preview = preview.substring(0, 50) + '...';
  }
  
  return preview || 'No preview available';
}

// Handle editing of index card fields
function setupIndexCardEditing() {
  // Handle card name editing
  const cardNameElement = document.querySelector('.card-name');
  if (cardNameElement) {
    cardNameElement.addEventListener('blur', () => {
      const newName = cardNameElement.textContent.trim();
      const oldName = indexCardsData.currentCardName;
      
      if (newName && newName !== oldName) {
        // Check if name already exists
        if (indexCardsData.cards[indexCardsData.currentType][newName]) {
          alert('A card with that name already exists!');
          cardNameElement.textContent = oldName; // Revert
          return;
        }
        
        // Rename the card
        indexCardsData.cards[indexCardsData.currentType][newName] = 
          indexCardsData.cards[indexCardsData.currentType][oldName];
        delete indexCardsData.cards[indexCardsData.currentType][oldName];
        
        // Update current card name
        indexCardsData.currentCardName = newName;
        
        // Update the title and refresh the list
        document.getElementById('currentCardTitle').textContent = `${indexCardsData.currentType} / ${newName}`;
        showCardsOfType(indexCardsData.currentType);
        saveIndexCardsData();
      }
    });
    
    cardNameElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        cardNameElement.blur();
      }
    });
  }
  
  // Handle card content editing
  const cardContentElement = document.querySelector('.card-content');
  if (cardContentElement) {
    cardContentElement.addEventListener('input', () => {
      if (indexCardsData.currentType && indexCardsData.currentCardName) {
        indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName].content = 
          cardContentElement.innerHTML;
        indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName].modified = 
          new Date().toISOString();
        saveIndexCardsData();
      }
    });
  }
  // Handle individual field editing (for Timeline and Character cards)
  const editableFields = document.querySelectorAll('.editable-field');
  editableFields.forEach(field => {
    // Make field editable when clicked
    field.addEventListener('click', () => {
      if (!field.isContentEditable) {
        field.contentEditable = true;
        field.focus();
        field.style.backgroundColor = '#fff3cd';
        field.style.border = '1px solid #ffeaa7';
      }
    });
    
    // Save changes when user finishes editing
    field.addEventListener('blur', () => {
      field.contentEditable = false;
      field.style.backgroundColor = '';
      field.style.border = '';
      
      const fieldName = field.getAttribute('data-field');
      const newValue = field.textContent.trim();
      
      if (indexCardsData.currentType && indexCardsData.currentCardName && fieldName) {
        // Save the field value
        indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName][fieldName] = newValue;
        indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName].modified = 
          new Date().toISOString();
        saveIndexCardsData();
      }
    });
    
    // Save changes when user presses Enter
    field.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        field.blur();
      }
    });
  });
}

function showCardContextMenu(e, cardType, cardName) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('cardContextMenu');
  if (existingMenu) existingMenu.remove();
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'cardContextMenu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 2500;
    min-width: 120px;
  `;
  
  menu.innerHTML = `
    <div class="context-option" onclick="deleteIndexCard('${cardType}', '${cardName}')">🗑️ Delete Card</div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeCardContextMenu);
  }, 10);
}

function closeCardContextMenu() {
  const menu = document.getElementById('cardContextMenu');
  if (menu) menu.remove();
  document.removeEventListener('click', closeCardContextMenu);
}

function deleteIndexCard(cardType, cardName) {
  closeCardContextMenu();
  
  const confirmDelete = confirm(`Are you sure you want to delete the ${cardType} card "${cardName}"?\n\nThis cannot be undone.`);
  if (!confirmDelete) return;
  
  // Delete the card
  delete indexCardsData.cards[cardType][cardName];
  
  // Clear viewer if this was the current card
  if (indexCardsData.currentCardName === cardName && indexCardsData.currentType === cardType) {
    document.getElementById('currentCardTitle').textContent = 'Select an index card to view';
    document.getElementById('currentCardContent').innerHTML = 'Click on an index card to view and edit it here...';
    document.getElementById('currentCardContent').contentEditable = false;
    indexCardsData.currentCardName = null;
    indexCardsData.currentType = null;
  }
  
  // Refresh the current view
  showCardsOfType(cardType);
  saveIndexCardsData();
}

function saveIndexCardsData() {
  // Save with the current project
  localStorage.setItem('indexcards_' + (currentProjectName || 'default'), JSON.stringify(indexCardsData));
}

function loadIndexCardsData() {
  const saved = localStorage.getItem('indexcards_' + (currentProjectName || 'default'));
  if (saved) {
    indexCardsData = JSON.parse(saved);
  }
}

// Edit/Add Relationship Function
function editRelationship(relationshipKey, relationshipType) {
  if (!indexCardsData.currentCardName || indexCardsData.currentType !== 'Character') {
    alert('Can only edit relationships on Character cards.');
    return;
  }
  
  // Create relationship search dialog
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
    <h3 style="margin: 0 0 15px 0;">Add ${relationshipType}</h3>
    
    <div style="margin-bottom: 15px;">
      <input type="text" id="relationshipSearch" placeholder="Search for existing character..." 
             style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      <div id="relationshipResults" style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; margin-top: 5px; display: none;"></div>
    </div>
    
    <div style="text-align: center; margin: 15px 0; color: #666;">OR</div>
    
    <div style="margin-bottom: 20px;">
      <input type="text" id="newCharacterName" placeholder="Create new character..." 
             style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    
    <div style="text-align: right;">
      <button onclick="this.closest('.overlay').remove()" 
              style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">
        Cancel
      </button>
      <button onclick="addRelationshipFromDialog('${relationshipKey}')" 
              style="padding: 8px 16px; border: none; background: #007cba; color: white; border-radius: 4px; cursor: pointer;">
        Add Relationship
      </button>
    </div>
  `;
  
  overlay.className = 'overlay';
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Setup character search
  setupRelationshipSearch();
  
  // Focus on search input
  document.getElementById('relationshipSearch').focus();
}

// Setup character search functionality
function setupRelationshipSearch() {
  const searchInput = document.getElementById('relationshipSearch');
  const resultsDiv = document.getElementById('relationshipResults');
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
      resultsDiv.style.display = 'none';
      return;
    }
    
    // Get all existing character cards
    const characters = indexCardsData.cards.Character || {};
    const matchingCharacters = Object.keys(characters).filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
    
    if (matchingCharacters.length > 0) {
      resultsDiv.innerHTML = matchingCharacters.map(name => `
        <div class="search-result" onclick="selectExistingCharacter('${name}')"
             style="padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;">
          <strong>${name}</strong>
        </div>
      `).join('');
      resultsDiv.style.display = 'block';
    } else {
      resultsDiv.style.display = 'none';
    }
  });
}

// Select existing character for relationship
function selectExistingCharacter(characterName) {
  document.getElementById('relationshipSearch').value = characterName;
  document.getElementById('relationshipResults').style.display = 'none';
}

// Add relationship from dialog
function addRelationshipFromDialog(relationshipKey) {
  const searchValue = document.getElementById('relationshipSearch').value.trim();
  const newCharValue = document.getElementById('newCharacterName').value.trim();
  
  let characterName = '';
  let needsCreation = false;
  
  if (searchValue) {
    characterName = searchValue;
    // Check if character exists
    if (!indexCardsData.cards.Character || !indexCardsData.cards.Character[characterName]) {
      alert(`Character "${characterName}" doesn't exist. Use the "Create new character" field instead.`);
      return;
    }
  } else if (newCharValue) {
    characterName = newCharValue;
    needsCreation = true;
  } else {
    alert('Please enter a character name or search for an existing one.');
    return;
  }
  
  // Create new character if needed
  if (needsCreation) {
    if (!indexCardsData.cards.Character) {
      indexCardsData.cards.Character = {};
    }
    
    if (indexCardsData.cards.Character[characterName]) {
      alert('A character with that name already exists!');
      return;
    }
    
    // Create basic character
    indexCardsData.cards.Character[characterName] = {
      fullName: characterName,
      nickname: '',
      age: '',
      gender: '',
      species: '',
      content: '',
      relationships: {},
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
  }
  
  // Add relationship to current character
  const currentCard = indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName];
  if (!currentCard.relationships) {
    currentCard.relationships = {};
  }
  if (!currentCard.relationships[relationshipKey]) {
    currentCard.relationships[relationshipKey] = [];
  }
  
  // Check if relationship already exists
  const existingRel = currentCard.relationships[relationshipKey].find(rel => rel.name === characterName);
  if (existingRel) {
    alert('This relationship already exists!');
    return;
  }
  
  // Add the relationship
  currentCard.relationships[relationshipKey].push({
    type: 'Character',
    name: characterName
  });
  
  currentCard.modified = new Date().toISOString();
  
  // Save and refresh display
  saveIndexCardsData();
  loadIndexCard(indexCardsData.currentType, indexCardsData.currentCardName);
  
  // Close dialog
  document.querySelector('.overlay').remove();
  
  if (needsCreation) {
    alert(`Created new character "${characterName}" and added relationship!`);
  }
}

// Remove relationship
function removeRelationship(relationshipKey, cardType, characterName) {
  if (!confirm(`Remove relationship with ${characterName}?`)) {
    return;
  }
  
  const currentCard = indexCardsData.cards[indexCardsData.currentType][indexCardsData.currentCardName];
  if (currentCard.relationships && currentCard.relationships[relationshipKey]) {
    currentCard.relationships[relationshipKey] = currentCard.relationships[relationshipKey].filter(
      rel => rel.name !== characterName
    );
    
    currentCard.modified = new Date().toISOString();
    saveIndexCardsData();
    loadIndexCard(indexCardsData.currentType, indexCardsData.currentCardName);
  }
}

//Timeline Functions
// Timeline System


let timelineData = [];

// Refresh Timeline Button
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for refresh button (with delay to ensure elements exist)
  setTimeout(() => {
    const refreshButton = document.getElementById('refreshTimelineButton');
    if (refreshButton) {
      refreshButton.addEventListener('click', generateTimeline);
    }
    
    // Add event listener for filter dropdown
    const filterSelect = document.getElementById('timelineCardTypeFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', filterTimeline);
    }
  }, 2000);
});

// Generate Timeline from Index Cards
function generateTimeline() {
  console.log('Generating timeline...');
  timelineData = [];
  
  // 0) Bail out if no cards
  if (!indexCardsData || !indexCardsData.cards) {
    displayTimelineMessage('No index cards found. Create some index cards first!');
    return;
  }
  
  // 1) Collect all events
  Object.keys(indexCardsData.cards).forEach(cardType => {
    const cardsOfType = indexCardsData.cards[cardType];
    Object.keys(cardsOfType).forEach(cardName => {
      const card = cardsOfType[cardName];
      const events = extractTimelineEvents(cardType, cardName, card);
      timelineData.push(...events);
    });
  });
  
  // 2) Sort by date
  timelineData.sort((a, b) => {
    if (!a.date || a.date === 'Unknown' || a.date === 'Not specified') return 1;
    if (!b.date || b.date === 'Unknown' || b.date === 'Not specified') return -1;
    return a.date.localeCompare(b.date);
  });
  
  // 3) Read the date inputs *each* time you click Refresh
  const startInput = document.getElementById('timelineStartDate').value;
  const endInput   = document.getElementById('timelineEndDate').value;
  const startDate  = startInput ? new Date(startInput) : null;
  const endDate    = endInput   ? new Date(endInput)   : null;
  
  // 4) Filter timelineData in place
  timelineData = timelineData.filter(evt => {
    // If evt.date is missing or unparsable, you can choose to keep or drop—
    // here we keep it if no valid date
    const d = evt.date ? new Date(evt.date) : null;
    if (startDate && d && d < startDate) return false;
    if (endDate   && d && d > endDate)   return false;
    return true;
  });
  console.log('Filtered timeline data:', timelineData);
  
  // 5) Finally render the (now filtered) data
  displayTimeline();
}


// Extract timeline events from a single card
function extractTimelineEvents(cardType, cardName, card) {
  const events = [];
  
  // Character events
  if (cardType === 'Character') {
    if (card.dateOfBirth) {
      events.push({
        date: card.dateOfBirth,
        title: `${cardName} - Birth`,
        description: 'Born',
        cardType: cardType,
        cardName: cardName,
        eventType: 'birth'
      });
    }
    if (card.deathDate && card.deathDate !== 'N/A' && card.deathDate !== 'Still alive') {
      events.push({
        date: card.deathDate,
        title: `${cardName} - Death`,
        description: 'Died',
        cardType: cardType,
        cardName: cardName,
        eventType: 'death'
      });
    }
    if (card.significantEventDate) {
      events.push({
        date: card.significantEventDate,
        title: `${cardName} - ${card.significantEventDescription || 'Significant Event'}`,
        description: card.significantEventDescription || 'Significant event occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'significant'
      });
    }
  }
  
  // Story Development events
  if (cardType === 'Story Development') {
    if (card.storyYearSetting) {
      events.push({
        date: card.storyYearSetting,
        title: `${cardName} - Story Setting`,
        description: 'Story takes place',
        cardType: cardType,
        cardName: cardName,
        eventType: 'setting'
      });
    }
    if (card.eventConflictDate) {
      events.push({
        date: card.eventConflictDate,
        title: `${cardName} - ${card.eventConflictDescription || 'Event/Conflict'}`,
        description: card.eventConflictDescription || 'Event or conflict occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'conflict'
      });
    }
  }
  
  // Location events
  if (cardType === 'Location') {
    if (card.yearLocationDeveloped) {
      events.push({
        date: card.yearLocationDeveloped,
        title: `${cardName} - ${card.developmentDescription || 'Developed'}`,
        description: card.developmentDescription || 'Location was developed',
        cardType: cardType,
        cardName: cardName,
        eventType: 'development'
      });
    }
    if (card.environmentalChangesDate) {
      events.push({
        date: card.environmentalChangesDate,
        title: `${cardName} - ${card.environmentalChangesDescription || 'Environmental Change'}`,
        description: card.environmentalChangesDescription || 'Environmental change occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'environmental'
      });
    }
    if (card.keyEventsDate) {
      events.push({
        date: card.keyEventsDate,
        title: `${cardName} - ${card.keyEventsDescription || 'Key Event'}`,
        description: card.keyEventsDescription || 'Key event occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'key'
      });
    }
  }
  // Organization events
  if (cardType === 'Organizations') {
    if (card.creationDate) {
      events.push({
        date: card.creationDate,
        title: `${cardName} - ${card.foundingDescription || 'Founded'}`,
        description: card.foundingDescription || 'Organization was founded',
        cardType: cardType,
        cardName: cardName,
        eventType: 'founding'
      });
    }
    if (card.structuralChangesDate) {
      events.push({
        date: card.structuralChangesDate,
        title: `${cardName} - ${card.structuralChangesDescription || 'Structural Change'}`,
        description: card.structuralChangesDescription || 'Structural changes occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'change'
      });
    }
    if (card.majorEventsDate) {
      events.push({
        date: card.majorEventsDate,
        title: `${cardName} - ${card.majorEventsDescription || 'Major Event'}`,
        description: card.majorEventsDescription || 'Major event occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'major'
      });
    }
  }
  // Events cards
  if (cardType === 'Events') {
    if (card.eventDate) {
      events.push({
        date: card.eventDate,
        title: `${cardName}`,
        description: card.content || 'Event occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'event'
      });
    }
  }
  
  // Objects & Items events
  if (cardType === 'Objects & Items') {
    if (card.creationDate) {
      events.push({
        date: card.creationDate,
        title: `${cardName} - ${card.creationDescription || 'Created'}`,
        description: card.creationDescription || 'Object was created',
        cardType: cardType,
        cardName: cardName,
        eventType: 'creation'
      });
    }
    if (card.changedAffectedDate) {
      events.push({
        date: card.changedAffectedDate,
        title: `${cardName} - ${card.changedAffectedDescription || 'Changed'}`,
        description: card.changedAffectedDescription || 'Object was changed or affected',
        cardType: cardType,
        cardName: cardName,
        eventType: 'change'
      });
    }
  }
  
  // Cultures & Peoples events
  if (cardType === 'Cultures & Peoples') {
    if (card.creationOriginDate) {
      events.push({
        date: card.creationOriginDate,
        title: `${cardName} - ${card.originDescription || 'Origin'}`,
        description: card.originDescription || 'Culture/people originated',
        cardType: cardType,
        cardName: cardName,
        eventType: 'origin'
      });
    }
    if (card.culturalEventsDate) {
      events.push({
        date: card.culturalEventsDate,
        title: `${cardName} - ${card.culturalEventsDescription || 'Cultural Event'}`,
        description: card.culturalEventsDescription || 'Cultural event occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'cultural'
      });
    }
    if (card.changesDate) {
      events.push({
        date: card.changesDate,
        title: `${cardName} - ${card.changesDescription || 'Changes'}`,
        description: card.changesDescription || 'Cultural changes occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'change'
      });
    }
  }
  
  // Systems & Powers events
  if (cardType === 'Systems & Powers') {
    if (card.creationBeginningDate) {
      events.push({
        date: card.creationBeginningDate,
        title: `${cardName} - ${card.beginningDescription || 'Beginning'}`,
        description: card.beginningDescription || 'System/power began',
        cardType: cardType,
        cardName: cardName,
        eventType: 'beginning'
      });
    }
    if (card.majorEventsDate) {
      events.push({
        date: card.majorEventsDate,
        title: `${cardName} - ${card.majorEventsDescription || 'Major Event'}`,
        description: card.majorEventsDescription || 'Major event occurred',
        cardType: cardType,
        cardName: cardName,
        eventType: 'major'
      });
    }
  }
  // Add similar blocks for other card types...
  // Organizations, Objects & Items, Cultures & Peoples, Systems & Powers
  // Events cards (they already have eventDate)
  
  return events;
}

// Display timeline events
function displayTimeline() {
  const timelineContent = document.getElementById('timelineContent');
  
  if (timelineData.length === 0) {
    displayTimelineMessage('No timeline events found. Add dates to your index cards!');
    return;
  }
  
  let html = `<h3 style="text-align: center; color: #2C1810; margin-bottom: 30px;">📅 Story Timeline (${timelineData.length} events)</h3>`;
  
  timelineData.forEach(event => {
    const cardTypeClass = event.cardType.replace(/\s+/g, '-').replace(/&/g, '');
    
html += `
  <div class="timeline-event ${cardTypeClass}" onclick="openCardFromTimeline('${event.cardType}', '${event.cardName}')">
    <div class="timeline-event-header">
      <div class="timeline-event-main">
        <span class="timeline-event-date">${event.date}</span>
        <span class="timeline-event-title">${event.title}</span>
        <span class="timeline-event-description">${event.description}</span>
      </div>
      <div class="timeline-event-type">${event.cardType}</div>
    </div>
    <div class="timeline-event-source">From ${event.cardType}: ${event.cardName}</div>
  </div>
`;
  });
  
  timelineContent.innerHTML = html;
}

// Display message in timeline area
function displayTimelineMessage(message) {
  const timelineContent = document.getElementById('timelineContent');
  timelineContent.innerHTML = `<div id="timelineMessage">${message}</div>`;
}

// Open index card from timeline click
function openCardFromTimeline(cardType, cardName) {
  // Switch to Index Cards tab
  switchWorldbuildingTab('index');
  
  // Load the specific card
  setTimeout(() => {
    showCardsOfType(cardType);
    setTimeout(() => {
      loadIndexCard(cardType, cardName);
    }, 100);
  }, 100);
}

// Filter timeline by card type
function filterTimeline() {
  const filterValue = document.getElementById('timelineCardTypeFilter').value;
  
  if (filterValue === 'all') {
    displayTimeline();
    return;
  }
  
  const filteredData = timelineData.filter(event => event.cardType === filterValue);
  const originalTimelineData = timelineData;
  timelineData = filteredData;
  displayTimeline();
  timelineData = originalTimelineData; // Restore original data
}

// Timeline tab functions

// Timeline Layer System
let activeLayers = ['characters', 'plot', 'world', 'research']; // All active by default

// Add event listeners for layer buttons
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Layer button functionality
    document.querySelectorAll('.layer-btn[data-layer]').forEach(btn => {
      btn.addEventListener('click', () => toggleLayer(btn.getAttribute('data-layer')));
    });
    
    // Show All button
    const showAllBtn = document.getElementById('showAllLayersBtn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', showAllLayers);
    }
  }, 2000);
});

// Toggle layer on/off
function toggleLayer(layerName) {
  const btn = document.querySelector(`[data-layer="${layerName}"]`);
  
  if (activeLayers.includes(layerName)) {
    // Remove layer
    activeLayers = activeLayers.filter(layer => layer !== layerName);
    btn.classList.remove('active');
  } else {
    // Add layer
    activeLayers.push(layerName);
    btn.classList.add('active');
  }
  
  // Refresh timeline display with new layers
  displayTimelineWithLayers();
}

// Show all layers
function showAllLayers() {
  activeLayers = ['characters', 'plot', 'world', 'research'];
  document.querySelectorAll('.layer-btn[data-layer]').forEach(btn => {
    btn.classList.add('active');
  });
  displayTimelineWithLayers();
}

// Determine which layer an event belongs to
function getEventLayer(event) {
  // Character layer: Character card events
  if (event.cardType === 'Character') {
    return 'characters';
  }
  
  // Plot layer: Story Development and Events
  if (event.cardType === 'Story Development' || event.cardType === 'Events') {
    return 'plot';
  }
  
  // World layer: Locations, Organizations, Cultures, Systems
  if (['Location', 'Organizations', 'Cultures & Peoples', 'Systems & Powers'].includes(event.cardType)) {
    return 'world';
  }
  
  // Research layer: Objects & Items and other background info
  if (event.cardType === 'Objects & Items') {
    return 'research';
  }
  
  return 'world'; // Default to world layer
}

// Display timeline with layer filtering
function displayTimelineWithLayers() {
  if (timelineData.length === 0) {
    displayTimelineMessage('No timeline events found. Add dates to your index cards!');
    return;
  }
  
  // Filter events by active layers
  const filteredEvents = timelineData.filter(event => {
    const eventLayer = getEventLayer(event);
    return activeLayers.includes(eventLayer);
  });
  
  if (filteredEvents.length === 0) {
    displayTimelineMessage('No events in selected layers. Try enabling more layers!');
    return;
  }
  
  const timelineContent = document.getElementById('timelineContent');
  let html = `<h3 style="text-align: center; color: #2C1810; margin-bottom: 30px;">📅 Story Timeline (${filteredEvents.length} events)</h3>`;
  
  filteredEvents.forEach(event => {
    const cardTypeClass = event.cardType.replace(/\s+/g, '-').replace(/&/g, '');
    
    html += `
      <div class="timeline-event ${cardTypeClass}" onclick="openCardFromTimeline('${event.cardType}', '${event.cardName}')">
        <div class="timeline-event-header">
          <div class="timeline-event-main">
            <span class="timeline-event-date">${event.date}</span>
            <span class="timeline-event-title">${event.title}</span>
            <span class="timeline-event-description">${event.description}</span>
          </div>
          <div class="timeline-event-type">${event.cardType}</div>
        </div>
        <div class="timeline-event-source">From ${event.cardType}: ${event.cardName}</div>
      </div>
    `;
  });
  
  timelineContent.innerHTML = html;
}

// Update the original displayTimeline function to use layers
function displayTimeline() {
  displayTimelineWithLayers();
}

// timeline search functions

// Timeline Search System
let currentSearchTerm = '';

// Add search functionality
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Search input functionality
    const searchInput = document.getElementById('timelineSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        displayTimelineWithLayersAndSearch();
      });
      
      // Clear search on escape
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          currentSearchTerm = '';
          displayTimelineWithLayersAndSearch();
        }
      });
    }
  }, 2000);
});

// Check if event matches search term
function eventMatchesSearch(event) {
  if (!currentSearchTerm) return true; // No search term = show all
  
  const searchText = currentSearchTerm;
  
  // Search in date, title, description, card name, card type
  const searchableText = [
    event.date,
    event.title,
    event.description,
    event.cardName,
    event.cardType
  ].join(' ').toLowerCase();
  
  return searchableText.includes(searchText);
}

// Display timeline with both layers and search filtering
function displayTimelineWithLayersAndSearch() {
  if (timelineData.length === 0) {
    displayTimelineMessage('No timeline events found. Add dates to your index cards!');
    return;
  }
  
  // Filter events by active layers AND search term
  let filteredEvents = timelineData.filter(event => {
    const eventLayer = getEventLayer(event);
    const layerMatch = activeLayers.includes(eventLayer);
    const searchMatch = eventMatchesSearch(event);
    return layerMatch && searchMatch;
  });
  
  if (filteredEvents.length === 0) {
    if (currentSearchTerm) {
      displayTimelineMessage(`No events found for "${currentSearchTerm}". Try a different search term!`);
    } else {
      displayTimelineMessage('No events in selected layers. Try enabling more layers!');
    }
    return;
  }
  
  const timelineContent = document.getElementById('timelineContent');
  const searchInfo = currentSearchTerm ? ` matching "${currentSearchTerm}"` : '';
  let html = `<h3 style="text-align: center; color: #2C1810; margin-bottom: 30px;">📅 Story Timeline (${filteredEvents.length} events${searchInfo})</h3>`;
  
  filteredEvents.forEach(event => {
    const cardTypeClass = event.cardType.replace(/\s+/g, '-').replace(/&/g, '');
    
    // Highlight search terms in the display
    let displayTitle = event.title;
    let displayDescription = event.description;
    let displayDate = event.date;
    
    if (currentSearchTerm) {
      const regex = new RegExp(`(${currentSearchTerm})`, 'gi');
      displayTitle = displayTitle.replace(regex, '<mark>$1</mark>');
      displayDescription = displayDescription.replace(regex, '<mark>$1</mark>');
      displayDate = displayDate.replace(regex, '<mark>$1</mark>');
    }
    
    html += `
      <div class="timeline-event ${cardTypeClass}" onclick="openCardFromTimeline('${event.cardType}', '${event.cardName}')">
        <div class="timeline-event-header">
          <div class="timeline-event-main">
            <span class="timeline-event-date">${displayDate}</span>
            <span class="timeline-event-title">${displayTitle}</span>
            <span class="timeline-event-description">${displayDescription}</span>
          </div>
          <div class="timeline-event-type">${event.cardType}</div>
        </div>
        <div class="timeline-event-source">From ${event.cardType}: ${event.cardName}</div>
      </div>
    `;
  });
  
  timelineContent.innerHTML = html;
}

// Update layer and display functions to use search
function displayTimelineWithLayers() {
  displayTimelineWithLayersAndSearch();
}

function displayTimeline() {
  displayTimelineWithLayersAndSearch();
}


// Initialize index cards data when app loads
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadIndexCardsData();
  }, 1000);
});


//function for exporting the timeline
// Export Timeline Button
document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('exportTimelineButton');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    const timelineEl = document.getElementById('timelineContent');
    html2canvas(timelineEl).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('timeline.pdf');
    });
  });
});

// ===============================
// 🔍 GLOBAL SEARCH SYSTEM
// ===============================

// Global search functionality
let globalSearchData = [];

// Open global search overlay
function openGlobalSearch() {
  const overlay = document.getElementById('globalSearchOverlay');
  overlay.style.display = 'flex';
  
  // Focus on search input
  setTimeout(() => {
    document.getElementById('globalSearchBox').focus();
  }, 100);
}

// Close global search overlay
function closeGlobalSearch() {
  const overlay = document.getElementById('globalSearchOverlay');
  overlay.style.display = 'none';
  
  // Clear search
  document.getElementById('globalSearchBox').value = '';
  document.getElementById('globalSearchResults').innerHTML = `
    <div id="searchWelcome">
      Type above to search through chapters, characters, locations, notes, and research...
    </div>
  `;
}

// Build searchable data from all content
function buildGlobalSearchData() {
  globalSearchData = [];
  
  // 1) Search through Chapters/Documents
  Object.keys(documents || {}).forEach(chapterName => {
    const content = documents[chapterName];
    // Remove HTML tags for clean text search
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    
    if (cleanContent) {
      globalSearchData.push({
        type: 'Chapter',
        name: chapterName,
        content: cleanContent,
        preview: cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : ''),
        action: () => loadChapter(chapterName)
      });
    }
  });
  
  // 2) Search through Worldbuilding Notes
  if (worldbuildingData && worldbuildingData.folders) {
    Object.keys(worldbuildingData.folders).forEach(folderName => {
      Object.keys(worldbuildingData.folders[folderName]).forEach(noteName => {
        const noteContent = worldbuildingData.folders[folderName][noteName];
        const cleanContent = (noteContent || '').replace(/<[^>]*>/g, '').trim();
        
        if (cleanContent) {
          globalSearchData.push({
            type: 'Note',
            name: `${folderName} / ${noteName}`,
            content: cleanContent,
            preview: cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : ''),
            action: () => {
              switchWorldbuildingTab('notes');
              setTimeout(() => loadNote(folderName, noteName), 100);
            }
          });
        }
      });
    });
  }
  
  // 3) Search through Research Items
  if (researchData && researchData.folders) {
    Object.keys(researchData.folders).forEach(folderName => {
      Object.keys(researchData.folders[folderName]).forEach(itemName => {
        const item = researchData.folders[folderName][itemName];
        const searchText = [
          item.content || '',
          item.description || '',
          itemName
        ].join(' ').replace(/<[^>]*>/g, '').trim();
        
        if (searchText) {
          globalSearchData.push({
            type: 'Research',
            name: `${folderName} / ${itemName}`,
            content: searchText,
            preview: (item.description || item.content || '').substring(0, 150) + '...',
            action: () => {
              switchWorldbuildingTab('research');
              setTimeout(() => loadResearchItem(folderName, itemName), 100);
            }
          });
        }
      });
    });
  }
  
  // 4) Search through Index Cards
  if (indexCardsData && indexCardsData.cards) {
    Object.keys(indexCardsData.cards).forEach(cardType => {
      Object.keys(indexCardsData.cards[cardType]).forEach(cardName => {
        const card = indexCardsData.cards[cardType][cardName];
        
        // Build searchable text from all card fields
        const searchableFields = [
          card.content || '',
          card.name || '',
          card.fullName || '',
          card.description || '',
          card.appearance || '',
          card.backStory || '',
          card.personalityTraits || '',
          card.goals || '',
          card.location || '',
          card.origin || '',
          card.primaryFunction || ''
        ];
        
        const searchText = searchableFields.join(' ').replace(/<[^>]*>/g, '').trim();
        const preview = (card.content || card.description || card.appearance || 'No preview available').substring(0, 150) + '...';
        
        if (searchText) {
          globalSearchData.push({
            type: cardType,
            name: cardName,
            content: searchText,
            preview: preview,
            action: () => {
              switchWorldbuildingTab('index');
              setTimeout(() => {
                showCardsOfType(cardType);
                setTimeout(() => loadIndexCard(cardType, cardName), 100);
              }, 100);
            }
          });
        }
      });
    });
  }
  
  console.log(`Built search index with ${globalSearchData.length} items`);
}

// Perform global search
function performGlobalSearch(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    document.getElementById('globalSearchResults').innerHTML = `
      <div id="searchWelcome">
        Type above to search through chapters, characters, locations, notes, and research...
      </div>
    `;
    return;
  }
  
  // Rebuild search data to include latest changes
  buildGlobalSearchData();
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  const results = globalSearchData.filter(item => {
    return item.name.toLowerCase().includes(lowerSearchTerm) || 
           item.content.toLowerCase().includes(lowerSearchTerm);
  });
  
  displayGlobalSearchResults(results, searchTerm);
}

// Display search results
function displayGlobalSearchResults(results, searchTerm) {
  const resultsContainer = document.getElementById('globalSearchResults');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; color: #8B7355; padding: 40px; font-style: italic;">
        No results found for "${searchTerm}"
      </div>
    `;
    return;
  }
  
  // Group results by type
  const groupedResults = {};
  results.forEach(result => {
    if (!groupedResults[result.type]) {
      groupedResults[result.type] = [];
    }
    groupedResults[result.type].push(result);
  });
  
  let html = `<div style="margin-bottom: 15px; font-weight: bold; color: #2C1810;">Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchTerm}"</div>`;
  
  // Display each group
  Object.keys(groupedResults).forEach(type => {
    html += `<div class="search-result-group">`;
    html += `<div class="search-result-header">${type} (${groupedResults[type].length})</div>`;
    
    groupedResults[type].forEach((result, index) => {
      // Highlight search terms in title and preview
      const highlightedTitle = highlightSearchTerm(result.name, searchTerm);
      const highlightedPreview = highlightSearchTerm(result.preview, searchTerm);
      
      html += `
        <div class="search-result-item" onclick="executeSearchAction('${type}', ${index})">
          <div class="search-result-type">${result.type}</div>
          <div class="search-result-title">${highlightedTitle}</div>
          <div class="search-result-preview">${highlightedPreview}</div>
        </div>
      `;
    });
    
    html += `</div>`;
  });
  
  resultsContainer.innerHTML = html;
  
  // Store grouped results for action execution
  window.currentSearchResults = groupedResults;
}

// Highlight search terms in text
function highlightSearchTerm(text, searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Execute search result action
function executeSearchAction(type, index) {
  if (window.currentSearchResults && window.currentSearchResults[type] && window.currentSearchResults[type][index]) {
    const result = window.currentSearchResults[type][index];
    
    // Close search overlay
    closeGlobalSearch();
    
    // Execute the action
    if (result.action) {
      result.action();
    }
  }
}

// Event Listeners for Global Search
document.addEventListener('DOMContentLoaded', () => {
  // Add click handler for search menu item
  const searchLabel = document.getElementById('searchLabel');
  if (searchLabel) {
    searchLabel.addEventListener('click', openGlobalSearch);
  }
  
  // Add click handler for close button
  const closeButton = document.getElementById('closeGlobalSearch');
  if (closeButton) {
    closeButton.addEventListener('click', closeGlobalSearch);
  }
  
  // Add search input handler
  const searchBox = document.getElementById('globalSearchBox');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      performGlobalSearch(e.target.value);
    });
    
    // Close on Escape key
    searchBox.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeGlobalSearch();
      }
    });
  }
  
  // Close when clicking outside the panel
  const overlay = document.getElementById('globalSearchOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeGlobalSearch();
      }
    });
  }
});

// ===============================
// 🔗 FIXED AUTO-LINKING SYSTEM
// ===============================

// Auto-linking functionality for wiki-style [[links]] - FIXED VERSION
function initializeAutoLinking() {
  console.log('Setting up auto-linking...');
  
  // Use event delegation on the document for better compatibility
  document.addEventListener('input', (e) => {
    console.log('Input detected on:', e.target.tagName, e.target.className, e.target.id);
    
    // Check if the target is any editable content
    if (e.target.contentEditable === 'true' || 
        e.target.classList.contains('editable-page-content') ||
        e.target.id === 'currentNoteContent' ||
        e.target.classList.contains('card-content')) {
      
      console.log('✅ Processing auto-links in:', e.target.tagName, e.target.className || e.target.id);
      // Small delay to let the text settle
      setTimeout(() => processAutoLinks(e.target), 150);
    } else {
      console.log('❌ Skipping auto-link processing for:', e.target.tagName, e.target.className || e.target.id);
    }
  });
  
  // Also listen specifically to the textArea container for events
  const textArea = document.getElementById('textArea');
  if (textArea) {
    textArea.addEventListener('input', (e) => {
      console.log('📝 TextArea input event:', e.target.tagName, e.target.className);
      if (e.target.classList.contains('editable-page-content')) {
        console.log('🎯 Direct page content input detected!');
        setTimeout(() => processAutoLinks(e.target), 150);
      }
    });
    console.log('📝 TextArea event listener added');
  }
  
  // Also process on blur to catch any missed changes
  document.addEventListener('blur', (e) => {
    if (e.target.contentEditable === 'true' || 
        e.target.classList.contains('editable-page-content') ||
        e.target.id === 'currentNoteContent' ||
        e.target.classList.contains('card-content')) {
      
      setTimeout(() => processAutoLinks(e.target), 100);
    }
  }, true);
  
  console.log('Auto-linking event listeners attached');
}

// Enhanced processAutoLinks function with better detection and cursor handling
function processAutoLinks(element) {
  if (!element || !element.innerHTML) {
    console.log('No element or content to process');
    return;
  }
  
  console.log('Processing auto-links in element:', element.tagName, element.className);
  console.log('Current content:', element.innerHTML);
  
  const content = element.innerHTML;
  
  // Find all [[text]] patterns that aren't already processed
  const linkPattern = /\[\[([^\]]+)\]\]/g;
  let matches = content.match(linkPattern);
  
  if (!matches) {
    console.log('No [[]] patterns found');
    return;
  }
  
  console.log('Found patterns:', matches);
  
  // Store cursor position BEFORE making changes
  const selection = window.getSelection();
  let savedRange = null;
  let cursorOffset = 0;
  
  if (selection.rangeCount > 0 && element.contains(selection.anchorNode)) {
    savedRange = selection.getRangeAt(0).cloneRange();
    
    // Calculate cursor position as text offset
    const preRange = document.createRange();
    preRange.setStart(element, 0);
    preRange.setEnd(savedRange.startContainer, savedRange.startOffset);
    cursorOffset = preRange.toString().length;
    console.log('Saved cursor position at offset:', cursorOffset);
  }
  
  let hasChanges = false;
  
  const newContent = content.replace(linkPattern, (match, linkText, offset) => {
    // Don't process if it's already inside a link or processed
    const beforeMatch = content.substring(Math.max(0, offset - 100), offset);
    const afterMatch = content.substring(offset + match.length, offset + match.length + 100);
    
    if (beforeMatch.includes('<a') && beforeMatch.lastIndexOf('<a') > beforeMatch.lastIndexOf('</a>')) {
      console.log('Skipping - already in link');
      return match;
    }
    
    if (match.includes('auto-link') || match.includes('potential-link')) {
      console.log('Skipping - already processed');
      return match;
    }
    
    console.log('Processing link text:', linkText);
    
    // Check if this links to an existing card
    const linkedCard = findCardByName(linkText.trim());
    
    if (linkedCard) {
      console.log('Found existing card:', linkedCard);
      hasChanges = true;
      return `<a href="#" class="auto-link" data-card-type="${linkedCard.type}" data-card-name="${linkedCard.name}" onclick="openLinkedCard('${linkedCard.type}', '${linkedCard.name}'); return false;" title="Click to view ${linkedCard.name}">${linkText}</a>`;
    } else {
      console.log('Card not found, creating potential link');
      hasChanges = true;
      return `<span class="potential-link" onclick="offerToCreateCard('${linkText.trim()}')" title="Click to create new card: ${linkText}">${linkText}</span>`;
    }
  });
  
  if (hasChanges) {
    console.log('Updating content with links');
    console.log('New content:', newContent);
    
    // Update content
    element.innerHTML = newContent;
    
    // Try to restore cursor position
    restoreCursorPosition(element, cursorOffset);
    
    // Save the document if it's a main chapter
    if (element.classList.contains('editable-page-content')) {
      setTimeout(() => {
        saveCurrentDoc();
        updateCounts();
      }, 100);
    }
  }
}

// Improved cursor position restoration
function restoreCursorPosition(element, targetOffset) {
  try {
    const selection = window.getSelection();
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentOffset = 0;
    let targetNode = null;
    let localOffset = 0;
    
    // Walk through all text nodes to find the right position
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const nodeLength = textNode.textContent.length;
      
      if (currentOffset + nodeLength >= targetOffset) {
        targetNode = textNode;
        localOffset = targetOffset - currentOffset;
        break;
      }
      
      currentOffset += nodeLength;
    }
    
    if (targetNode && targetNode.textContent) {
      const range = document.createRange();
      const safeOffset = Math.min(localOffset, targetNode.textContent.length);
      range.setStart(targetNode, safeOffset);
      range.setEnd(targetNode, safeOffset);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      console.log('Cursor restored to position:', safeOffset, 'in node:', targetNode.textContent);
    } else {
      // Fallback: put cursor at the end
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      console.log('Cursor restored to end of element');
    }
  } catch (e) {
    console.log('Cursor restoration failed:', e);
    // If all else fails, just focus the element
    element.focus();
  }
}

// Find a card by name across all card types
function findCardByName(name) {
  if (!indexCardsData || !indexCardsData.cards) return null;
  
  const lowerName = name.toLowerCase().trim();
  
  // Search through all card types
  for (const cardType of Object.keys(indexCardsData.cards)) {
    for (const cardName of Object.keys(indexCardsData.cards[cardType])) {
      if (cardName.toLowerCase() === lowerName) {
        return { type: cardType, name: cardName };
      }
      
      // Also check other name fields
      const card = indexCardsData.cards[cardType][cardName];
      if (card.fullName && card.fullName.toLowerCase() === lowerName) {
        return { type: cardType, name: cardName };
      }
      if (card.nickname && card.nickname.toLowerCase() === lowerName) {
        return { type: cardType, name: cardName };
      }
      if (card.name && card.name.toLowerCase() === lowerName) {
        return { type: cardType, name: cardName };
      }
    }
  }
  
  return null;
}

// Offer to create a new card when clicking a potential link
function offerToCreateCard(name) {
  const choice = confirm(`"${name}" doesn't exist yet. Would you like to create a new Character card for them?`);
  
  if (choice) {
    // Create new character card
    if (!indexCardsData.cards.Character) {
      indexCardsData.cards.Character = {};
    }
    
    if (indexCardsData.cards.Character[name]) {
      alert('A character with that name already exists!');
      return;
    }
    
    // Create basic character
    indexCardsData.cards.Character[name] = {
      name: name,
      fullName: name,
      content: `Created from auto-link on ${new Date().toLocaleDateString()}`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      relationships: {}
    };
    
    saveIndexCardsData();
    
    // Open the new card
    switchWorldbuildingTab('index');
    setTimeout(() => {
      showCardsOfType('Character');
      setTimeout(() => loadIndexCard('Character', name), 100);
    }, 100);
    
    alert(`Created new Character card for "${name}"!`);
    
    // Refresh the current content to convert the potential link to a real link
    setTimeout(() => {
      const activeElements = document.querySelectorAll('.editable-page-content');
      activeElements.forEach(el => {
        if (el.innerHTML.includes('potential-link')) {
          processAutoLinks(el);
        }
      });
    }, 500);
  }
}

// Helper function to manually trigger auto-linking on all editable content
function refreshAllAutoLinks() {
  console.log('Refreshing all auto-links...');
  
  // Process all editable page content
  document.querySelectorAll('.editable-page-content').forEach((page, index) => {
    console.log(`Processing page ${index + 1}:`, page.innerHTML.substring(0, 100));
    processAutoLinks(page);
  });
  
  // Process notes editor if visible
  const notesEditor = document.getElementById('currentNoteContent');
  if (notesEditor && notesEditor.contentEditable === 'true') {
    console.log('Processing notes editor');
    processAutoLinks(notesEditor);
  }
  
  // Process index card content if visible
  document.querySelectorAll('.card-content[contenteditable="true"]').forEach((cardContent, index) => {
    console.log(`Processing card content ${index + 1}`);
    processAutoLinks(cardContent);
  });
}

// Test function to add some [[links]] to the current page for testing
function addTestLinks() {
  const pages = document.querySelectorAll('.editable-page-content');
  const firstPage = pages[0];
  if (firstPage) {
    const currentContent = firstPage.innerHTML;
    const testContent = currentContent + ' [[Oliver Dufort]] is a character and [[Mystical Forest]] is a location.';
    firstPage.innerHTML = testContent;
    console.log('Added test links to first page');
    processAutoLinks(firstPage);
  } else {
    console.log('No editable pages found');
  }
}

// Initialize auto-linking when the app loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeAutoLinking();
    console.log('Auto-linking system initialized');
    
    // Add a manual refresh button for testing (remove in production)
    console.log('Type refreshAllAutoLinks() in console to manually refresh links');
  }, 1000);
});

// Make functions available globally for debugging
window.refreshAllAutoLinks = refreshAllAutoLinks;
window.addTestLinks = addTestLinks;
window.processAutoLinks = processAutoLinks;

