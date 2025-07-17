import { ServerRoute } from '@hapi/hapi';
import { register, login } from '../controllers/auth.controller';

const authRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/register',
    options: { auth: false },
    handler: register,
  },
  {
    method: 'POST',
    path: '/login',
    options: { auth: false },
    handler: login,
  },
];

export default authRoutes;
