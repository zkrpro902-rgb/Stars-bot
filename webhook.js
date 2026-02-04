// Fonction Netlify Serverless pour recevoir les stats du bot
// Remplace webhook.php pour fonctionner sur Netlify

const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gestion OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // GET : Health check
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'OK',
        message: 'Netlify Webhook is running',
        version: '1.0',
        timestamp: new Date().toISOString()
      })
    };
  }

  // POST : Recevoir les données
  if (event.httpMethod === 'POST') {
    try {
      // Parser les données
      const data = JSON.parse(event.body);

      // Déterminer le type de données
      let filename;
      let responseMessage;

      if (data.total_guilds !== undefined || data.total_users !== undefined) {
        // C'est des stats
        filename = 'bot_stats.json';
        responseMessage = 'Stats received and saved';
        
        // Sauvegarder les stats
        await fs.writeFile(
          path.join('/tmp', filename),
          JSON.stringify(data, null, 2)
        );

      } else if (data.timestamp && data.type && data.message) {
        // C'est un log
        filename = 'bot_logs.json';
        responseMessage = 'Log received and saved';

        // Charger les logs existants
        let logs = [];
        try {
          const existingData = await fs.readFile(path.join('/tmp', filename), 'utf8');
          logs = JSON.parse(existingData);
        } catch (err) {
          // Fichier n'existe pas encore
        }

        // Ajouter le nouveau log
        logs.unshift(data);

        // Garder seulement les 500 derniers
        logs = logs.slice(0, 500);

        // Sauvegarder
        await fs.writeFile(
          path.join('/tmp', filename),
          JSON.stringify(logs, null, 2)
        );

      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid data format' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: responseMessage,
          filename: filename,
          timestamp: new Date().toISOString()
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Internal server error',
          details: error.message
        })
      };
    }
  }

  // Méthode non supportée
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
