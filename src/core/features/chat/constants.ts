// Local storage
export const CHAT_MEDIA_MIN_KEY = 'chat-media-min';
export const USER_ID_KEY = 'user';

// Number of memory nodes (elements of the human message context) that need to be sent to the client
export const MEMORY_LENGTH_FOR_CLIENT = 20;

// Number of recent messages to:
// - Trigger saving memory to the database
// - Include in the memory context for processing
export const MEMORY_DEPTH = 10;

export const RECENT_MESSAGES_LIMIT = 64;

export const CHAT_MESSAGE_LIFETIME = 180 * 24 * 60 * 60 * 1000; // 180 days

// Heat section

export const MAX_HEAT_LEVEL = 10;

export const HEAT_PHOTO_STEP = 2;

export const HEAT_LEVEL_UPDATE_INTERVAL = 30 * 1000; // 30 sec in miliseconds
