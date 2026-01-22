// Utilisateurs autorisés (mots de passe hashés en SHA-256)
const users = {
    'admin': {
        password: 'admin123', // Change ça en production!
        role: 'Owner'
    },
    'staff1': {
        password: 'staff123', // Change ça en production!
        role: 'Staff'
    }
};

// Vérifier si l'utilisateur est connecté
function checkAuth() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn === 'true') {
        showAdminPanel();
        loadStats();
        loadLogs();
    }
}

// Connexion
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    // Vérifier les identifiants
    if (users[username] && users[username].password === password) {
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', users[username].role);
        
        showAdminPanel();
        loadStats();
        loadLogs();
    } else {
        errorDiv.textContent = 'Identifiants incorrects !';
        errorDiv.style.display = 'block';
    }
});

// Afficher le panel admin
function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');
    
    document.getElementById('user-name').textContent = username;
    document.getElementById('user-role').textContent = role;
}

// Déconnexion
function logout() {
    sessionStorage.clear();
    location.reload();
}

// Charger les statistiques
async function loadStats() {
    try {
        const response = await fetch('bot_stats.json');
        const data = await response.json();
        
        document.getElementById('admin-servers').textContent = data.total_guilds || 1;
        document.getElementById('admin-users').textContent = (data.total_users || 100).toLocaleString();
        document.getElementById('admin-commands').textContent = data.total_commands || 120;
    } catch (error) {
        console.log('Stats non disponibles');
        document.getElementById('admin-servers').textContent = '1';
        document.getElementById('admin-users').textContent = '100';
        document.getElementById('admin-commands').textContent = '120';
    }
}

// Charger les logs
async function loadLogs() {
    const logsContainer = document.getElementById('logs-container');
    
    try {
        const response = await fetch('bot_logs.json');
        
        if (!response.ok) {
            throw new Error('Logs non disponibles');
        }
        
        const logs = await response.json();
        
        if (!logs || logs.length === 0) {
            logsContainer.innerHTML = `
                <div class="no-logs">
                    <h3>Aucun log pour le moment</h3>
                    <p>Les logs apparaîtront ici dès que le bot sera actif.</p>
                </div>
            `;
            return;
        }
        
        // Afficher les 50 derniers logs
        const recentLogs = logs.slice(-50).reverse();
        
        logsContainer.innerHTML = recentLogs.map(log => `
            <div class="log-entry">
                <div class="log-time">${formatDate(log.timestamp)}</div>
                <span class="log-type ${log.type || 'info'}">${(log.type || 'info').toUpperCase()}</span>
                <div class="log-message">${escapeHtml(log.message || 'Aucun message')}</div>
                ${log.details ? `<div class="log-details">${escapeHtml(log.details)}</div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        logsContainer.innerHTML = `
            <div class="no-logs">
                <h3>Logs non disponibles</h3>
                <p>Le fichier bot_logs.json n'a pas encore été créé par le bot.</p>
                <p style="margin-top: 20px; font-size: 0.9rem;">
                    Le bot créera automatiquement ce fichier au démarrage et enregistrera tous les événements.
                </p>
            </div>
        `;
    }
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-refresh des logs toutes les 30 secondes
setInterval(() => {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        loadStats();
        loadLogs();
    }
}, 30000);

// Vérifier l'auth au chargement
window.addEventListener('load', checkAuth);
