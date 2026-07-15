// Centralized API service for handling all fetch requests

const handleResponse = async (response) => {
    // If the response is not ok, throw an error
    if (!response.ok) {
        // Try to parse json error message
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (e) {
            // If it's not JSON, throw generic error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    // Try to parse JSON response
    try {
        const data = await response.json();
        return data;
    } catch (e) {
        return { success: true }; // Probably empty or non-JSON success response
    }
};

const api = {
    get: async (endpoint) => {
        try {
            const response = await fetch(`/api${endpoint}`);
            return handleResponse(response);
        } catch (error) {
            console.error(`API GET ${endpoint} error:`, error);
            throw error;
        }
    },
    
    post: async (endpoint, data) => {
        try {
            const response = await fetch(`/api${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`API POST ${endpoint} error:`, error);
            throw error;
        }
    },

    postFormData: async (endpoint, formData) => {
        try {
            // Do not set Content-Type header for FormData, browser sets it with boundary
            const response = await fetch(`/api${endpoint}`, {
                method: 'POST',
                body: formData,
            });
            return handleResponse(response);
        } catch (error) {
            console.error(`API POST FormData ${endpoint} error:`, error);
            throw error;
        }
    }
};

export default api;
