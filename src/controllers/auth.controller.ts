import { Request, ResponseToolkit } from '@hapi/hapi';

export const register = async (request: Request, h: ResponseToolkit) => {
  return h.response({ message: 'Registrering funkar' }).code(201);
};

export const login = async (request: Request, h: ResponseToolkit) => {
  return h.response({ token: 'fake-token' }).code(200);
};
