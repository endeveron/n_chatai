import { Schema, model, models } from 'mongoose';

import { Person } from '@/core/features/chat/types/person';

const personSchema = new Schema<Person>(
  {
    title: { type: String, required: true },
    gender: { type: String, required: true },
    avatarKey: { type: String, required: true },
    personKey: { type: String, required: true },
    status: { type: String, required: true },
    bio: { type: String, required: true },
    avatarBlur: { type: String, required: true },
    imgBlur: { type: String, required: true },
    instructions: { type: String, required: true },
    accuracy: { type: Number, required: true },
    context: [{ type: String, required: true }],
  },
  {
    versionKey: false,
  }
);

const PersonModel = models.Person || model('Person', personSchema);

export default PersonModel;
