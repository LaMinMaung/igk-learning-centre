import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * Drop this component anywhere inside <BrowserRouter>.
 * It renders nothing — only activates the analytics hook.
 */
const Analytics: React.FC = () => {
  useAnalytics();
  return null;
};

export default Analytics;