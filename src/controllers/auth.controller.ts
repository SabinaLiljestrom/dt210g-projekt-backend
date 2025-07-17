import { Request, ResponseToolkit } from '@hapi/hapi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const register = async (request: Request, h: ResponseToolkit) => {
  try {
    const { username, password } = request.payload as { username: string; password: string };

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return h.response({ message: 'Användarnamnet är upptaget' }).code(400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    return h.response({ message: 'Användare skapad!' }).code(201);
  } catch (error) {
    console.error('Register error:', error);
    return h.response({ message: 'Serverfel vid registrering' }).code(500);
  }
};

export const login = async (request: Request, h: ResponseToolkit) => {
  try {
    const { username, password } = request.payload as { username: string; password: string };

    const user = await User.findOne({ username });
    if (!user) {
      return h.response({ message: 'Fel användarnamn eller lösenord' }).code(401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return h.response({ message: 'Fel användarnamn eller lösenord' }).code(401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY!, { expiresIn: '1h' });

    return h.response({ token }).code(200);
  } catch (error) {
    console.error('Login error:', error);
    return h.response({ message: 'Serverfel vid inloggning' }).code(500);
  }
};
