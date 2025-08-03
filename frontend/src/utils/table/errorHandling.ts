/**
 * Error handling utilities for the Chronology frontend
 */

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export class ApiErrorHandler {
  /**
   * Handle API errors and return a standardized error object
   */
  static handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      // Check if it's an API error with status code
      const statusMatch = error.message.match(/API Error (\d+):/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        return {
          message: error.message.replace(/API Error \d+: /, ''),
          status,
          details: error
        };
      }
      
      return {
        message: error.message,
        details: error
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      details: error
    };
  }

  /**
   * Check if an error is a 404 (Not Found) error
   */
  static isNotFoundError(error: unknown): boolean {
    const apiError = this.handleError(error);
    return apiError.status === 404;
  }

  /**
   * Check if an error is a 400 (Bad Request) error
   */
  static isBadRequestError(error: unknown): boolean {
    const apiError = this.handleError(error);
    return apiError.status === 400;
  }

  /**
   * Check if an error is a 422 (Validation Error) error
   */
  static isValidationError(error: unknown): boolean {
    const apiError = this.handleError(error);
    return apiError.status === 422;
  }

  /**
   * Get a user-friendly error message
   */
  static getErrorMessage(error: unknown): string {
    const apiError = this.handleError(error);
    
    // Handle specific error types
    if (apiError.status === 404) {
      return 'The requested resource was not found';
    }
    
    if (apiError.status === 400) {
      return 'Invalid request. Please check your input and try again';
    }
    
    if (apiError.status === 422) {
      return 'Validation error. Please check your input and try again';
    }
    
    if (apiError.status === 500) {
      return 'Server error. Please try again later';
    }
    
    return apiError.message || 'An unexpected error occurred';
  }
} 