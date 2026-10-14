import { validationResult } from 'express-validator';

export function handleErrors(req, res, next) {
  const r = validationResult(req);
  if (!r.isEmpty()) {
    return res.status(406).json({ errors: r.mapped() });
    //res.redirect('/auth/register');
  }
  return next();
}