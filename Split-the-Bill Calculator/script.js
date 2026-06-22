// State Management
let people = [];
let nextId = 1;

// DOM Elements
const currencySelect = document.getElementById('currency-select');
const subtotalPrefix = document.getElementById('subtotal-prefix');
const billSubtotal = document.getElementById('bill-subtotal');
const taxPercentage = document.getElementById('tax-percentage');
const tipPercentage = document.getElementById('tip-percentage');
const presetButtons = document.querySelectorAll('.preset-btn');
const peopleListContainer = document.getElementById('people-list');
const emptyState = document.getElementById('empty-state');
const addPersonBtn = document.getElementById('add-person-btn');
const calculateBtn = document.getElementById('calculate-btn');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');
const validationAlert = document.getElementById('validation-alert');
const validationMessage = document.getElementById('validation-message');
const resultsBreakdownList = document.getElementById('results-breakdown-list');
const toast = document.getElementById('toast');

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  
  // Set up default state with 2 people for immediate preview
  addPerson('Alice', 'ratio', 1);
  addPerson('Bob', 'ratio', 1);
  
  // Perform initial calculation
  calculateSplit();
});

// Event Listeners for Bill Inputs
currencySelect.addEventListener('change', () => {
  const currencySymbol = currencySelect.value;
  subtotalPrefix.textContent = currencySymbol;
  calculateSplit();
});

billSubtotal.addEventListener('input', calculateSplit);
taxPercentage.addEventListener('input', calculateSplit);
tipPercentage.addEventListener('input', calculateSplit);

// Preset Tip Buttons
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tipValue = parseFloat(btn.getAttribute('data-tip'));
    
    // Toggle active state
    presetButtons.forEach(b => b.classList.remove('active'));
    
    if (parseFloat(tipPercentage.value) === tipValue) {
      // Toggle off if clicking the already selected active preset
      tipPercentage.value = 0;
    } else {
      tipPercentage.value = tipValue;
      btn.classList.add('active');
    }
    
    calculateSplit();
  });
});

// Reset active presets if user types manually in tip percentage
tipPercentage.addEventListener('input', () => {
  const currentVal = parseFloat(tipPercentage.value);
  presetButtons.forEach(btn => {
    const btnVal = parseFloat(btn.getAttribute('data-tip'));
    if (currentVal === btnVal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
});

// Add Person Event
addPersonBtn.addEventListener('click', () => {
  addPerson();
});

// Calculate Button Click (runs calculation with a visual flash animation)
calculateBtn.addEventListener('click', () => {
  const card = document.querySelector('.results-card');
  card.style.transform = 'scale(1.02)';
  card.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.4)';
  
  setTimeout(() => {
    card.style.transform = '';
    card.style.boxShadow = '';
  }, 200);
  
  calculateSplit();
});

// Reset Form
resetBtn.addEventListener('click', () => {
  // Clear inputs
  billSubtotal.value = '';
  taxPercentage.value = '0';
  tipPercentage.value = '0';
  currencySelect.value = '₹';
  subtotalPrefix.textContent = '₹';
  
  presetButtons.forEach(btn => btn.classList.remove('active'));
  
  // Clear people list DOM
  peopleListContainer.innerHTML = '';
  people = [];
  nextId = 1;
  
  // Re-add default people
  addPerson('Alice', 'ratio', 1);
  addPerson('Bob', 'ratio', 1);
  
  calculateSplit();
});

// Copy Results to Clipboard
copyBtn.addEventListener('click', () => {
  const text = generateFormattedSummary();
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
});

// Core Logic Functions

function addPerson(name = '', splitType = 'ratio', value = 1) {
  const id = `person-${nextId++}`;
  const personName = name || `Person ${people.length + 1}`;
  
  const newPerson = {
    id,
    name: personName,
    splitType,
    value
  };
  
  people.push(newPerson);
  
  // Create and append row
  const row = createPersonRow(newPerson);
  peopleListContainer.appendChild(row);
  
  // Hide empty state
  emptyState.style.display = 'none';
  
  // Focus name field if it's user-added
  if (!name) {
    const nameInput = row.querySelector('.person-name-input');
    nameInput.focus();
    nameInput.select();
  }
  
  calculateSplit();
}

function removePerson(id) {
  const row = peopleListContainer.querySelector(`[data-id="${id}"]`);
  if (row) {
    row.classList.add('fade-out');
    
    // Wait for animation to finish
    setTimeout(() => {
      row.remove();
      people = people.filter(p => p.id !== id);
      
      if (people.length === 0) {
        emptyState.style.display = 'flex';
      }
      
      calculateSplit();
    }, 250);
  }
}

function createPersonRow(person) {
  const row = document.createElement('div');
  row.className = 'person-row';
  row.dataset.id = person.id;
  
  const currencySymbol = currencySelect.value;
  
  row.innerHTML = `
    <div class="person-name-wrapper">
      <input type="text" class="form-input person-name-input" placeholder="Name" value="${escapeHTML(person.name)}">
    </div>
    
    <div class="split-type-selector">
      <button type="button" class="tab-btn btn-type-ratio ${person.splitType === 'ratio' ? 'active' : ''}">Equal/Items</button>
      <button type="button" class="tab-btn btn-type-manual ${person.splitType === 'manual' ? 'active' : ''}">Manual Amount</button>
    </div>
    
    <div class="person-value-wrapper">
      <div class="input-wrapper">
        <input type="number" class="form-input person-value-input" value="${person.value}">
      </div>
    </div>
    
    <button type="button" class="btn-remove-person" title="Remove person">
      <i data-lucide="trash-2"></i>
    </button>
  `;
  
  // DOM element selections
  const nameInput = row.querySelector('.person-name-input');
  const ratioBtn = row.querySelector('.btn-type-ratio');
  const manualBtn = row.querySelector('.btn-type-manual');
  const valueInput = row.querySelector('.person-value-input');
  const removeBtn = row.querySelector('.btn-remove-person');
  
  // Configure input elements based on type
  updateRowInputs(person.splitType, valueInput);
  
  // Events
  nameInput.addEventListener('input', (e) => {
    person.name = e.target.value;
    // Calculate in real-time but don't rebuild elements to avoid focus issues
    calculateSplit();
  });
  
  valueInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    person.value = isNaN(val) ? 0 : val;
    calculateSplit();
  });
  
  // Format manual amounts nicely on blur
  valueInput.addEventListener('blur', (e) => {
    if (person.splitType === 'manual') {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        valueInput.value = val.toFixed(2);
      }
    }
  });
  
  ratioBtn.addEventListener('click', () => {
    if (person.splitType !== 'ratio') {
      person.splitType = 'ratio';
      person.value = 1;
      valueInput.value = 1;
      
      ratioBtn.classList.add('active');
      manualBtn.classList.remove('active');
      updateRowInputs('ratio', valueInput);
      calculateSplit();
    }
  });
  
  manualBtn.addEventListener('click', () => {
    if (person.splitType !== 'manual') {
      person.splitType = 'manual';
      person.value = 0;
      valueInput.value = 0;
      
      manualBtn.classList.add('active');
      ratioBtn.classList.remove('active');
      updateRowInputs('manual', valueInput);
      calculateSplit();
    }
  });
  
  removeBtn.addEventListener('click', () => {
    removePerson(person.id);
  });
  
  // Render Lucide Trash Icon
  lucide.createIcons({
    attrs: { class: 'lucide-icon' },
    nameAttr: 'data-lucide',
    nodes: [removeBtn]
  });
  
  return row;
}

function updateRowInputs(type, valueInput) {
  if (type === 'ratio') {
    valueInput.placeholder = '1';
    valueInput.step = '1';
    valueInput.min = '0';
    valueInput.style.paddingLeft = '1rem';
    valueInput.style.paddingRight = '1rem';
  } else {
    valueInput.placeholder = '0.00';
    valueInput.step = '0.01';
    valueInput.min = '0';
    valueInput.style.paddingLeft = '1rem';
    valueInput.style.paddingRight = '1rem';
  }
}

// Split calculations
let calculatedResultsCache = null; // Cache results for clip copy

function calculateSplit() {
  const subtotal = Math.max(0, parseFloat(billSubtotal.value) || 0);
  const taxPercent = Math.max(0, parseFloat(taxPercentage.value) || 0);
  const tipPercent = Math.max(0, parseFloat(tipPercentage.value) || 0);
  const currencySymbol = currencySelect.value;
  
  // Calculate Totals
  const taxAmount = subtotal * (taxPercent / 100);
  const tipAmount = subtotal * (tipPercent / 100);
  const grandTotal = subtotal + taxAmount + tipAmount;
  
  // Update totals text in card
  document.getElementById('display-subtotal').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('display-tax').textContent = `${currencySymbol}${taxAmount.toFixed(2)}`;
  document.getElementById('display-tip').textContent = `${currencySymbol}${tipAmount.toFixed(2)}`;
  document.getElementById('display-grand-total').textContent = `${currencySymbol}${grandTotal.toFixed(2)}`;
  
  // Reset alert
  validationAlert.classList.add('hidden');
  
  if (people.length === 0) {
    resultsBreakdownList.innerHTML = '<div class="no-results-state">Add people to see the split.</div>';
    copyBtn.disabled = true;
    calculatedResultsCache = null;
    return;
  }
  
  // Split Logic:
  const manualSplitters = people.filter(p => p.splitType === 'manual');
  const ratioSplitters = people.filter(p => p.splitType === 'ratio');
  
  // 1. Sum up manual shares
  const sumManualShares = manualSplitters.reduce((sum, p) => sum + p.value, 0);
  
  // 2. Validate manual shares don't exceed base subtotal
  if (sumManualShares > subtotal) {
    validationMessage.textContent = `Total manual shares (${currencySymbol}${sumManualShares.toFixed(2)}) exceed subtotal (${currencySymbol}${subtotal.toFixed(2)})!`;
    validationAlert.classList.remove('hidden');
    resultsBreakdownList.innerHTML = '<div class="no-results-state">Error: Invalid share distribution.</div>';
    copyBtn.disabled = true;
    calculatedResultsCache = null;
    return;
  }
  
  // 3. Determine remaining subtotal and total ratio units
  const remainingSubtotal = subtotal - sumManualShares;
  const totalRatioUnits = ratioSplitters.reduce((sum, p) => sum + p.value, 0);
  
  const baseShares = {};
  
  // Distribute manual base shares
  manualSplitters.forEach(p => {
    baseShares[p.id] = p.value;
  });
  
  // Distribute remaining subtotal to ratio splitters
  if (ratioSplitters.length > 0) {
    if (totalRatioUnits > 0) {
      ratioSplitters.forEach(p => {
        baseShares[p.id] = remainingSubtotal * (p.value / totalRatioUnits);
      });
    } else {
      // If there are ratio splitters but they all entered 0, divide remaining subtotal equally among them
      ratioSplitters.forEach(p => {
        baseShares[p.id] = remainingSubtotal / ratioSplitters.length;
      });
    }
  } else if (remainingSubtotal > 0.005) {
    // If no ratio splitters and remaining subtotal exists, warn about leftover allocation
    validationMessage.textContent = `Leftover subtotal (${currencySymbol}${remainingSubtotal.toFixed(2)}) is unallocated. Adjust manual shares or change some members to Equal/Items.`;
    validationAlert.classList.remove('hidden');
  }
  
  // 4. Calculate individual final shares with tax and tip proportions
  // Multiplier scales the base share to include tax and tip percentages
  const multiplier = 1 + (taxPercent / 100) + (tipPercent / 100);
  
  const sharesBreakdown = people.map(p => {
    const baseShare = baseShares[p.id] || 0;
    const individualTax = baseShare * (taxPercent / 100);
    const individualTip = baseShare * (tipPercent / 100);
    const totalOwed = baseShare * multiplier;
    
    return {
      id: p.id,
      name: p.name || 'Unnamed Person',
      baseShare,
      individualTax,
      individualTip,
      totalOwed
    };
  });
  
  // Cache for copying
  calculatedResultsCache = {
    subtotal,
    taxPercent,
    taxAmount,
    tipPercent,
    tipAmount,
    grandTotal,
    currencySymbol,
    shares: sharesBreakdown
  };
  
  // Render breakdown in UI
  resultsBreakdownList.innerHTML = '';
  copyBtn.disabled = false;
  
  sharesBreakdown.forEach(item => {
    const percentage = grandTotal > 0 ? (item.totalOwed / grandTotal) * 100 : 0;
    
    const resultCard = document.createElement('div');
    resultCard.className = 'result-person-card';
    resultCard.innerHTML = `
      <div class="result-person-header">
        <span class="result-person-name">${escapeHTML(item.name)}</span>
        <span class="result-person-amount">${currencySymbol}${item.totalOwed.toFixed(2)}</span>
      </div>
      <div class="result-person-details">
        <span>Base: ${currencySymbol}${item.baseShare.toFixed(2)}</span>
        <span>Tax: ${currencySymbol}${item.individualTax.toFixed(2)} | Tip: ${currencySymbol}${item.individualTip.toFixed(2)}</span>
      </div>
      <div class="result-person-progress-bar">
        <div class="result-person-progress-fill" style="width: ${percentage}%"></div>
      </div>
    `;
    resultsBreakdownList.appendChild(resultCard);
  });
}

// Generate formatted summary text for sharing
function generateFormattedSummary() {
  if (!calculatedResultsCache) return '';
  
  const c = calculatedResultsCache;
  const divider = '------------------------------------------';
  
  let text = `🧾 *SplitShare Bill Summary*\n`;
  text += `${divider}\n`;
  text += `Subtotal: ${c.currencySymbol}${c.subtotal.toFixed(2)}\n`;
  text += `Tax (${c.taxPercent}%): ${c.currencySymbol}${c.taxAmount.toFixed(2)}\n`;
  text += `Tip (${c.tipPercent}%): ${c.currencySymbol}${c.tipAmount.toFixed(2)}\n`;
  text += `${divider}\n`;
  text += `💰 *Grand Total: ${c.currencySymbol}${c.grandTotal.toFixed(2)}*\n\n`;
  
  text += `👤 *Breakdown by Person:*\n`;
  c.shares.forEach(p => {
    text += `• *${p.name}* owes *${c.currencySymbol}${p.totalOwed.toFixed(2)}* `;
    text += `(Base: ${c.currencySymbol}${p.baseShare.toFixed(2)}, Tax/Tip: ${c.currencySymbol}${(p.individualTax + p.individualTip).toFixed(2)})\n`;
  });
  
  text += `\nShared via SplitShare 💸`;
  return text;
}

// Show toast alert
let toastTimeout;
function showToast() {
  clearTimeout(toastTimeout);
  toast.classList.remove('hidden');
  
  // Re-render checkmark icon inside toast
  lucide.createIcons({
    attrs: { class: 'lucide-icon' },
    nameAttr: 'data-lucide',
    nodes: [toast]
  });
  
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

// Helper to escape HTML characters
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
