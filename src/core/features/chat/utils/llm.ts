import { INSTRUCTIONS } from '@/core/features/chat/constants';
import { MemoryMessage, MessageRole } from '@/core/features/chat/types/chat';
import { PersonDataForPrompt } from '@/core/features/chat/types/person';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

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

  const instructions = `[INSTRUCTIONS]\n${baseInstructions} Play a role of ${personName} using some details from the provided context. ${INSTRUCTIONS.base}${instructionsGreet}${accuracyInstructions}\n${INSTRUCTIONS.extractEmotion}${context}`;

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

  console.log('\n\ncreateSummaryMessage:', instructions);

  return new HumanMessage({
    content: instructions,
  });
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
