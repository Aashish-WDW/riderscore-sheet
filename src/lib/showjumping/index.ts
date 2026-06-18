export type { SJConfig } from "./types";

import { config as jumpingPhase } from "./jumping-phase";
import { type SJConfig } from "./types";

export const SJ_CONFIGS: Record<string, SJConfig> = {
  "jumping-phase": jumpingPhase,
};
