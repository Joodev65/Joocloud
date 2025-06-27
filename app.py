import os
import logging
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import requests

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "joocode-panel-secret-key-2025")

# Hardcoded user accounts (as per original design)
USERS = [
    {
        "nama": "joodev",
        "password": "joodev123",
        "ip": "1.1.1.1",
        "kategori": "pt"
    },
    {
        "nama": "selleracc",
        "password": "reseller-321",
        "ip": "10.10.10.10.10.10.10",
        "kategori": "seller"
    }
]

# External API base URL
API_BASE_URL = "https://solid-hammerhead-petalite.glitch.me"

@app.route('/')
def index():
    """Login page"""
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    """Handle login authentication"""
    data = request.get_json()
    nama = data.get('nama', '').strip()
    password = data.get('password', '').strip()
    ip = data.get('ip', '').strip()
    
    # Find matching user
    user = next((u for u in USERS if u['nama'] == nama and u['password'] == password and u['ip'] == ip), None)
    
    if user:
        session['logged_in'] = True
        session['role'] = user['kategori']
        session['nama'] = user['nama']
        return jsonify({'success': True, 'redirect': url_for('dashboard')})
    else:
        return jsonify({'success': False, 'error': 'Login gagal! Data tidak cocok.'})

@app.route('/dashboard')
def dashboard():
    """Main dashboard page"""
    if not session.get('logged_in'):
        return redirect(url_for('index'))
    
    user_role = session.get('role')
    user_name = session.get('nama')
    
    return render_template('dashboard.html', role=user_role, name=user_name)

@app.route('/logout')
def logout():
    """Logout and clear session"""
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/create-panel', methods=['POST'])
def create_panel():
    """Create a new panel via external API"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    username = data.get('username', '').lower()
    email = data.get('email', '').lower()
    size = data.get('size', '')
    
    # Convert size to RAM in MB
    ram_values = {
        "1gb": 1024, "2gb": 2048, "3gb": 3072, "4gb": 4096,
        "5gb": 5120, "6gb": 6144, "7gb": 7168, "8gb": 8192,
        "9gb": 9216, "10gb": 10240, "unlimited": 0
    }
    
    ram = ram_values.get(size, 1024)
    
    try:
        response = requests.post(f"{API_BASE_URL}/create", 
                               json={'username': username, 'email': email, 'ram': ram},
                               timeout=30)
        
        if response.headers.get('content-type') and 'application/json' in response.headers.get('content-type'):
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Server error: Invalid response format'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500

@app.route('/api/servers')
def get_servers():
    """Get list of servers"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        response = requests.get(f"{API_BASE_URL}/servers", timeout=30)
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500

@app.route('/api/servers/<server_id>', methods=['DELETE'])
def delete_server(server_id):
    """Delete a server"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        response = requests.delete(f"{API_BASE_URL}/server/{server_id}", timeout=30)
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500

@app.route('/api/create-admin', methods=['POST'])
def create_admin():
    """Create a new admin"""
    if not session.get('logged_in') or session.get('role') != 'pt':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    
    try:
        response = requests.post(f"{API_BASE_URL}/create-admin",
                               json={'username': username, 'email': email},
                               timeout=30)
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500

@app.route('/api/admins')
def get_admins():
    """Get list of admins"""
    if not session.get('logged_in') or session.get('role') != 'pt':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        response = requests.get(f"{API_BASE_URL}/admins", timeout=30)
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500

@app.route('/api/admins/<admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    """Delete an admin"""
    if not session.get('logged_in') or session.get('role') != 'pt':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        response = requests.delete(f"{API_BASE_URL}/admin/{admin_id}", timeout=30)
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Connection error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
