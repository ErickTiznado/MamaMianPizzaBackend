# Wompi Payment Gateway Configuration
# Add these variables to your existing .env file

# Wompi API Credentials
WOMPI_APP_ID=116288d1-10ee-47c4-8969-a7fd0c671c40
WOMPI_API_SECRET=249aca7c-8a8f-48ca-acda-a28d4a9ea0fc

# Wompi Redirect URLs (update with your actual domain)
WOMPI_REDIRECT_SUCCESS=https://mamamianpizza.com/payment/success
WOMPI_REDIRECT_FAILURE=https://mamamianpizza.com/payment/failure

# Wompi Webhook URL (must be publicly accessible)
WOMPI_WEBHOOK_URL=https://api.mamamianpizza.com/api/payments/webhook

# Example URLs for development:
# WOMPI_REDIRECT_SUCCESS=http://localhost:5173/payment/success
# WOMPI_REDIRECT_FAILURE=http://localhost:5173/payment/failure
# WOMPI_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/payments/webhook

# Note: For development, you can use ngrok to expose your local server:
# 1. Install ngrok: npm install -g ngrok
# 2. Run your server: npm start
# 3. In another terminal: ngrok http 3001
# 4. Use the https URL provided by ngrok for WOMPI_WEBHOOK_URL
