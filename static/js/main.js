// Global variables
let currentSection = 'create';
let typingIndex = 0;
let charIndex = 0;
const typingTexts = [
    "Auto Panel Creator",
    "Pterodactyl API",
    "Joocode Developer", 
    "Server Management"
];

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-icon');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
    
    // Set toast type
    toast.className = `toast ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(element, show = true) {
    const btn = element.querySelector('.submit-btn, .login-btn');
    const btnText = element.querySelector('.btn-text');
    const btnLoading = element.querySelector('.btn-loading');
    
    if (show) {
        btn.classList.add('loading');
        btnText.style.opacity = '0';
        btnLoading.style.opacity = '1';
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btnText.style.opacity = '1';
        btnLoading.style.opacity = '0';
        btn.disabled = false;
    }
}

function formatResult(data, type = 'success') {
    const container = document.createElement('div');
    container.className = `result-content ${type}`;
    
    if (type === 'success' && data.panel_url) {
        container.innerHTML = `
            <div class="success-header">
                <i class="fas fa-check-circle"></i>
                <h4>Panel berhasil dibuat!</h4>
            </div>
            <div class="result-details">
                <div class="detail-item">
                    <i class="fas fa-globe"></i>
                    <span><strong>Domain:</strong> ${data.panel_url}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-user"></i>
                    <span><strong>Username:</strong> ${data.username}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-key"></i>
                    <span><strong>Password:</strong> ${data.password}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <span><strong>Email:</strong> ${data.email}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-server"></i>
                    <span><strong>Server ID:</strong> ${data.server_id}</span>
                </div>
            </div>
        `;
    } else if (type === 'error') {
        container.innerHTML = `
            <div class="error-header">
                <i class="fas fa-exclamation-circle"></i>
                <h4>Terjadi kesalahan!</h4>
            </div>
            <div class="error-message">
                ${data.error || data.message || 'Unknown error'}
            </div>
        `;
    }
    
    return container;
}

// Typing animation
function startTypingAnimation() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;
    
    function typeText() {
        if (charIndex < typingTexts[typingIndex].length) {
            typingElement.textContent += typingTexts[typingIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 100);
        } else {
            setTimeout(eraseText, 2000);
        }
    }
    
    function eraseText() {
        if (charIndex > 0) {
            typingElement.textContent = typingTexts[typingIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(eraseText, 50);
        } else {
            typingIndex = (typingIndex + 1) % typingTexts.length;
            setTimeout(typeText, 500);
        }
    }
    
    typeText();
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        currentSection = sectionId;
    }
    
    // Add active class to corresponding nav button
    const navBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
}

// Dashboard initialization
function initializeDashboard() {
    // Navigation event listeners
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            showSection(section);
            
            // Load data for specific sections
            if (section === 'list') {
                loadServers();
            } else if (section === 'list-admin') {
                loadAdmins();
            }
        });
    });
    
    // Form event listeners
    const createPanelForm = document.getElementById('createPanelForm');
    if (createPanelForm) {
        createPanelForm.addEventListener('submit', handleCreatePanel);
    }
    
    const createAdminForm = document.getElementById('createAdminForm');
    if (createAdminForm) {
        createAdminForm.addEventListener('submit', handleCreateAdmin);
    }
    
    // Mobile navigation
    const mobileToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// API functions
async function handleCreatePanel(e) {
    e.preventDefault();
    
    const form = e.target;
    const resultContainer = document.getElementById('createResult');
    
    showLoading(form, true);
    resultContainer.innerHTML = '';
    resultContainer.className = 'result-container';
    
    const formData = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        size: document.getElementById('size').value
    };
    
    try {
        const response = await fetch('/api/create-panel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && !data.error) {
            resultContainer.appendChild(formatResult(data, 'success'));
            resultContainer.classList.add('success');
            showToast('Panel berhasil dibuat!', 'success');
            form.reset();
        } else {
            throw new Error(data.error || 'Gagal membuat panel');
        }
    } catch (error) {
        resultContainer.appendChild(formatResult({ error: error.message }, 'error'));
        resultContainer.classList.add('error');
        showToast('Gagal membuat panel!', 'error');
    } finally {
        showLoading(form, false);
    }
}

async function handleCreateAdmin(e) {
    e.preventDefault();
    
    const form = e.target;
    const resultContainer = document.getElementById('adminResult');
    
    showLoading(form, true);
    resultContainer.innerHTML = '';
    resultContainer.className = 'result-container';
    
    const formData = {
        username: document.getElementById('adminUsername').value.trim(),
        email: document.getElementById('adminEmail').value.trim()
    };
    
    try {
        const response = await fetch('/api/create-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && !data.error) {
            resultContainer.appendChild(formatResult(data, 'success'));
            resultContainer.classList.add('success');
            showToast('Admin berhasil dibuat!', 'success');
            form.reset();
        } else {
            throw new Error(data.error || 'Gagal membuat admin');
        }
    } catch (error) {
        resultContainer.appendChild(formatResult({ error: error.message }, 'error'));
        resultContainer.classList.add('error');
        showToast('Gagal membuat admin!', 'error');
    } finally {
        showLoading(form, false);
    }
}

async function loadServers() {
    const container = document.getElementById('serverList');
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Memuat data server...</span>
        </div>
    `;
    
    try {
        const response = await fetch('/api/servers');
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
            if (data.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-server"></i>
                        <h4>Tidak ada server</h4>
                        <p>Belum ada server yang dibuat.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.map(server => `
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-name">${server.attributes?.name || 'Tanpa Nama'}</div>
                        <div class="item-details">ID: ${server.attributes?.id || 'N/A'}</div>
                    </div>
                    <button class="delete-btn" onclick="deleteServer('${server.attributes?.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } else {
            throw new Error(data.error || 'Gagal memuat data server');
        }
    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h4>Error memuat data</h4>
                <p>${error.message}</p>
                <button onclick="loadServers()" class="retry-btn">Coba Lagi</button>
            </div>
        `;
    }
}

async function loadAdmins() {
    const container = document.getElementById('adminList');
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Memuat data admin...</span>
        </div>
    `;
    
    try {
        const response = await fetch('/api/admins');
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
            const filteredAdmins = data.filter(admin => admin.username && admin.username.trim() !== '');
            
            if (filteredAdmins.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-shield"></i>
                        <h4>Tidak ada admin</h4>
                        <p>Belum ada admin yang dibuat.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = filteredAdmins.map(admin => `
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-name">${admin.username}</div>
                        <div class="item-details">ID: ${admin.id}</div>
                    </div>
                    <button class="delete-btn" onclick="deleteAdmin('${admin.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } else {
            throw new Error(data.error || 'Gagal memuat data admin');
        }
    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h4>Error memuat data</h4>
                <p>${error.message}</p>
                <button onclick="loadAdmins()" class="retry-btn">Coba Lagi</button>
            </div>
        `;
    }
}

async function deleteServer(serverId) {
    if (!confirm('Yakin ingin menghapus server ini?')) return;
    
    try {
        const response = await fetch(`/api/servers/${serverId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Server berhasil dihapus!', 'success');
            loadServers();
        } else {
            throw new Error(data.error || 'Gagal menghapus server');
        }
    } catch (error) {
        showToast('Gagal menghapus server!', 'error');
    }
}

async function deleteAdmin(adminId) {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;
    
    try {
        const response = await fetch(`/api/admins/${adminId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Admin berhasil dihapus!', 'success');
            loadAdmins();
        } else {
            throw new Error(data.error || 'Gagal menghapus admin');
        }
    } catch (error) {
        showToast('Gagal menghapus admin!', 'error');
    }
}

function logout() {
    if (confirm('Yakin ingin keluar?')) {
        window.location.href = '/logout';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add additional CSS for result formatting
    const style = document.createElement('style');
    style.textContent = `
        .result-content {
            width: 100%;
        }
        
        .success-header, .error-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .success-header i {
            color: var(--success);
        }
        
        .error-header i {
            color: var(--error);
        }
        
        .result-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        
        .detail-item i {
            color: var(--primary);
            width: 16px;
        }
        
        .empty-state, .error-state {
            text-align: center;
            padding: 40px;
            color: var(--text-muted);
        }
        
        .empty-state i, .error-state i {
            font-size: 48px;
            margin-bottom: 20px;
            color: var(--text-muted);
        }
        
        .empty-state h4, .error-state h4 {
            margin-bottom: 10px;
            color: var(--text-secondary);
        }
        
        .retry-btn {
            margin-top: 15px;
            padding: 8px 16px;
            background: var(--primary);
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .retry-btn:hover {
            background: var(--secondary);
        }
    `;
    document.head.appendChild(style);
});
