export const useAPIHelper = () => {
    /**
     * Extracts the core data from the API response.
     * Fallback to the response itself if 'data' key is missing.
     */
    const getData = <T>(response: any): T => {
        return response?.data ?? response;
    }

    /**
     * Extracts a list of results from the API response.
     * Use this for paginated responses or lists wrapped in 'data'.
     */
    const getResults = <T>(response: any): T[] => {
        // Check for nested structure: { data: { results: [...] } } or { data: [...] } or { results: [...] }
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        return response?.data?.results ?? response?.results ?? [];
    }

    /**
     * Extracts the success message from the API response.
     */
    const getMessage = (response: any): string => {
        return response?.message || "Operation successful";
    }

    /**
     * Standardized error message extraction.
     * Prioritizes the new error format: { success: false, message: "...", errors: {...} }
     */
    const getErrorMessage = (error: any): string => {
        // Handle new formatted errors (often in error.data or error.response._data)
        const errData = error?.data || error?.response?._data;

        if (errData?.message) {
            return errData.message;
        }

        // Fallback for standard error objects or simple strings
        return error?.message || "An unexpected error occurred";
    }

    /**
     * Extracts paginated results from the API response.
     * Returns { count, next, previous, results }.
     */
    const getPaginatedResults = <T>(response: any) => {
        const data = response?.data || response;
        return {
            count: data?.count || 0,
            next: data?.next || null,
            previous: data?.previous || null,
            results: (data?.results || (Array.isArray(data) ? data : [])) as T[]
        };
    }

    return { getData, getResults, getPaginatedResults, getMessage, getErrorMessage };
}
