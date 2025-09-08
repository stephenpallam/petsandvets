/**
 * Utility functions for date formatting
 * UPDATED: v3.0 - Business timezone dates (no conversion needed)
 * Backend now stores all dates in business timezone directly
 */

console.log('dateUtils.js v3.0 loaded - Business timezone dates (no conversion)');

/**
 * Format a date string - dates are already in business timezone from backend
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Simple formatting - no timezone conversion needed
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date with time - dates are already in business timezone from backend
 */
export const formatDateWithTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date with time:', error);
    return dateString;
  }
};

/**
 * Format a scheduled date in a user-friendly way
 * Dates are already in business timezone from backend
 * Examples:
 * - Today at 9:00 AM
 * - Tomorrow at 2:30 PM
 * - Monday, September 4th, 2023 at 11:15 AM
 */
export const formatScheduledDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Compare dates (simple date comparison)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Get formatted time
    const timeFormat = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
    
    // Check if it's today, tomorrow, or another day
    if (scheduleDate.getTime() === today.getTime()) {
      return `Today at ${timeFormat}`;
    } else if (scheduleDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${timeFormat}`;
    } else {
      // Get day of week, month, and year
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      const year = date.getFullYear();
      
      // Add ordinal suffix
      const ordinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      
      return `${dayOfWeek}, ${month} ${day}${ordinalSuffix(day)}, ${year} at ${timeFormat}`;
    }
  } catch (error) {
    console.error('Error formatting scheduled date:', error);
    // Fallback to simple format
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (fallbackError) {
      return dateString;
    }
  }
};

/**
 * Format a relative time (e.g., "2 hours ago", "in 3 days")
 * Dates are already in business timezone from backend
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInMinutes = Math.round(diffInMs / (1000 * 60));
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInMinutes) < 60) {
      if (diffInMinutes === 0) return 'now';
      return diffInMinutes > 0 ? `in ${diffInMinutes} minutes` : `${Math.abs(diffInMinutes)} minutes ago`;
    } else if (Math.abs(diffInHours) < 24) {
      return diffInHours > 0 ? `in ${diffInHours} hours` : `${Math.abs(diffInHours)} hours ago`;
    } else {
      return diffInDays > 0 ? `in ${diffInDays} days` : `${Math.abs(diffInDays)} days ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};