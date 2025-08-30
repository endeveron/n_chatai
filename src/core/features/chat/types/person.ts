export enum Gender {
  male = 'male',
  female = 'female',
}

export type PersonBaseData = {
  title: string;
  gender: Gender;
  avatarKey: AvatarKey;
  personKey: PersonKey;
  status: string;
  bio: string;
  avatarBlur: string;
  imgBlur: string;
  accuracy: number; // 0-1 - how closely AI responses should align with the person's context
};

// Used for mongoDb doc
export type Person = PersonBaseData & {
  instructions: string;
  context: string[];
};

export type PersonChatData<PersonId> = PersonBaseData & {
  _id: PersonId;
};

export type PersonCardData = Omit<
  PersonBaseData,
  'accuracy' | 'bio' | 'avatarBlur'
> & {
  _id: string;
};

export type PersonDataForLLM = Omit<
  PersonBaseData,
  'avatarBlur' | 'imgBlur'
> & {
  _id: string;
  context: string[];
  instructions: string;
  name: string;
};

export type PersonDataForVectorStore = Pick<
  PersonBaseData,
  'bio' | 'status' | 'title'
> & {
  instructions: string;
  context: string[];
};

export enum PersonKey {
  artFuture = 'artFuture',
  devJourney = 'devJourney',
  modelArtist = 'modelArtist',
  musican = 'musican',
  positiveShot = 'positiveShot',
}

export enum AvatarKey {
  blonde = 'blonde',
  brunette = 'brunette',
  choco = 'choco',
  cutie = 'cutie',
  honey = 'honey',
}

export type SelectPerson = {
  _id: string;
  gender: Gender;
};

export interface RetrievalConfig {
  k: number;
  categories: ContextCategory[];
}

export enum QueryType {
  GENERAL = 'general',
  PHYSICAL = 'physical',
  PERSONALITY = 'personality',
  PREFERENCES = 'preferences',
  GOALS_DREAMS = 'goals_dreams',
  LIFESTYLE = 'lifestyle',
  COMPLEX = 'complex', // For queries that might need multiple categories
}

export type PersonDataForPrompt = {
  name: string;
  accuracy: number;
  instructions: string;
};

export enum ContextCategory {
  GENERAL = 'general',
  PHYSICAL = 'physical',
  PERSONALITY = 'personality',
  PREFERENCES = 'preferences',
  GOALS_DREAMS = 'goals_dreams',
  LIFESTYLE = 'lifestyle',
  MISC = 'misc',
}

export interface TagMapping {
  tags: string[];
  description: string;
}

export type EmotionData = {
  list: string[];
  length: number;
};

export interface CollectionInfo {
  readonly totalPhotos: number;
  readonly description: string;
}

export type CollectionMap = Record<string, CollectionInfo>;
