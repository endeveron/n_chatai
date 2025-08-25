import {
  HarmCategory,
  HarmProbability,
  SafetyRating,
} from '@google/generative-ai';
import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

import { INSTRUCTIONS } from '@/core/features/chat/constants';
import { MemoryMessage, MessageRole } from '@/core/features/chat/types/chat';
import { PersonDataForPrompt } from '@/core/features/chat/types/person';

export const configureBaseSystemMessage = ({
  // humanName,
  person,
  personalityContext,
  chatContext,
  isChatStart,
}: {
  // humanName: string | null;
  person: PersonDataForPrompt;
  personalityContext: string;
  chatContext: string;
  isChatStart: boolean;
  isEmojiPermitted?: boolean;
}): SystemMessage => {
  const personName = person.name;
  const personInstructions = person.instructions;
  const baseInstructions = personInstructions.replace(
    /{personName}/g,
    personName
  );

  // Accuracy instructions for AI behavior
  // console.log(`[Debug] Person's accuracy: ${person.accuracy}`);
  let accuracyInstructions = '';
  // Check if the AI should provide fictitious information
  if (Math.random() <= person.accuracy) {
    // AI is allowed to provide fictitious facts
    // console.log('[Debug] AI is allowed to provide fictitious facts.');
    accuracyInstructions += ` ${INSTRUCTIONS.canGenerateFiction}`;
  }

  const context = `\n\n[CONTEXT]\n[About you]\n${personalityContext}${chatContext}`;

  const instructionsGreet = isChatStart
    ? ' Cheerful greet and introduce yourself.'
    : ` No greet.`;

  const instructions = `[INSTRUCTIONS]\n${baseInstructions} Play a role of ${personName} using relevant details from the provided context. ${INSTRUCTIONS.base}${instructionsGreet}${accuracyInstructions}\n${INSTRUCTIONS.extractEmotion}${context}`;

  console.log(`\n\n[Debug] configureBaseSystemMessage: ${instructions}\n`);

  return new SystemMessage({
    content: instructions,
  });
};

export const createSummaryMessage = ({
  humanName,
  localMemoryMessages,
}: {
  humanName: string | null;
  localMemoryMessages: MemoryMessage[];
}): HumanMessage => {
  const name = humanName ?? 'human';

  // Configure context
  const contextLines: string[] = [];
  localMemoryMessages.forEach((memoryNode) => {
    if (memoryNode.role === MessageRole.human) {
      contextLines.push(`${name}: ${memoryNode.context}`);
    } else if (memoryNode.role === MessageRole.ai) {
      contextLines.push(`you: ${memoryNode.context}`);
    }
  });

  const instructions = `${
    INSTRUCTIONS.createSummary
  }\n\n[CONTEXT]\n${contextLines.join('\n')}`;

  console.log('\n\n[Debug] createSummaryMessage > instructions:', instructions);

  return new HumanMessage({
    content: instructions,
  });
};

export const getAIResHeatIndex = (aiMsg: AIMessageChunk): number => {
  let heatIndex = 0;

  const safetyRatings: SafetyRating[] | null | undefined =
    aiMsg?.response_metadata?.safetyRatings;
  if (!safetyRatings || !safetyRatings?.length) {
    return heatIndex;
  }

  const explicitCatItem = safetyRatings.find(
    (r) => r.category === HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT
  );
  if (!explicitCatItem) {
    return heatIndex;
  }

  const probability: HarmProbability = explicitCatItem.probability;
  if (
    !probability ||
    probability === HarmProbability.HARM_PROBABILITY_UNSPECIFIED ||
    probability === HarmProbability.NEGLIGIBLE
  ) {
    return heatIndex;
  }

  switch (probability) {
    case HarmProbability.LOW:
      heatIndex = 1;
      break;
    case HarmProbability.MEDIUM:
      heatIndex = 2;
      break;
    case HarmProbability.HIGH:
      heatIndex = 3;
  }

  return heatIndex;
};

// export const createExtractNameMessage = ({
//   localMemoryMessages,
// }: {
//   localMemoryMessages: MemoryMessage[];
// }): HumanMessage => {
//   // Configure context
//   const contextLines: string[] = [];
//   localMemoryMessages.forEach((memoryNode) => {
//     if (memoryNode.role !== MessageRole.ai) {
//       contextLines.push(memoryNode.context);
//     }
//   });

//   const instructions = `${
//     INSTRUCTIONS.extractName
//   }\n\n[TEXT]\n${contextLines.join('\n')}`;

//   console.log('\n\ncreateExtractNameMessage:', instructions);

//   return new HumanMessage({
//     content: instructions,
//   });
// };
