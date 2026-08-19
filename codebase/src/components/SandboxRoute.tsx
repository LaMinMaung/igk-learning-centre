/**
 * SandboxRoute — Guard for dev/staging-only routes
 * Redirects to "/" in production or when sandboxRoutes flag is off.
 */
import { Navigate } from 'react-router-dom';
import { config } from '../lib/config';
import { featureFlags } from '../lib/featureFlags';

interface Props { children: React.ReactNode }

const SandboxRoute = ({ children }: Props) => {
  if (config.isProd || !featureFlags.sandboxRoutes) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default SandboxRoute;
