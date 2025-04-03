import { useEffect } from 'react';
import { getPerformance, trace, Trace } from 'firebase/performance';
import { auth } from '@/lib/firebase';

export const useFirebasePerformanceMonitoring = () => {
  const perf = getPerformance(auth.app);

  useEffect(() => {
    // Start a trace for page load
    const pageLoadTrace = trace(perf, 'page_load');
    pageLoadTrace.start();

    // Stop the trace when the component unmounts
    return () => {
      pageLoadTrace.stop();
    };
  }, []);

  const startTrace = (traceName: string): Trace => {
    const newTrace = trace(perf, traceName);
    newTrace.start();
    return newTrace;
  };

  const stopTrace = (traceInstance: Trace) => {
    traceInstance.stop();
  };

  const measurePerformance = async <T>(
    traceName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const traceInstance = startTrace(traceName);
    try {
      const result = await operation();
      return result;
    } finally {
      stopTrace(traceInstance);
    }
  };

  const measureSyncPerformance = <T>(
    traceName: string,
    operation: () => T
  ): T => {
    const traceInstance = startTrace(traceName);
    try {
      const result = operation();
      return result;
    } finally {
      stopTrace(traceInstance);
    }
  };

  return {
    startTrace,
    stopTrace,
    measurePerformance,
    measureSyncPerformance
  };
}; 