Response Formats
✅ Success Response (200)
python
return success_response(data=serializer.data)
# → {"success": true, "data": {...}}
return success_response(message="Hotel verified")
# → {"success": true, "message": "Hotel verified"}
return success_response(data=serializer.data, message="Fetched successfully")
# → {"success": true, "message": "Fetched successfully", "data": {...}}
✅ Created Response (201)
python
return created_response(data=serializer.data)
# → {"success": true, "message": "Created successfully", "data": {...}}
return created_response(data=serializer.data, message="User registered")
# → {"success": true, "message": "User registered", "data": {...}}
❌ Error Response (400)
python
return error_response("Invalid input")
# → {"success": false, "message": "Invalid input"}
return error_response("Validation failed", errors={"email": ["Already exists"]})
# → {"success": false, "message": "Validation failed", "errors": {"email": ["Already exists"]}}
❌ Not Found Response (404)
python
return not_found_response("Hotel not found")
# → {"success": false, "message": "Hotel not found"}
❌ Forbidden Response (403)
python
return forbidden_response("You do not have permission")
# → {"success": false, "message": "You do not have permission"}
❌ Server Error Response (500)
python
return server_error_response("Database connection failed")
# → {"success": false, "message": "Database connection failed"}
# paginated responses
 {
  "success": true,
  "message": "Fetched successfully",
  "data": {
    "count": 123,
    "next": "http://...",
    "previous": null,
    "results": [...]
  }
} 