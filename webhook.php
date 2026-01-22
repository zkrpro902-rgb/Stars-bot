<?php
/**
 * WEBHOOK SIMPLE POUR ORIZON BOT
 * Reçoit les stats du bot et les sauvegarde
 * Pas besoin de clé API, ultra-simple !
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// GET : Vérifier que le webhook fonctionne
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'OK',
        'message' => 'Webhook is running',
        'version' => '1.0',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// POST : Recevoir les données du bot
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Lire les données envoyées
    $json_data = file_get_contents('php://input');
    
    // Vérifier que c'est du JSON valide
    $data = json_decode($json_data, true);
    
    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit();
    }
    
    // Déterminer le type de données (stats ou logs)
    if (isset($data['total_guilds']) || isset($data['total_users'])) {
        // C'est des stats
        $filename = 'bot_stats.json';
        $type = 'stats';
    } else if (isset($data['timestamp']) && isset($data['type']) && isset($data['message'])) {
        // C'est un log
        $filename = 'bot_logs.json';
        $type = 'log';
        
        // Pour les logs, on ajoute au fichier existant
        $existing_logs = [];
        if (file_exists($filename)) {
            $existing_content = file_get_contents($filename);
            $existing_logs = json_decode($existing_content, true) ?? [];
        }
        
        // Ajouter le nouveau log au début
        array_unshift($existing_logs, $data);
        
        // Garder seulement les 500 derniers
        $existing_logs = array_slice($existing_logs, 0, 500);
        
        // Convertir en JSON
        $json_data = json_encode($existing_logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        // Type inconnu, on sauvegarde quand même
        $filename = 'bot_data.json';
        $type = 'unknown';
    }
    
    // Sauvegarder dans le fichier
    $result = file_put_contents($filename, $json_data);
    
    if ($result !== false) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => ucfirst($type) . ' received and saved',
            'filename' => $filename,
            'size' => $result,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to save data',
            'filename' => $filename
        ]);
    }
    
} else {
    // Méthode non supportée
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
