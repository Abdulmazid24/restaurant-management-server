/**
 * Standard API Response class for consistent response format
 */
class ApiResponse {
    constructor(statusCode, data = null, message = 'Success') {
        this.success = statusCode >= 200 && statusCode < 300;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    /**
     * Success response - 200
     */
    static success(data, message = 'Operation successful') {
        return new ApiResponse(200, data, message);
    }

    /**
     * Created response - 201
     */
    static created(data, message = 'Resource created successfully') {
        return new ApiResponse(201, data, message);
    }

    /**
     * No Content response - 204
     */
    static noContent(message = 'No content') {
        return new ApiResponse(204, null, message);
    }

    /**
     * Paginated response
     */
    static paginated(data, pagination, message = 'Success') {
        const response = new ApiResponse(200, data, message);
        response.pagination = pagination;
        return response;
    }
}

module.exports = ApiResponse;
