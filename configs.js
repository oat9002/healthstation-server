
module.exports = {
    'database_url': 'mongodb://127.0.0.1:27017/healthcare',
    'secret': 'eypZAZy0CY^g9%KreypZAZy0CY^g9%Kr',
    'facebook_auth' : {
        'client_id'      : '448792645469640', // your App ID
        'client_secret'  : 'aaa6bf55251d811f622a279bafff391c', // your App Secret
        'callback_url'   : 'http://localhost:8080/api/auth/facebook/callback'
    },
    'hashsalt' : 10,
    'log_root': '/var/logs/healthios_server',
    'log_module': ['finger_print', 'health_data', 'provider', 'station', 'user', 'api']
}