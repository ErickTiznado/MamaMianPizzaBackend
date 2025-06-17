#!/bin/bash

# ================================================================
# ADMIN MANAGEMENT API - COMPREHENSIVE TESTING SCRIPT
# ================================================================
# This script tests all CRUD endpoints for administrator management
# Make sure your server is running on http://localhost:3000
# ================================================================

BASE_URL="http://localhost:3000/api/users"
CONTENT_TYPE="Content-Type: application/json"

echo "🔧 TESTING ADMIN MANAGEMENT SYSTEM"
echo "=================================="
echo "Base URL: $BASE_URL"
echo "=================================="

# Test variables
ADMIN_ID=""
TEST_EMAIL="admin.test@mamamianpizza.com"

echo ""
echo "1️⃣  TESTING: Create New Admin"
echo "----------------------------"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/admins" \
  -H "$CONTENT_TYPE" \
  -d '{
    "nombre": "Test Admin",
    "correo": "'$TEST_EMAIL'",
    "contrasena": "AdminTest123!",
    "rol": "admin",
    "celular": "+503 7000-1234"
  }')

echo "Response: $CREATE_RESPONSE"

# Extract admin ID for subsequent tests
ADMIN_ID=$(echo $CREATE_RESPONSE | grep -o '"id_admin":[0-9]*' | cut -d':' -f2)
echo "Created Admin ID: $ADMIN_ID"

echo ""
echo "2️⃣  TESTING: Get All Admins (with pagination)"
echo "--------------------------------------------"

GET_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL/admins/all?page=1&limit=5")
echo "Response: $GET_ALL_RESPONSE"

echo ""
echo "3️⃣  TESTING: Get All Admins (with role filter)"
echo "---------------------------------------------"

GET_FILTERED_RESPONSE=$(curl -s -X GET "$BASE_URL/admins/all?rol=admin&activo=true")
echo "Response: $GET_FILTERED_RESPONSE"

echo ""
echo "4️⃣  TESTING: Get Admin by ID"
echo "---------------------------"

if [ ! -z "$ADMIN_ID" ]; then
    GET_BY_ID_RESPONSE=$(curl -s -X GET "$BASE_URL/admins/$ADMIN_ID")
    echo "Response: $GET_BY_ID_RESPONSE"
else
    echo "❌ Cannot test - Admin ID not found"
fi

echo ""
echo "5️⃣  TESTING: Update Admin"
echo "------------------------"

if [ ! -z "$ADMIN_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/admins/$ADMIN_ID" \
      -H "$CONTENT_TYPE" \
      -d '{
        "nombre": "Test Admin Updated",
        "celular": "+503 7000-5678",
        "rol": "moderador"
      }')
    echo "Response: $UPDATE_RESPONSE"
else
    echo "❌ Cannot test - Admin ID not found"
fi

echo ""
echo "6️⃣  TESTING: Get Admin Stats"
echo "---------------------------"

STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/admins/stats")
echo "Response: $STATS_RESPONSE"

echo ""
echo "7️⃣  TESTING: Toggle Admin Status (Deactivate)"
echo "--------------------------------------------"

if [ ! -z "$ADMIN_ID" ]; then
    TOGGLE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/admins/$ADMIN_ID/toggle-status")
    echo "Response: $TOGGLE_RESPONSE"
else
    echo "❌ Cannot test - Admin ID not found"
fi

echo ""
echo "8️⃣  TESTING: Toggle Admin Status (Reactivate)"
echo "--------------------------------------------"

if [ ! -z "$ADMIN_ID" ]; then
    TOGGLE_RESPONSE2=$(curl -s -X PATCH "$BASE_URL/admins/$ADMIN_ID/toggle-status")
    echo "Response: $TOGGLE_RESPONSE2"
else
    echo "❌ Cannot test - Admin ID not found"
fi

echo ""
echo "9️⃣  TESTING: Soft Delete Admin"
echo "-----------------------------"

if [ ! -z "$ADMIN_ID" ]; then
    SOFT_DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/admins/$ADMIN_ID" \
      -H "$CONTENT_TYPE" \
      -d '{"hard_delete": false}')
    echo "Response: $SOFT_DELETE_RESPONSE"
else
    echo "❌ Cannot test - Admin ID not found"
fi

echo ""
echo "🔟 TESTING: Error Cases"
echo "----------------------"

echo "📝 Testing invalid admin ID:"
INVALID_ID_RESPONSE=$(curl -s -X GET "$BASE_URL/admins/invalid_id")
echo "Response: $INVALID_ID_RESPONSE"

echo ""
echo "📝 Testing non-existent admin:"
NONEXISTENT_RESPONSE=$(curl -s -X GET "$BASE_URL/admins/99999")
echo "Response: $NONEXISTENT_RESPONSE"

echo ""
echo "📝 Testing invalid role:"
INVALID_ROLE_RESPONSE=$(curl -s -X POST "$BASE_URL/admins" \
  -H "$CONTENT_TYPE" \
  -d '{
    "nombre": "Invalid Role Admin",
    "correo": "invalid@test.com",
    "contrasena": "Password123!",
    "rol": "invalid_role"
  }')
echo "Response: $INVALID_ROLE_RESPONSE"

echo ""
echo "📝 Testing duplicate email:"
DUPLICATE_EMAIL_RESPONSE=$(curl -s -X POST "$BASE_URL/admins" \
  -H "$CONTENT_TYPE" \
  -d '{
    "nombre": "Duplicate Email Admin",
    "correo": "'$TEST_EMAIL'",
    "contrasena": "Password123!",
    "rol": "admin"
  }')
echo "Response: $DUPLICATE_EMAIL_RESPONSE"

echo ""
echo "✅ TESTING COMPLETED"
echo "==================="
echo "Review the responses above to verify all endpoints are working correctly."
echo "Note: The test admin created may be deactivated at the end of testing."
