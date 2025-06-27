from app import app

# For Vercel compatibility
application = app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
