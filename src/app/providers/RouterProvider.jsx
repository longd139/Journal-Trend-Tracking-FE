import { RouterProvider } from 'react-router-dom';
import { router } from '../router.jsx';

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
