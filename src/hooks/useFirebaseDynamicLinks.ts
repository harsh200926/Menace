import { useState, useEffect } from 'react';
import { getDynamicLinks, onLink, DynamicLink } from 'firebase/dynamic-links';
import { auth } from '@/lib/firebase';

export const useFirebaseDynamicLinks = () => {
  const [initialLink, setInitialLink] = useState<DynamicLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDynamicLinks = async () => {
      try {
        const dynamicLinks = getDynamicLinks(auth.app);
        
        // Get initial link if app was opened from a dynamic link
        const initialLink = await dynamicLinks.getInitialLink();
        if (initialLink) {
          setInitialLink(initialLink);
        }

        // Listen for dynamic link events
        const unsubscribe = onLink(dynamicLinks, (link) => {
          setInitialLink(link);
        });

        return () => {
          unsubscribe();
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Dynamic Links'));
      } finally {
        setLoading(false);
      }
    };

    initDynamicLinks();
  }, []);

  const createDynamicLink = async (params: {
    link: string;
    domainUriPrefix: string;
    androidPackageName?: string;
    iosBundleId?: string;
    socialMetaTagInfo?: {
      title?: string;
      description?: string;
      imageUrl?: string;
    };
  }): Promise<string> => {
    try {
      const dynamicLinks = getDynamicLinks(auth.app);
      const link = await dynamicLinks.buildShortLink({
        ...params,
        dynamicLinkDomain: params.domainUriPrefix
      });
      return link;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create dynamic link'));
      throw err;
    }
  };

  return {
    initialLink,
    loading,
    error,
    createDynamicLink
  };
}; 