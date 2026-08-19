import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4">
    <p className="text-8xl font-black text-gray-800 select-none">404</p>
    <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
    <p className="mt-2 text-gray-400 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg
                 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold
                 transition-colors duration-200"
    >
      ← Back to Home
    </Link>
  </div>
);

export default NotFound;
