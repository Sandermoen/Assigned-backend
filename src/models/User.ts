import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import uniqueValidator from 'mongoose-unique-validator';
const Schema = mongoose.Schema;

import { IUserDocument } from '../types';

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: String,
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
  transform: (_, returnedObject: IUserDocument): void => {
    const id = returnedObject._id as string;
    returnedObject.id = id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

userSchema.pre<IUserDocument>('save', async function (next) {
  if (this.isNew) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
  }
  next();
});

const UserModel = mongoose.model<IUserDocument>('User', userSchema);
export default UserModel;
