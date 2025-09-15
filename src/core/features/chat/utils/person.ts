import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';

import { getPersonDataForLLM } from '@/core/features/chat/actions/person';
import { QUERY_PATTERNS } from '@/core/features/chat/data/conversation';
import {
  ContextCategory,
  PersonDataForLLM,
  PersonKey,
  RetrievalConfig,
} from '@/core/features/chat/types/person';
import { mongoDB } from '@/core/lib/mongo';

export const personDataMap = new Map<PersonKey, PersonDataForLLM>([]);
export const vectorStoreMap = new Map<string, MongoDBAtlasVectorSearch>();

const TAGS = {
  physical: new Set([
    'appearance',
    'build',
    'height',
    'weight',
    'age',
    'chest',
    'legs',
    'waist',
    'hips',
    'eyes',
    'hair',
    'face',
    'skin',
    'style',
    'voice',
    'hands',
  ]),
  personality: new Set([
    'personality',
    'values',
    'mindset',
    'behavior',
    'hobbies',
    'fears',
    'challenges',
    'pet_peeves',
  ]),
  lifestyle: new Set(['lifestyle', 'profession', 'residence', 'social']),
};

export const extractContextCategoryTag = (
  text: string
): { tag: string; cleanText: string } => {
  const match = text.match(/^\{([^}]+)\}\s*/);
  if (match) {
    const tag = match[1];
    const cleanText = text.slice(match[0].length);
    return { tag, cleanText };
  }
  return { tag: 'misc', cleanText: text };
};

export const assignCategoryByTag = (tag: string): ContextCategory => {
  // 1. General (unique)
  if (tag === 'general') {
    return ContextCategory.GENERAL;
  }

  // 2. Physical attributes
  if (TAGS.physical.has(tag)) {
    return ContextCategory.PHYSICAL;
  }

  // 3. Personality traits
  if (TAGS.personality.has(tag)) {
    return ContextCategory.PERSONALITY;
  }

  // 4. Lifestyle
  if (TAGS.lifestyle.has(tag)) {
    return ContextCategory.LIFESTYLE;
  }

  // 5. Preferences — tags starting with "favorite_"
  if (/^favorite_/.test(tag)) {
    return ContextCategory.PREFERENCES;
  }

  // 6. Goals and dreams
  if (
    /^goal/i.test(tag) || // Anything starting with "goal" (case-insensitive)
    /^dream/i.test(tag) || // Anything starting with "dream" (case-insensitive)
    ['obsession', 'legacy'].includes(tag)
  ) {
    return ContextCategory.GOALS_DREAMS;
  }

  // 7. Miscellaneous
  return ContextCategory.MISC;
};

// Returns meta tags that can be used for vector store retrieval
// User Query: "Tell me about your dreams"
// Returns ['dreams', 'dream_destination', 'goals', 'future_goal', 'obsession']
export const getRelevantTags = (query: string): string[] => {
  const text = query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ''); // remove punctuation

  // SPECIFIC PHYSICAL QUERIES (most specific first)

  // // Face-specific queries
  // if (
  //   /\b(describe.*face|face.*like|facial.*features|jawline|complexion)\b/.test(
  //     text
  //   ) &&
  //   !/\b(overall|general|entire|whole)\b/.test(text)
  // ) {
  //   return ['face', 'eyes', 'hair', 'skin'];
  // }

  // Hair-specific queries
  if (
    /\b(hair|color.*length.*style|texture.*hair|hairstyle)\b/.test(text) &&
    !/\b(overall|general|entire|whole)\b/.test(text)
  ) {
    return ['hair'];
  }

  // Skin-specific queries
  if (
    /\b(skin|texture.*skin|complexion|smooth|rough)\b/.test(text) &&
    !/\b(overall|general|entire|whole)\b/.test(text)
  ) {
    return ['skin'];
  }

  // Hands-specific queries
  if (/\b(hand|hands|fingers|nails)\b/.test(text)) {
    return ['hands'];
  }

  // Voice and sound queries
  if (/\b(voice|sound like)\b/.test(text)) {
    return ['voice'];
  }

  // Movement and physical presence
  if (/\b(move|movement|posture|carry.*yourself|walk)\b/.test(text)) {
    return ['voice', 'appearance', 'style'];
  }

  // Energy and aura queries
  if (/\b(energy.*give off|presence|aura|vibe|give off)\b/.test(text)) {
    return ['personality', 'behavior', 'values'];
  }

  // Age queries
  if (/\b(age|old|young|years old|how old)\b/.test(text)) {
    return ['age'];
  }

  // Style/aesthetic queries
  if (
    /\b(style|aesthetic|outfit|fashion|dress|clothing|favorite outfit|highlight)\b/.test(
      text
    )
  ) {
    return ['style'];
  }

  // Body type/build queries
  if (/\b(body|body type|build|physique|figure|measurements)\b/.test(text)) {
    return [
      'appearance',
      'build',
      'height',
      'weight',
      'chest',
      'legs',
      'waist',
      'hips',
    ];
  }

  // Striking/distinctive features
  if (
    /\b(striking.*features|distinctive|notice.*walk|most.*features|stand out)\b/.test(
      text
    )
  ) {
    return ['appearance', 'build', 'face', 'hair', 'style', 'height', 'weight'];
  }

  // Overall appearance queries
  if (
    /\b(overall appearance|entire.*appearance|whole.*look|general.*appearance|appearance.*detail)\b/.test(
      text
    )
  ) {
    return ['appearance', 'build', 'face', 'hair', 'style', 'height', 'weight'];
  }

  // Portrait/artistic representation
  if (/\b(portrait|painting|capture|artistic|represent|depict)\b/.test(text)) {
    return ['general', 'miscellaneous'];
  }

  // DREAMS AND GOALS QUERIES

  // Dreams (sleep dreams) vs aspirational dreams DISTINCTION
  if (
    /\b(dreams?.*have|dreams?.*night|vivid.*dreams?|symbolic.*dreams?|realistic.*dreams?|dream.*stuck|reveal.*dreams?)\b/.test(
      text
    )
  ) {
    return ['general', 'miscellaneous']; // These are about sleep dreams, not aspirations
  }

  // Aspirational dreams and goals
  if (
    /\b(live out.*dream|aspirations?|dream.*be|future.*dreams?|goals?|want to|plan|ambition|legacy|leave behind)\b/.test(
      text
    )
  ) {
    return ['dreams', 'dream_destination', 'goals', 'future_goal', 'obsession'];
  }

  // PERSONALITY AND PSYCHOLOGY QUERIES

  // Personality reflection
  if (
    /\b(look.*reflect.*personality|appearance.*personality|style.*personality)\b/.test(
      text
    )
  ) {
    return ['personality', 'values', 'mindset', 'behavior'];
  }

  // General personality queries
  if (
    /\b(personality|character|traits|nature)\b/.test(text) &&
    !/\b(reflect|appearance|look)\b/.test(text)
  ) {
    return ['personality', 'values', 'mindset', 'behavior'];
  }

  // Values and beliefs queries
  if (
    /\b(values|believe|principles|important.*you|care about|matters|mantra)\b/.test(
      text
    )
  ) {
    return ['values', 'personality', 'mindset'];
  }

  // LIFESTYLE AND PREFERENCES QUERIES

  // Fears and challenges queries
  if (
    /\b(fears?|afraid|scared|worry|concerns?|challenges?|struggle|difficult)\b/.test(
      text
    )
  ) {
    return ['fears', 'challenges', 'pet_peeves'];
  }

  // Hobbies and interests queries
  if (
    /\b(hobbies|interests?|free time|fun|enjoy|like to do|activities)\b/.test(
      text
    )
  ) {
    return ['hobbies', 'favorite_unwind', 'lifestyle'];
  }

  // Favorites queries
  if (/\b(favorite|favourites?|prefer|love|like.*best)\b/.test(text)) {
    // Specific favorite type detection
    if (/\b(movie|film|cinema)\b/.test(text)) {
      return ['favorite_movies'];
    }
    if (/\b(color|colours?)\b/.test(text)) {
      return ['favorite_color'];
    }
    if (/\b(animal|pet)\b/.test(text)) {
      return ['favorite_animal'];
    }
    if (/\b(music|song|artist|band)\b/.test(text)) {
      return ['favorite_music', 'favorite_artist'];
    }
    if (/\b(food|eat|meal|cuisine)\b/.test(text)) {
      return ['favorite_food'];
    }
    if (/\b(drink|beverage|coffee|tea)\b/.test(text)) {
      return ['favorite_drink'];
    }
    if (/\b(travel|place|destination|visit)\b/.test(text)) {
      return ['favorite_travel', 'dream_destination'];
    }
    if (/\b(relax|unwind|chill|rest)\b/.test(text)) {
      return ['favorite_unwind'];
    }
    if (/\b(time|hour|period|moment)\b/.test(text)) {
      return ['favorite_time'];
    }

    // General favorites fallback
    return [
      'favorite_movies',
      'favorite_color',
      'favorite_music',
      'favorite_food',
    ];
  }

  // Lifestyle queries
  if (/\b(lifestyle|live|daily|routine|way.*life|how.*spend)\b/.test(text)) {
    return ['lifestyle', 'profession', 'residence', 'social', 'hobbies'];
  }

  // Profession/work queries
  if (/\b(work|job|profession|career|do.*living|model|artist)\b/.test(text)) {
    return ['profession', 'goals', 'lifestyle'];
  }

  // Location/residence queries
  if (/\b(live|where|location|city|home|residence|from)\b/.test(text)) {
    return ['residence', 'lifestyle'];
  }

  // Social queries
  if (/\b(social|friends|people|relationships|connect|interact)\b/.test(text)) {
    return ['social', 'personality', 'behavior'];
  }

  // Mindset queries
  if (/\b(think|mindset|approach|philosophy|perspective|view)\b/.test(text)) {
    return ['mindset', 'values', 'personality'];
  }

  // GENERIC QUERIES (most generic last)

  // Very specific "about you" queries
  if (
    /\b(who are you|what.*person.*you|yourself.*words)\b/.test(text) &&
    !/\b(describe|appearance|look|face|hair|skin|body|build|voice|style)\b/.test(
      text
    )
  ) {
    return ['general', 'personality', 'lifestyle'];
  }

  // Appearance-related "describe" queries that didn't match above
  if (/\b(describe.*you|appearance.*own words)\b/.test(text)) {
    return ['general', 'personality', 'appearance', 'lifestyle'];
  }

  // Fallback for unmatched queries
  return ['misc', 'general'];
};

export const getPersonData = async ({
  chatId,
  personKey,
}: {
  chatId: string;
  personKey: PersonKey;
}): Promise<PersonDataForLLM | null> => {
  let personData: PersonDataForLLM | null = null;
  try {
    // Try to get person from the map
    const personDataFromMap = personDataMap.get(personKey);
    if (personDataFromMap) {
      // console.log(
      //   `[Debug] getPersonData: Data for "${personKey}" person key retrieved fom the personDataMap`
      // );
      return personDataFromMap;
    }

    // Retrieve person data from db.
    // console.log(
    //   `[Debug] getPersonData: Retrieving data for "${personKey}" person key from the db`
    // );
    const personRes = await getPersonDataForLLM({ chatId });

    if (!personRes?.success) {
      console.error(
        `getPersonData: ${
          personRes?.error.message ?? 'Unable to retrieve person data from db.'
        }`
      );
      return null;
    }

    if (personRes.data) {
      personData = personRes.data;
      personDataMap.set(personKey, personData);
      // console.log(
      //   `[Debug] getPersonData: Data retrieved and saved in personDataMap`
      // );
    }
    return personData;
  } catch (err: unknown) {
    console.error(`getPersonData: 'Unable to retrieve person data. ${err}`);
    return null;
  }
};

export const parseDocumentContent = async (docs: Document[]) => {
  return docs.map((doc) => doc.pageContent).join(' ');
};

export const getMongoVectorStoreForPerson = async ({
  personKey,
  personContext,
}: {
  personKey: PersonKey;
  personContext: string[];
}): Promise<MongoDBAtlasVectorSearch | undefined> => {
  // Try to get the vector store from the vectorStoreMap
  // const storeFromMap = vectorStoreMap.get('person');
  // if (storeFromMap) {
  //   // console.log(
  //   //   `[Debug] getMongoVectorStoreForPerson: Vector store retrieved from vectorStoreMap`
  //   // );
  //   return storeFromMap;
  // }

  try {
    // Get MongoDB database
    const db = await mongoDB.getVectorDb();
    const collectionName = `person_vectors`;
    const collection = db.collection(collectionName);

    // Create embeddings instance
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-embedding-001',
    });

    // // Check if collection has documents
    // const docCount = await collection.countDocuments();
    // Check if THIS person's documents exist
    const personDocCount = await collection.countDocuments({ personKey });

    // Create vector store instance
    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection,
      indexName: `person_vector_index`,
      textKey: 'text',
      embeddingKey: 'embedding',
    });

    // console.log(
    //   `[Debug] getMongoVectorStoreForPerson: Created 'person' vector store (MongoDBAtlasVectorSearch).`
    // );

    if (personDocCount === 0) {
      // console.log(
      //   `[Debug] getMongoVectorStoreForPerson: Creating new documents for 'person' vector store`
      // );

      // Assign meta tags
      const personContextWithTags = personContext.map((context) => {
        const { tag, cleanText } = extractContextCategoryTag(context);
        const category = assignCategoryByTag(tag);
        return {
          content: cleanText,
          category,
          personKey,
        };
      });

      // Generate langchain documents
      const documents: Document[] = personContextWithTags.map(
        (item: { content: string; category: ContextCategory }) =>
          new Document({
            pageContent: item.content,
            metadata: {
              category: item.category,
              personKey,
            },
          })
      );

      // Add documents to the shared collection
      await vectorStore.addDocuments(documents);
      // console.log(
      //   `[Debug] getMongoVectorStoreForPerson: Documents for '${personKey}' added to 'person' vector store.`
      // );

      // Create the search index (will only create once for the for 'person_vectors' collection).
      await mongoDB.createSearchIndex();

      // Wait for index to be ready
      const firstContextWord =
        personContextWithTags[0]?.content.split(' ')[0] || 'color'; // Use first word from context
      const indexReady = await waitForIndexReady(
        vectorStore,
        personKey,
        firstContextWord
      );
      if (!indexReady) {
        // console.warn(
        //   '[Debug] getMongoVectorStoreForPerson: Vector search index may not be fully ready, proceeding anyway.'
        // );
      }
    }
    // else {
    //   console.log(
    //     `[Debug] getMongoVectorStoreForPerson: Use existing collection for '${personKey}' from 'person' vector store.`
    //   );
    // }

    // Save to map for future requests
    vectorStoreMap.set('person', vectorStore);
    // console.log(
    //   `[Debug] getMongoVectorStoreForPerson: Vector store 'person' cached in vectorStoreMap`
    // );

    return vectorStore;
  } catch (err: unknown) {
    console.error(`getMongoVectorStoreForPerson: ${err}`);
  }
};

// export const getMemoryVectorStoreForPerson = async ({
//   personKey,
//   personContext,
// }: {
//   personKey: PersonKey;
//   personContext: string[];
// }): Promise<MemoryVectorStore | undefined> => {
//   // Try to get the vector store from the vectorStoreMap
//   const storeFromMap = vectorStoreMap.get(personKey);
//   if (storeFromMap) {
//     // console.log(
//     //   `[Debug] getVectorStoreForPerson: Vector store for "${personKey}" person key retrieved fom the vectorStoreMap`
//     // );
//     return storeFromMap;
//   }

//   try {
//     // console.log(
//     //   `[Debug] getVectorStoreForPerson: Creating a new vector store for "${personKey}" person key`
//     // );

//     // Create an instance for generating embeddings
//     const embeddings = new GoogleGenerativeAIEmbeddings();

//     // Generate langchain documents for vector store
//     const documents: Document[] = personContext.map(
//       (text: string) => new Document({ pageContent: text })
//     );

//     // Create vector store from documents
//     const newVectorStore = await MemoryVectorStore.fromDocuments(
//       documents,
//       embeddings
//     );

//     // Save to map
//     vectorStoreMap.set(personKey, newVectorStore);

//     // console.log(
//     //   `[Debug] getVectorStoreForPerson: Vector store for "${personKey}" person key created and saved to the vectorStoreMap`
//     // );

//     return newVectorStore;
//   } catch (err: unknown) {
//     console.error(`getVectorStoreForPerson: ${err}`);
//   }
// };

// export const getVectorStoreData = async (
//   personKey: PersonKey
// ): Promise<MongoDBAtlasVectorSearch | undefined> => {
//   return vectorStoreMap.get(personKey);
// };

// Helper function to check if text matches any pattern in a category
const matchesAnyPattern = (
  text: string,
  patterns: Record<string, RegExp>
): boolean => {
  return Object.values(patterns).some((pattern) => pattern.test(text));
};

// Helper function to check physical patterns with exclusion logic
const matchesPhysicalPattern = (text: string): boolean => {
  // Overall appearance queries always match
  if (QUERY_PATTERNS.physical.overall.test(text)) {
    return true;
  }

  return (
    matchesAnyPattern(text, QUERY_PATTERNS.physical) &&
    !QUERY_PATTERNS.physicalExclusion.test(text)
  );
};

export const getRetrivalConfig = (query: string): RetrievalConfig => {
  const text = query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ''); // remove punctuation

  // Check complex patterns first (most specific)
  if (matchesAnyPattern(text, QUERY_PATTERNS.complex)) {
    return {
      k: 3, // 4
      categories: [
        ContextCategory.GENERAL,
        ContextCategory.PHYSICAL,
        ContextCategory.PERSONALITY,
      ],
    };
  }

  // Check physical patterns with exclusion logic
  if (matchesPhysicalPattern(text)) {
    // Check if it's energy/aura related (maps to both physical and personality)
    if (QUERY_PATTERNS.physical.energy.test(text)) {
      return {
        k: 2, // 3
        categories: [ContextCategory.PHYSICAL, ContextCategory.PERSONALITY],
      };
    }

    return {
      k: 1, // 2
      categories: [ContextCategory.PHYSICAL],
    };
  }

  // Check goals and dreams patterns
  if (matchesAnyPattern(text, QUERY_PATTERNS.goalsDreams)) {
    // Sleep dreams can be both goals/dreams and miscellaneous
    if (QUERY_PATTERNS.goalsDreams.sleepDreams.test(text)) {
      return {
        k: 1, // 2
        categories: [ContextCategory.GOALS_DREAMS, ContextCategory.MISC],
      };
    }

    return {
      k: 1, // 2
      categories: [ContextCategory.GOALS_DREAMS],
    };
  }

  // Check preference patterns
  if (matchesAnyPattern(text, QUERY_PATTERNS.preferences)) {
    return {
      k: 1, // 2
      categories: [ContextCategory.PREFERENCES],
    };
  }

  // Check personality patterns
  if (matchesAnyPattern(text, QUERY_PATTERNS.personality)) {
    return {
      k: 2, // 3
      categories: [ContextCategory.PERSONALITY],
    };
  }

  // Check lifestyle patterns
  if (matchesAnyPattern(text, QUERY_PATTERNS.lifestyle)) {
    return {
      k: 1, // 2
      categories: [ContextCategory.LIFESTYLE],
    };
  }

  // Fallback for unmatched queries
  return {
    k: 1, // 3
    categories: [ContextCategory.MISC, ContextCategory.GENERAL],
  };
};

export const getContextFromVectorStore = async ({
  query,
  personKey,
  vectorStore,
}: {
  query: string;
  personKey: PersonKey;
  // vectorStore: MemoryVectorStore | MongoDBAtlasVectorSearch;
  vectorStore: MongoDBAtlasVectorSearch;
}): Promise<string> => {
  let categoryDocuments: Document[] = [];

  const retrival = getRetrivalConfig(query);
  // console.log(`[Debug] getContextFromVectorStore: retrival`, retrival);

  // Retrieve the documents using metadata 'category' tag
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000)
  );

  try {
    categoryDocuments = (await Promise.race([
      vectorStore.similaritySearch(query, retrival.k, {
        preFilter: {
          $and: [
            { category: { $in: retrival.categories } },
            { personKey: personKey },
          ],
        },
      }),
      timeoutPromise,
    ])) as Document[];
  } catch (error: unknown) {
    console.error(
      `Vector search failed/timed out, returning empty results.`,
      error
    );
    categoryDocuments = [];
  }

  return categoryDocuments.length
    ? parseDocumentContent(categoryDocuments)
    : '';

  // EXTRA retrival options
  //
  // 1. Retriever - for complex queries
  //
  // // Use retriever with MMR for complex/personality queries
  // const retriever = vectorStore.asRetriever({
  //   k: retrival.k,
  //   // mmr - Maximal Marginal Relevance, balances relevance and
  //   // diversity by penalizing documents similar to already selected ones.
  //   // Best for complex queries where you want diverse, non-redundant information.
  //   searchType: 'mmr',
  // });
  //
  // // Retrieve documents related to human message from the vector store
  // relatedDocuments = await retriever._getRelevantDocuments(query);
  // if (!relatedDocuments?.length) {
  //   // Fallback: use similarity search
  //   relatedDocuments = await vectorStore.similaritySearch(query, 2);
  //   console.log(
  //     `[Debug] getContextFromVectorStore: used similarity search as a fallback for the retriever with MMR.`
  //   );
  // }
  //
  // 2. Similarity search - for simple factual queries
  //
  // // Use similarity search for simple factual queries
  // const docs = await vectorStore.similaritySearch(
  //   'General section describing physical features and appearance',
  //   4
  // );
  // relatedDocuments = docs.filter((doc) =>
  //   doc.pageContent.startsWith('About you')
  // );
  // console.log(
  //   `[Debug] getContextFromVectorStore: catched up "aboutYou" pattern.`
  // );
};

export const waitForIndexReady = async (
  vectorStore: MongoDBAtlasVectorSearch,
  personKey: PersonKey,
  testQuery: string,
  maxWaitTime: number = 60000 // 60 seconds max wait
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Use actual content from the person's context for testing
      const results = await vectorStore.similaritySearch(testQuery, 1, {
        preFilter: { personKey },
      });

      // If we get results, the index is ready
      if (results && results.length > 0) {
        // console.log(
        //   `[Debug] Index is ready for person '${personKey}' - found ${results.length} results`
        // );
        return true;
      }

      // console.log(
      //   `[Debug] Index not ready yet for '${personKey}' - no results found, waiting...`
      // );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (err: unknown) {
      console.error(`waitForIndexReady: ${err}`);
      // console.log(
      //   `[Debug] Index not ready for '${personKey}' - error: ${error}, waiting...`
      // );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  return false;
};
