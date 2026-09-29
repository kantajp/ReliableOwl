import type { DiagramId } from '../data/content';
import { UrlBasicFlow, UrlCacheScale, UrlKeyGeneration, UrlReadWrite } from './UrlDiagrams';
import { RlAlgorithms, RlAllowDeny, RlDistributed, RlTokenBucket, RlWhy } from './RateLimiterDiagrams';

export const diagramRegistry: Record<DiagramId, () => JSX.Element> = {
  'url-basic-flow': UrlBasicFlow,
  'url-key-generation': UrlKeyGeneration,
  'url-read-write': UrlReadWrite,
  'url-cache-scale': UrlCacheScale,
  'rl-why': RlWhy,
  'rl-token-bucket': RlTokenBucket,
  'rl-allow-deny': RlAllowDeny,
  'rl-algorithms': RlAlgorithms,
  'rl-distributed': RlDistributed,
};

export function Diagram({ id }: { id: DiagramId }) {
  const Cmp = diagramRegistry[id];
  if (!Cmp) return null;
  return <Cmp />;
}
