// Baby Shower Dashboard JavaScript
// Admin dashboard functionality

// Global variables
let allGuests = [];
let filteredGuests = [];
let currentSort = { field: 'date', direction: 'desc' };

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    await loadGuests();
    updateStatistics();
    renderGuestTable();
    initializeFilters();
    initializeSorting();
    initializeExport();
    initializeRefresh();
}

// Load guests from localStorage or fallback to JSON
async function loadGuests() {
    try {
        // Show loading
        showLoading(true);
        
        // First try to load from localStorage
        const storedGuests = localStorage.getItem('babyShowerGuests');
        if (storedGuests) {
            allGuests = JSON.parse(storedGuests);
        } else {
            // Fallback to JSON file
            const response = await fetch('../assets/data/guests.json');
            if (response.ok) {
                allGuests = await response.json();
            } else {
                allGuests = [];
            }
        }
        
        filteredGuests = [...allGuests];
        
        // Hide loading
        showLoading(false);
        
        // Update UI
        updateGuestCount();
        
    } catch (error) {
        console.error('Error loading guests:', error);
        allGuests = [];
        filteredGuests = [];
        showLoading(false);
        showError('Failed to load guest data');
    }
}

// Update statistics
function updateStatistics() {
    const stats = calculateStatistics();
    
    // Update main statistics
    document.getElementById('total-rsvps').textContent = stats.totalRSVPs;
    document.getElementById('total-guests').textContent = stats.totalGuests;
    document.getElementById('under-15').textContent = stats.under15;
    document.getElementById('above-15').textContent = stats.above15;
    
    // Update side statistics
    document.getElementById('bride-count').textContent = stats.brideSide;
    document.getElementById('groom-count').textContent = stats.groomSide;
    document.getElementById('friends-count').textContent = stats.friends;
    document.getElementById('colleagues-count').textContent = stats.colleagues;
}

function calculateStatistics() {
    const stats = {
        totalRSVPs: allGuests.length,
        totalGuests: 0,
        under15: 0,
        above15: 0,
        brideSide: 0,
        groomSide: 0,
        friends: 0,
        colleagues: 0
    };
    
    allGuests.forEach(guest => {
        const attending = parseInt(guest.attending) || 0;
        stats.totalGuests += attending;
        
        if (attending <= 15) {
            stats.under15 += attending;
        } else {
            stats.above15 += attending;
        }
        
        // Count by family side
        switch (guest.familySide) {
            case 'bride-side':
                stats.brideSide += attending;
                break;
            case 'groom-side':
                stats.groomSide += attending;
                break;
            case 'friends':
                stats.friends += attending;
                break;
            case 'colleagues':
                stats.colleagues += attending;
                break;
        }
    });
    
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
    
    tbody.innerHTML = filteredGuests.map(guest => `
        <tr>
            <td>${escapeHtml(guest.firstName)} ${escapeHtml(guest.lastName)}</td>
            <td>${escapeHtml(guest.phone)}</td>
            <td>${escapeHtml(guest.email || 'N/A')}</td>
            <td>${guest.attending}</td>
            <td><span class="side-badge ${guest.familySide}">${formatFamilySide(guest.familySide)}</span></td>
            <td>${escapeHtml(guest.note || 'N/A')}</td>
            <td>${formatDate(guest.timestamp)}</td>
        </tr>
    `).join('');
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

// Initialize filters
function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    const attendingFilter = document.getElementById('filter-attending');
    const sideFilter = document.getElementById('filter-side');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    // Search functionality
    searchInput.addEventListener('input', applyFilters);
    
    // Filter dropdowns
    attendingFilter.addEventListener('change', applyFilters);
    sideFilter.addEventListener('change', applyFilters);
    
    // Clear filters
    clearFiltersBtn.addEventListener('click', clearFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const attendingFilter = document.getElementById('filter-attending').value;
    const sideFilter = document.getElementById('filter-side').value;
    
    filteredGuests = allGuests.filter(guest => {
        // Search filter
        const matchesSearch = !searchTerm || 
            guest.firstName.toLowerCase().includes(searchTerm) ||
            guest.lastName.toLowerCase().includes(searchTerm) ||
            guest.phone.includes(searchTerm) ||
            (guest.email && guest.email.toLowerCase().includes(searchTerm));
        
        // Attending filter
        const matchesAttending = attendingFilter === 'all' || 
            (attendingFilter === '4+' ? parseInt(guest.attending) >= 4 : guest.attending === attendingFilter);
        
        // Side filter
        const matchesSide = sideFilter === 'all' || guest.familySide === sideFilter;
        
        return matchesSearch && matchesAttending && matchesSide;
    });
    
    // Apply current sort
    sortGuests();
    renderGuestTable();
    updateGuestCount();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-attending').value = 'all';
    document.getElementById('filter-side').value = 'all';
    
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
            case 'attending':
                aValue = parseInt(a.attending) || 0;
                bValue = parseInt(b.attending) || 0;
                break;
            case 'side':
                aValue = a.familySide;
                bValue = b.familySide;
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
        const headers = ['Name', 'Phone', 'Email', 'Guests Attending', 'Family Side', 'Message', 'RSVP Date'];
        const csvContent = [
            headers.join(','),
            ...filteredGuests.map(guest => [
                `"${guest.firstName} ${guest.lastName}"`,
                `"${guest.phone}"`,
                `"${guest.email || ''}"`,
                guest.attending,
                `"${formatFamilySide(guest.familySide)}"`,
                `"${(guest.note || '').replace(/"/g, '""')}"`,
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
