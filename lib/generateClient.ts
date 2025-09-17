import type { Task } from '../types/schema';
import { buildSystemPrompt } from '../types/prompt';
import { tasksResponseSchema } from '../types/schema';
let _webllm: typeof import('@mlc-ai/web-llm') | null = null;
async function getWebLLM() {
  if (!_webllm) {
    _webllm = await import('@mlc-ai/web-llm');
  }
  return _webllm;
}
type MLCEngine = Awaited<ReturnType<(awaited: any) => any>>;

let enginePromise: Promise<any> | null = null;

export async function getEngine(onInitProgress?: (p: any) => void): Promise<any> {
  if (!enginePromise) {
    const { CreateMLCEngine, prebuiltAppConfig } = await getWebLLM();
    const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
    enginePromise = CreateMLCEngine(MODEL_ID, {
      appConfig: prebuiltAppConfig,
      initProgressCallback: (p: any) => {
        try {
          if (onInitProgress) onInitProgress(p);
          if (typeof window !== 'undefined') console.debug('webllm:init', p);
        } catch {}
      },
    });
  } else if (onInitProgress) {
    // If engine already initialized, notify ready state.
    try {
      onInitProgress({ text: 'Ready', progress: 1 });
    } catch {}
  }
  return enginePromise!;
}

export async function generateTasksClient(
  story: string,
  onInitProgress?: (p: any) => void
): Promise<Task[]> {
  const sys = buildSystemPrompt();
  const engine = await getEngine(onInitProgress);

  const res = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: `Story:\n\n${story}\n\nReturn only JSON.` },
    ],
    // Keep small for faster generation on-device
    max_tokens: 512,
    temperature: 0.2,
  });

  const content = res.choices?.[0]?.message?.content ?? '';
  let json: unknown = {};
  try {
    json = JSON.parse(content);
  } catch {
    // attempt to extract first JSON block if present
    const match = content.match(/\{[\s\S]*\}/);
    if (match) json = JSON.parse(match[0]);
  }
  const parsed = tasksResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error('Model returned invalid format');
  return parsed.data.tasks;
}
