import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/store';

/**
 * Protege las rutas de admin.
 * Acepta 2 formas:
 *   - user.rol === 'admin'
 *   - user.esAdmin === true  ← formato actual del backend
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const esAdmin = user.rol === 'admin' || user.esAdmin === true;

  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;