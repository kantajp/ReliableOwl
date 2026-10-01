import type { DiagramId } from '../data/content';
import { FundLatency, FundMemory } from './FundamentalsDiagrams';
import { IvTimeline } from './InterviewDiagrams';
import { UrlArchitecture, UrlBasicFlow, UrlCacheEviction, UrlCacheScale, UrlCapacity, UrlKeyGeneration, UrlKeyUniqueness, UrlReadWrite } from './UrlDiagrams';
import { RlAlgorithms, RlAllowDeny, RlArchitecture, RlCapacity, RlDistributed, RlPlacement, RlRace, RlTokenBucket, RlWhy } from './RateLimiterDiagrams';
import { CbStateMachine } from './CircuitBreakerDiagrams';
import { SloBudget, SloLadder, SloNines } from './SloDiagrams';
import { BackoffLadder, RetryStorm } from './RetryDiagrams';
import { DbReplicaLag, DbReplication, DbSharding } from './DatabaseScaleDiagrams';
import { ConsistentHashRing } from './ConsistentHashDiagram';

export const diagramRegistry: Record<DiagramId, () => JSX.Element> = {
  'fund-latency': FundLatency,
  'fund-memory': FundMemory,
  'iv-timeline': IvTimeline,
  'url-basic-flow': UrlBasicFlow,
  'url-capacity': UrlCapacity,
  'url-key-generation': UrlKeyGeneration,
  'url-key-uniqueness': UrlKeyUniqueness,
  'url-read-write': UrlReadWrite,
  'url-cache-scale': UrlCacheScale,
  'url-cache-eviction': UrlCacheEviction,
  'url-architecture': UrlArchitecture,
  'rl-why': RlWhy,
  'rl-capacity': RlCapacity,
  'rl-token-bucket': RlTokenBucket,
  'rl-allow-deny': RlAllowDeny,
  'rl-algorithms': RlAlgorithms,
  'rl-distributed': RlDistributed,
  'rl-placement': RlPlacement,
  'rl-race': RlRace,
  'rl-architecture': RlArchitecture,
  'cb-state-machine': CbStateMachine,
  'slo-ladder': SloLadder,
  'slo-nines': SloNines,
  'slo-budget': SloBudget,
  'retry-storm': RetryStorm,
  'retry-backoff': BackoffLadder,
  'db-replication': DbReplication,
  'db-replica-lag': DbReplicaLag,
  'db-sharding': DbSharding,
  'db-consistent-hash': ConsistentHashRing,
};

export function Diagram({ id }: { id: DiagramId }) {
  const Cmp = diagramRegistry[id];
  if (!Cmp) return null;
  return <Cmp />;
}
