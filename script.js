// Charger les statistiques depuis bot_stats.json
async function loadStats() {
    try {
        const response = await fetch('bot_stats.json');
        const data = await response.json();
        
        // Animer les compteurs
        animateValue('servers-count', 0, data.total_guilds || 1, 2000);
        animateValue('users-count', 0, data.total_users || 100, 2000);
        animateValue('commands-count', 0, data.total_commands || 120, 2000);
        
        // Mettre à jour la date
        if (data.last_update) {
            const date = new Date(data.last_update);
            document.getElementById('last-update-time').textContent = 
                date.toLocaleString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
        }
    } catch (error) {
        console.log('Stats non chargées, utilisation des valeurs par défaut');
        // Valeurs par défaut si le fichier n'existe pas encore
        animateValue('servers-count', 0, 1, 2000);
        animateValue('users-count', 0, 100, 2000);
        animateValue('commands-count', 0, 120, 2000);
        document.getElementById('last-update-time').textContent = 'Bientôt disponible';
    }
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Charger les stats au chargement de la page
window.addEventListener('load', loadStats);

// Recharger les stats toutes les 30 secondes
setInterval(loadStats, 30000);

// Smooth scroll pour les liens
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
