import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export const useFirebaseAnalyticsEvents = () => {
  useEffect(() => {
    if (analytics) {
      // Log page views
      logEvent(analytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }, []);

  const logUserEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, eventName, {
        ...eventParams,
        timestamp: new Date().toISOString()
      });
    }
  };

  const logFeatureUsage = (featureName: string, params?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, 'feature_usage', {
        feature_name: featureName,
        ...params,
        timestamp: new Date().toISOString()
      });
    }
  };

  const logError = (error: Error, context?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, 'error', {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
        timestamp: new Date().toISOString()
      });
    }
  };

  const logUserAction = (action: string, params?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, 'user_action', {
        action,
        ...params,
        timestamp: new Date().toISOString()
      });
    }
  };

  const logPerformanceMetric = (metricName: string, value: number, params?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, 'performance_metric', {
        metric_name: metricName,
        value,
        ...params,
        timestamp: new Date().toISOString()
      });
    }
  };

  return {
    logUserEvent,
    logFeatureUsage,
    logError,
    logUserAction,
    logPerformanceMetric
  };
}; 