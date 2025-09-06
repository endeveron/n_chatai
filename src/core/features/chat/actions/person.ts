'use server';

import { Types } from 'mongoose';

import ChatModel from '@/core/features/chat/models/chat';
import PersonModel from '@/core/features/chat/models/person';
import {
  AvatarKey,
  PersonCardData,
  PersonDataForLLM,
} from '@/core/features/chat/types/person';
import { mongoDB } from '@/core/lib/mongo';
import { ServerActionResult } from '@/core/types/common';
import { handleActionError } from '@/core/utils/error';

/**
 * Retrieves a list of people from a MongoDB database and returns it in a
 * specific format.
 * @returns A `Promise` that resolves to a `ServerActionResult`
 * object containing an array of `PersonCardData` or `undefined`.
 */
export const getPeople = async (
  userId: string
): Promise<ServerActionResult<PersonCardData[]>> => {
  try {
    await mongoDB.connect();

    // Find chats, populate person
    const userChats = await ChatModel.find({ user: userId }).populate({
      path: 'person',
      model: PersonModel,
      select: 'avatarKey',
    });

    let avatarKeys: AvatarKey[] = [];

    if (userChats.length) {
      avatarKeys = userChats.map((c) => c.person.avatarKey);
    }

    let people = await PersonModel.find()
      .sort({ _id: 1 }) // Ascending (oldest to newest)
      .select('_id title gender avatarKey personKey status imgBlur');

    if (avatarKeys.length) {
      people = people.filter((p) => !avatarKeys.includes(p.avatarKey));
    }

    const peopleData: PersonCardData[] = people.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      gender: p.gender,
      avatarKey: p.avatarKey,
      personKey: p.personKey,
      status: p.status,
      imgBlur: p.imgBlur,
    }));

    return {
      success: true,
      data: peopleData,
    };
  } catch (err: unknown) {
    return handleActionError('Could not get person list', err);
  }
};

export const getPersonDataForLLM = async ({
  chatId,
}: {
  chatId: Types.ObjectId | string;
}): Promise<ServerActionResult<PersonDataForLLM>> => {
  try {
    await mongoDB.connect();

    // Find a chat by id
    const chat = await ChatModel.findById(chatId).populate({
      path: 'person',
      model: PersonModel,
      select:
        '_id title gender avatarKey personKey accuracy status bio instructions context',
    });

    if (!chat) {
      return handleActionError(
        'Could not find a chat for the provided chat id'
      );
    }

    return {
      success: true,
      data: {
        _id: chat.person._id.toString(),
        name: chat.personName,
        title: chat.person.title,
        status: chat.person.status,
        gender: chat.person.gender,
        bio: chat.person.bio,
        personKey: chat.person.personKey,
        avatarKey: chat.person.avatarKey,
        instructions: chat.person.instructions,
        context: chat.person.context,
        accuracy: chat.person.accuracy,
      },
    };
  } catch (err: unknown) {
    return handleActionError('Unable to get person data', err);
  }
};
