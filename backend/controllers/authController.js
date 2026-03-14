import { loginUser, registerUser } from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const payload = req.validated.body;
    const result = await registerUser(payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const payload = req.validated.body;
    const result = await loginUser(payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
