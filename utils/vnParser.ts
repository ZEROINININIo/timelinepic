
import { VNNode } from '../types';

/**
 * Parses the raw text content of a chapter into a Visual Novel script.
 * Handles multi-line dialogue by buffering text until a new speaker or structural change is detected.
 */
export const parseChapterToVN = (rawText: string): VNNode[] => {
  const lines = rawText.split('\n');
  const nodes: VNNode[] = [];
  let idCounter = 0;
  
  // Buffers for multi-line aggregation
  let currentSpeaker: string | null = null;
  let currentSpeakerRaw: string | null = null; // For display name
  let currentTextBuffer: string = "";
  let currentEmotion: VNNode['emotion'] = 'neutral';

  const flushBuffer = () => {
      const trimmedBuffer = currentTextBuffer.trim();
      if (!trimmedBuffer) return;
      
      const id = `node-${idCounter++}`;
      
      if (currentSpeaker) {
          // It was a dialogue block
          nodes.push({
              id,
              type: 'dialogue',
              speaker: currentSpeaker, // mapped ID
              speakerName: currentSpeakerRaw || "???",
              text: trimmedBuffer,
              emotion: currentEmotion
          });
      } else {
          // It was a narration or tag block
          // Check for specific full-line tags to categorize node type
          
          // 1. Image
          if (trimmedBuffer.startsWith('[[IMAGE::') && trimmedBuffer.endsWith(']]')) {
             const content = trimmedBuffer.slice(9, -2);
             nodes.push({ id, type: 'image', text: content, emotion: 'neutral' });
          } 
          // 2. Danger/System Alert (Keep brackets for Rich Text parser)
          else if (trimmedBuffer.startsWith('[[DANGER::') || trimmedBuffer.startsWith('[[WARN')) {
             nodes.push({ id, type: 'system', text: trimmedBuffer, emotion: 'neutral' });
          }
          // 3. Other Tags (BLUE, GREEN, etc) -> Narration (Keep brackets for Rich Text parser)
          else if (trimmedBuffer.startsWith('[[') && trimmedBuffer.endsWith(']]')) {
             // Treat as narration so it doesn't get the 'System' red styling default, 
             // allowing parseRichText to style it (e.g. Blue).
             nodes.push({ id, type: 'narration', text: trimmedBuffer, emotion: 'neutral' });
          }
          // 4. Standard Narration
          else {
             nodes.push({ id, type: 'narration', text: trimmedBuffer, emotion: 'neutral' });
          }
      }
      
      // Reset State
      currentSpeaker = null;
      currentSpeakerRaw = null;
      currentTextBuffer = "";
      currentEmotion = 'neutral';
  };

  lines.forEach((line) => {
    let trimmed = line.trim();
    
    // Handle paragraph breaks (empty lines in source) -> force flush
    if (!trimmed) {
        flushBuffer();
        return;
    }
    
    if (trimmed.startsWith('[[DIVIDER]]')) {
        flushBuffer();
        return;
    }

    // 1. Check for Speaker Definition: "Name: ..." or "Name：" OR "Name>>..." (for logs)
    const dialogueMatch = trimmed.match(/^(.+?)(:|：|>>)\s*(.*)/);

    // Filter out False Positives for Dialogue (e.g., tags, timestamps, system logs starting with brackets)
    let isValidDialogue = false;
    if (dialogueMatch) {
        const potentialName = dialogueMatch[1].trim();
        const separator = dialogueMatch[2];
        const remainingContent = dialogueMatch[3];

        // Critical Fix: Ensure we aren't splitting a rich text tag (e.g. [[TAG::CONTENT]])
        const isDoubleColonTag = separator === ':' && remainingContent.startsWith(':');
        // Critical Fix: Names usually don't contain tag openers
        const hasTagStart = potentialName.includes('[[');

        // If name contains brackets or looks like a timestamp/tag, ignore
        if (
            !potentialName.startsWith('[[') && 
            !potentialName.includes('【') && 
            potentialName.length < 25 &&
            !isDoubleColonTag &&
            !hasTagStart
        ) {
            isValidDialogue = true;
        }
    }

    if (dialogueMatch && isValidDialogue) {
      // If we were building a node, finish it.
      flushBuffer();

      const speakerRaw = dialogueMatch[1].replace(/[（(].*?[)）]/g, '').trim(); 
      const content = dialogueMatch[3];
      
      // Detect emotion from the line (Name part or Content part could have hints, usually Name line in this format)
      let emotion: VNNode['emotion'] = 'neutral';
      if (line.includes('（恼）') || line.includes('(Annoyed)')) emotion = 'angry';
      if (line.includes('（笑）') || line.includes('(Laughs)')) emotion = 'happy';
      if (line.includes('（惊慌）') || line.includes('(Panic)')) emotion = 'shocked';
      if (line.includes('（无奈）') || line.includes('(Helpless)')) emotion = 'sweat';

      // Start new dialogue state
      currentSpeaker = mapSpeakerToId(speakerRaw);
      currentSpeakerRaw = speakerRaw;
      currentEmotion = emotion;
      currentTextBuffer = content;
      return;
    }

    // 2. Check for Parentheses (Action/Narration Interruption)
    // If a line is purely (Action), it usually breaks the dialogue flow.
    if (/^[\(（].*[\)）]$/.test(trimmed)) {
        flushBuffer(); // Finish whatever was happening
        
        // Add as immediate narration node
        const id = `node-${idCounter++}`;
        nodes.push({
            id,
            type: 'narration',
            text: trimmed.replace(/^[\(（]|[\)）]$/g, ''), // Clean parens
            emotion: 'neutral'
        });
        return;
    }

    // 3. Check for Structural Tags (Start of new block)
    // If we hit a tag like [[BLUE::...]], treat it as a new block
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
        flushBuffer();
        currentTextBuffer = trimmed;
        flushBuffer(); // Immediate flush for tags
        return;
    }

    // 4. Continuation Logic
    if (currentTextBuffer) {
        // Smart spacing: Add space for English/Latin, no space for CJK
        const lastChar = currentTextBuffer[currentTextBuffer.length - 1];
        const isCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(lastChar);
        const spacer = isCJK ? "" : " ";
        
        // Append to current buffer instead of flushing immediately
        currentTextBuffer += spacer + trimmed;
    } else {
        // Start new buffer
        currentTextBuffer = trimmed;
    }
  });

  // Final flush
  flushBuffer();

  return nodes;
};

// Helper to map raw names to Character IDs for styling
const mapSpeakerToId = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes('零点') || lower.includes('point')) return 'point';
    if (lower.includes('芷漓') || lower.includes('zeri')) return 'zeri';
    if (lower.includes('泽洛') || lower.includes('zelo')) return 'zelo';
    if (lower.includes('void') || lower.includes('零空')) return 'void';
    if (lower.includes('暮雨') || lower.includes('dusk')) return 'dusk';
    if (lower.includes('白栖') || lower.includes('byaki')) return 'byaki';
    // System aliases
    if (lower.includes('terminal') || lower.includes('system') || lower.includes('终端') || lower.includes('系统') || lower.includes('warning')) return 'system';
    return 'unknown';
};
