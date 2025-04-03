import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import MinimalApp from './MinimalApp.tsx'
import './index.css'

// Wait for the DOM to be ready
const renderApp = () => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found! Delaying render attempt...");
    // Try again in 100ms if the DOM isn't ready
    setTimeout(renderApp, 100);
    return;
  }
  
  const root = createRoot(rootElement);
  
  try {
    // Wrap the App in a custom error boundary
    const ErrorFallback = ({ error }: { error: Error }) => {
      console.error("Application error:", error);
      return <MinimalApp errorMessage={error.message} />;
    };
    
    // Create an error boundary wrapper
    const AppWithErrorHandling = () => {
      try {
        return <App />;
      } catch (error) {
        console.error("Error in App render:", error);
        return <ErrorFallback error={error instanceof Error ? error : new Error('Unknown error')} />;
      }
    };
    
    // Render the app with error handling
    root.render(<AppWithErrorHandling />);
  } catch (error) {
    console.error("Critical rendering error:", error);
    // Fallback to minimal app if even the error boundary fails
    root.render(<MinimalApp errorMessage="Critical rendering error occurred" />);
  }
};

// Start the rendering process
renderApp();
