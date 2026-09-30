import type { DiagramId } from '../data/content';
import { UrlArchitecture, UrlBasicFlow, UrlCacheEviction, UrlCacheScale, UrlCapacity, UrlKeyGeneration, UrlKeyUniqueness, UrlReadWrite } from './UrlDiagrams';
import { RlAlgorithms, RlAllowDeny, RlArchitecture, RlDistributed, RlPlacement, RlRace, RlTokenBucket, RlWhy } from './RateLimiterDiagrams';

export const diagramRegistry: Record<DiagramId, () => JSX.Element> = {
  'url-basic-flow': UrlBasicFlow,
  'url-capacity': UrlCapacity,
  'url-key-generation': UrlKeyGeneration,
  'url-key-uniqueness': UrlKeyUniqueness,
  'url-read-write': UrlReadWrite,
  'url-cache-scale': UrlCacheScale,
  'url-cache-eviction': UrlCacheEviction,
  'url-architecture': UrlArchitecture,
  'rl-why': RlWhy,
  'rl-token-bucket': RlTokenBucket,
  'rl-allow-deny': RlAllowDeny,
  'rl-algorithms': RlAlgorithms,
  'rl-distributed': RlDistributed,
  'rl-placement': RlPlacement,
  'rl-race': RlRace,
  'rl-architecture': RlArchitecture,
};

export function Diagram({ id }: { id: DiagramId }) {
  const Cmp = diagramRegistry[id];
  if (!Cmp) return null;
  return <Cmp />;
}
