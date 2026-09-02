// Registry for external skill audio effects
// Enables linking each skill to an external or local audio file seamlessly.
import sharinganSoundAsset from '../assets/sounds/sharingan_activation.mp3';

export interface SkillAudioConfig {
  skillId: string;
  name: string;
  audioUrl: string;
  fallbackUrl?: string;
  volume?: number;
  playbackRate?: number;
  sourceDescription?: string;
}

// Registry mapping skill animation IDs to their dedicated audio files
export const SKILL_AUDIO_REGISTRY: Record<string, SkillAudioConfig> = {
  uchiha_sharingan: {
    skillId: 'uchiha_sharingan',
    name: 'صوت مهارة الشارينغان (Uchiha Sharingan)',
    audioUrl: sharinganSoundAsset,
    fallbackUrl: '/sounds/sharingan_activation.mp3',
    volume: 1.0,
    playbackRate: 1.0,
    sourceDescription: "Itachi's Mangekyou Sharingan Activation Sound Effect"
  }
};

/**
 * Retrieve audio configuration for a given skill
 */
export function getSkillAudio(skillId: string): SkillAudioConfig | null {
  return SKILL_AUDIO_REGISTRY[skillId] || null;
}

/**
 * Easily register or override an audio file for any skill in the future
 */
export function registerSkillAudio(config: SkillAudioConfig): void {
  SKILL_AUDIO_REGISTRY[config.skillId] = config;
}

/**
 * Check if a skill has a dedicated audio file configured
 */
export function hasCustomSkillAudio(skillId: string): boolean {
  return Boolean(SKILL_AUDIO_REGISTRY[skillId]);
}

/**
 * List all registered skill audio configs
 */
export function getAllRegisteredSkillAudios(): SkillAudioConfig[] {
  return Object.values(SKILL_AUDIO_REGISTRY);
}
