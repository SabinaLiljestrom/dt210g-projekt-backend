import { Request, ResponseToolkit } from '@hapi/hapi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const register = async (request: Request, h: ResponseToolkit) => {
  try {
    const { username, email, password } = request.payload as {
      username: string;
      email: string;
      password: string;
    };

    // Enkel validering
    if (!username || !email || !password) {
      return h.response({ message: 'Alla fält krävs' }).code(400);
    }
    if (username.trim().length < 3) {
      return h.response({ message: 'Användarnamnet måste vara minst 3 tecken' }).code(400);
    }
    if (password.length < 6) {
      return h.response({ message: 'Lösenordet måste vara minst 6 tecken' }).code(400);
    }

    // Kolla dubbletter
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return h.response({ message: 'Användarnamn eller e-post är redan registrerad' }).code(409);
    }

    // Hasha lösenord
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();

    return h.response({ message: 'Användare skapad!' }).code(201);
  } catch (error: any) {
    console.error('Register error:', error);

    if (error?.code === 11000) {
      return h.response({ message: 'Användarnamn eller e-post är redan registrerad' }).code(409);
    }

    return h.response({ message: 'Serverfel vid registrering' }).code(500);
  }
};

export const login = async (request: Request, h: ResponseToolkit) => {
  try {
    const { identifier, password } = request.payload as {
      identifier: string; // kan vara username ELLER email
      password: string;
    };

    // leta användare via username ELLER email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return h.response({ message: 'Fel användarnamn/e-post eller lösenord' }).code(401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return h.response({ message: 'Fel användarnamn/e-post eller lösenord' }).code(401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY!, {
      expiresIn: '1h',
    });

    return h.response({ token }).code(200);
  } catch (error) {
    console.error('Login error:', error);
    return h.response({ message: 'Serverfel vid inloggning' }).code(500);
  }
};

