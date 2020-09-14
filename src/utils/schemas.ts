import * as yup from 'yup';

export const userSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  role: yup
    .string()
    .matches(
      /(teacher|student)/i,
      'Please select either a student or teacher role.'
    )
    .required(),
});

export const credentialSchema = yup.object().shape({
  email: yup.string().required(),
  password: yup.string().min(6).required(),
});
