// Baby Shower Dashboard JavaScript
// Admin dashboard functionality

// Global variables
let allGuests = [];
let filteredGuests = [];
let currentSort = { field: 'date', direction: 'desc' };

// Initialize dashboard - called after password authentication
async function initializeDashboard() {
    await loadGuests();
    updateStatistics();
    renderGuestTable();
    initializeFilters();
    initializeSorting();
    initializeExport();
    initializeRefresh();
}

// Load guests from Google Apps Script
async function loadGuests() {
    // Frontend security is limited; backend validation required
    try {
        showLoading(true);
        
        const url = window.APP_CONFIG.SCRIPT_URL + "?secret=" + encodeURIComponent(window.APP_CONFIG.SECRET_KEY);
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.rows)) {
            allGuests = result.rows;
        } else {
            allGuests = [];
        }
        
        filteredGuests = [...allGuests];
        showLoading(false);
        updateStatistics();
        renderGuestTable();
        updateGuestCount();
        
    } catch (error) {
        // Do not log sensitive data
        console.error('Error loading guests');
        allGuests = [];
        filteredGuests = [];
        showLoading(false);
        showError('Failed to load guest data. Please check your connection.');
    }
}

// Update statistics
function updateStatistics() {
    const stats = calculateStatistics();
    
    // Update main statistics
    document.getElementById('total-rsvps').textContent = stats.totalRSVPs;
    document.getElementById('total-adults').textContent = stats.totalAdults;
    document.getElementById('total-kids').textContent = stats.totalKids;
    document.getElementById('total-guests').textContent = stats.totalGuests;
}

function calculateStatistics() {
    const stats = {
        totalRSVPs: allGuests.length,
        totalAdults: 0,
        totalKids: 0,
        totalGuests: 0,
        avgAdults: 0,
        avgKids: 0
    };
    
    allGuests.forEach(guest => {
        const adults = parseInt(guest.adults) || 0;
        const kids = parseInt(guest.kids) || 0;
        
        stats.totalAdults += adults;
        stats.totalKids += kids;
        stats.totalGuests += adults + kids;
    });
    
    // Calculate averages
    if (stats.totalRSVPs > 0) {
        stats.avgAdults = stats.totalAdults / stats.totalRSVPs;
        stats.avgKids = stats.totalKids / stats.totalRSVPs;
    }
    
    return stats;
}

// Render guest table
function renderGuestTable() {
    const tbody = document.getElementById('guest-table-body');
    const noData = document.getElementById('no-data');
    
    if (filteredGuests.length === 0) {
        tbody.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    tbody.innerHTML = filteredGuests.map((guest, index) => {
        const status = guest.status || 'New';
        const statusClass = status === 'Updated' ? 'status-updated' : 'status-new';
        
        return `
        <tr data-index="${index}">
            <td>${escapeHtml(guest.firstName)} ${escapeHtml(guest.lastName)}</td>
            <td>${escapeHtml(guest.phone)}</td>
            <td>${escapeHtml(guest.email || 'N/A')}</td>
            <td>${guest.adults}</td>
            <td>${guest.kids}</td>
            <td>${escapeHtml(guest.note || 'N/A')}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${formatDate(guest.timestamp)}</td>
            <td>
                <button class="btn-delete" onclick="deleteGuest('${escapeHtml(guest.phone)}', ${index})" title="Delete RSVP">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `}).join('');
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFamilySide(side) {
    const sideMap = {
        'bride-side': 'Bride\'s Side',
        'groom-side': 'Groom\'s Side',
        'friends': 'Friends',
        'colleagues': 'Colleagues'
    };
    return sideMap[side] || side;
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Delete guest function
async function deleteGuest(phone, index) {
    if (!confirm('Are you sure you want to delete this RSVP? This action cannot be undone.')) {
        return;
    }
    
    // Frontend security is limited; backend validation required
    try {
        showLoading(true);
        
        // Send delete request to Google Apps Script with secret
        const response = await fetch(window.APP_CONFIG.SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                action: 'delete',
                phone: phone,
                secret: window.APP_CONFIG.SECRET_KEY
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Remove from local arrays
            const deletedGuest = filteredGuests.splice(index, 1)[0];
            const allIndex = allGuests.findIndex(g => g.phone === phone);
            if (allIndex > -1) allGuests.splice(allIndex, 1);
            
            // Re-render table
            renderGuestTable();
            updateStatistics();
            updateGuestCount();
            
            showSuccess('RSVP deleted successfully');
        } else {
            showError(result.message || 'Failed to delete RSVP');
        }
        
    } catch (error) {
        console.error('Error deleting guest:', error);
        showError('Error deleting RSVP. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Initialize filters
function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    const adultsFilter = document.getElementById('filter-adults');
    const kidsFilter = document.getElementById('filter-kids');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    // Search functionality
    searchInput.addEventListener('input', applyFilters);
    
    // Filter dropdowns
    adultsFilter.addEventListener('change', applyFilters);
    kidsFilter.addEventListener('change', applyFilters);
    
    // Clear filters
    clearFiltersBtn.addEventListener('click', clearFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const adultsFilter = document.getElementById('filter-adults').value;
    const kidsFilter = document.getElementById('filter-kids').value;
    
    filteredGuests = allGuests.filter(guest => {
        // Search filter
        const matchesSearch = !searchTerm || 
            guest.firstName.toLowerCase().includes(searchTerm) ||
            guest.lastName.toLowerCase().includes(searchTerm) ||
            guest.phone.includes(searchTerm) ||
            (guest.email && guest.email.toLowerCase().includes(searchTerm));
        
        // Adults filter
        const matchesAdults = adultsFilter === 'all' || 
            (adultsFilter === '4+' ? parseInt(guest.adults) >= 4 : guest.adults === adultsFilter);
        
        // Kids filter
        const matchesKids = kidsFilter === 'all' || 
            (kidsFilter === '3+' ? parseInt(guest.kids) >= 3 : guest.kids === kidsFilter);
        
        return matchesSearch && matchesAdults && matchesKids;
    });
    
    // Apply current sort
    sortGuests();
    renderGuestTable();
    updateGuestCount();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-adults').value = 'all';
    document.getElementById('filter-kids').value = 'all';
    
    filteredGuests = [...allGuests];
    sortGuests();
    renderGuestTable();
    updateGuestCount();
}

// Initialize sorting
function initializeSorting() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.dataset.sort;
            
            // Toggle direction if same field, otherwise default to desc
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'desc';
            }
            
            // Update UI
            updateSortButtons();
            
            // Apply sort and re-render
            sortGuests();
            renderGuestTable();
        });
    });
}

function updateSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const field = btn.dataset.sort;
        const icon = btn.querySelector('i');
        
        // Reset all icons
        icon.className = 'fas fa-sort';
        
        // Update current sort icon
        if (field === currentSort.field) {
            icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    });
}

function sortGuests() {
    filteredGuests.sort((a, b) => {
        let aValue, bValue;
        
        switch (currentSort.field) {
            case 'name':
                aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                break;
            case 'phone':
                aValue = a.phone.replace(/\D/g, '');
                bValue = b.phone.replace(/\D/g, '');
                break;
            case 'email':
                aValue = a.email || '';
                bValue = b.email || '';
                break;
            case 'adults':
                aValue = parseInt(a.adults) || 0;
                bValue = parseInt(b.adults) || 0;
                break;
            case 'kids':
                aValue = parseInt(a.kids) || 0;
                bValue = parseInt(b.kids) || 0;
                break;
            case 'date':
                aValue = new Date(a.timestamp || 0);
                bValue = new Date(b.timestamp || 0);
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Initialize export functionality
function initializeExport() {
    document.getElementById('export-btn').addEventListener('click', exportToCSV);
}

function exportToCSV() {
    if (filteredGuests.length === 0) {
        showError('No data to export');
        return;
    }
    
    try {
        // Create CSV content
        const headers = ['Name', 'Phone', 'Email', 'Adults', 'Kids', 'Message', 'Status', 'RSVP Date'];
        const csvContent = [
            headers.join(','),
            ...filteredGuests.map(guest => [
                `"${guest.firstName} ${guest.lastName}"`,
                `"${guest.phone}"`,
                `"${guest.email || ''}"`,
                guest.adults,
                guest.kids,
                `"${(guest.note || '').replace(/"/g, '""')}"`,
                `"${guest.status || 'New'}"`,
                `"${formatDate(guest.timestamp)}"`
            ].join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `baby-shower-rsvps-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('CSV exported successfully!');
        
    } catch (error) {
        console.error('Export error:', error);
        showError('Failed to export CSV');
    }
}

// Initialize refresh functionality
function initializeRefresh() {
    document.getElementById('refresh-btn').addEventListener('click', refreshData);
}

async function refreshData() {
    await loadGuests();
    updateStatistics();
    renderGuestTable();
    showSuccess('Data refreshed successfully!');
}

// UI Helper functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function updateGuestCount() {
    const guestCount = document.getElementById('guest-count');
    if (guestCount) {
        guestCount.textContent = `${filteredGuests.length} guest${filteredGuests.length !== 1 ? 's' : ''}`;
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for side badges
const sideBadgeStyles = document.createElement('style');
sideBadgeStyles.textContent = `
    .side-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .side-badge.bride-side {
        background: #ffebee;
        color: #c62828;
    }
    
    .side-badge.groom-side {
        background: #e3f2fd;
        color: #1565c0;
    }
    
    .side-badge.friends {
        background: #f3e5f5;
        color: #7b1fa2;
    }
    
    .side-badge.colleagues {
        background: #e8f5e8;
        color: #2e7d32;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(sideBadgeStyles);

// TODO: Backend integration functions
// These functions can be implemented later to connect to Google Sheets or a backend API

/*
async function syncWithBackend() {
    // Example: Sync data with backend
    try {
        const response = await fetch('YOUR_SYNC_ENDPOINT');
        if (response.ok) {
            const backendGuests = await response.json();
            localStorage.setItem('babyShowerGuests', JSON.stringify(backendGuests));
            allGuests = backendGuests;
            filteredGuests = [...allGuests];
            updateStatistics();
            renderGuestTable();
        }
    } catch (error) {
        console.error('Sync error:', error);
        showError('Failed to sync with backend');
    }
}

async function submitToBackend(guestData) {
    // Example: Submit to Google Sheets API
    try {
        const response = await fetch('YOUR_GOOGLE_SHEETS_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit to backend');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Backend submission error:', error);
        throw error;
    }
}
*/
