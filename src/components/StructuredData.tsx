import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Service' | 'Article';
  data: Record<string, any>;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type,
      ...data
    };

    // Create script element for structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = `structured-data-${type.toLowerCase()}`;

    // Remove existing script if it exists
    const existingScript = document.getElementById(script.id);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    // Add new script
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(script.id);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [type, data]);

  return null;
};

export default StructuredData;