import { useEffect } from 'react';
import { getPerformance, trace, Trace } from 'firebase/performance';

export const useFirebasePerformance = () => {
  useEffect(() => {
    const perf = getPerformance();
    if (perf) {
      // Start a trace for page load
      const pageLoadTrace = trace(perf, 'page_load');
      pageLoadTrace.start();

      // Stop the trace when the component unmounts
      return () => {
        pageLoadTrace.stop();
      };
    }
  }, []);

  const startTrace = (traceName: string): Trace => {
    const perf = getPerformance();
    if (!perf) {
      throw new Error('Firebase Performance is not initialized');
    }
    const newTrace = trace(perf, traceName);
    newTrace.start();
    return newTrace;
  };

  const stopTrace = (traceInstance: Trace) => {
    traceInstance.stop();
  };

  return { startTrace, stopTrace };
}; 