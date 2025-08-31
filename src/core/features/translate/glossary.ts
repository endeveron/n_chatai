import * as deepl from 'deepl-node';

// Create glossary entries in proper DeepL format
export const glossaryEntries = new deepl.GlossaryEntries({
  entries: {
    core: 'лоно',
    contracts: 'стискається',
    squirt: 'струмінь',
  },
});
