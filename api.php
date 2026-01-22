<?php
// API pour recevoir les stats du bot Discord
// Ce fichier reçoit les données du bot et les sauvegarde

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Clé secrète pour sécuriser l'API (à partager uniquement avec le bot)
define('API_SECRET_KEY', 'OrizonBot2026SecretKey123');  // Change cette clé !

// Fonction pour vérifier la clé API
function verify_api_key() {
    $headers = getallheaders();
    $api_key = isset($headers['X-API-Key']) ? $headers['X-API-Key'] : '';
    
    if ($api_key !== API_SECRET_KEY) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Invalid API Key']);
        exit();
    }
}

// Vérifier la clé API pour toutes les requêtes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_api_key();
}

// Routes de l'API
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Route : POST /api.php?action=update_stats
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action'])) {
    
    if ($_GET['action'] === 'update_stats') {
        // Recevoir les stats du bot
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        
        if ($data === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit();
        }
        
        // Sauvegarder dans bot_stats.json
        $result = file_put_contents('bot_stats.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        if ($result !== false) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Stats updated successfully',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save stats']);
        }
    }
    
    elseif ($_GET['action'] === 'update_logs') {
        // Recevoir les logs du bot
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        
        if ($data === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit();
        }
        
        // Charger les logs existants
        $existing_logs = [];
        if (file_exists('bot_logs.json')) {
            $existing_logs = json_decode(file_get_contents('bot_logs.json'), true) ?? [];
        }
        
        // Ajouter le nouveau log au début
        array_unshift($existing_logs, $data);
        
        // Garder seulement les 500 derniers logs
        $existing_logs = array_slice($existing_logs, 0, 500);
        
        // Sauvegarder
        $result = file_put_contents('bot_logs.json', json_encode($existing_logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        if ($result !== false) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Log added successfully',
                'total_logs' => count($existing_logs)
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save log']);
        }
    }
    
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

// Route : GET /api.php?action=get_stats
elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    
    if ($_GET['action'] === 'get_stats') {
        if (file_exists('bot_stats.json')) {
            $stats = file_get_contents('bot_stats.json');
            header('Content-Type: application/json');
            echo $stats;
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Stats not found']);
        }
    }
    
    elseif ($_GET['action'] === 'get_logs') {
        if (file_exists('bot_logs.json')) {
            $logs = file_get_contents('bot_logs.json');
            header('Content-Type: application/json');
            echo $logs;
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Logs not found']);
        }
    }
    
    elseif ($_GET['action'] === 'health') {
        // Endpoint pour vérifier que l'API fonctionne
        echo json_encode([
            'status' => 'OK',
            'message' => 'API is running',
            'version' => '1.0',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

else {
    // Documentation de l'API
    echo json_encode([
        'api' => 'Orizon Bot Stats API',
        'version' => '1.0',
        'endpoints' => [
            'POST /api.php?action=update_stats' => 'Update bot statistics',
            'POST /api.php?action=update_logs' => 'Add a new log entry',
            'GET /api.php?action=get_stats' => 'Get current statistics',
            'GET /api.php?action=get_logs' => 'Get all logs',
            'GET /api.php?action=health' => 'Health check'
        ],
        'authentication' => 'Required header: X-API-Key'
    ]);
}
?>
