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
import { SqliConcat, SqliPlaceholder } from './SqlInjectionDiagrams';
import { PiChannels, PiIndirect } from './PromptInjectionDiagrams';
import { OAuthCodeFlow, OAuthPkce } from './OAuthDiagrams';
import { ChaosExperiment, ChaosLoop } from './ChaosDiagrams';
import { UaCascade, UaCongestion, UaDnsRace, UaTimeline } from './AwsOutageDiagrams';
import { K8sArchitecture, K8sPodLifecycle, K8sReconcile, K8sService } from './KubernetesDiagrams';
import { LlmAttention, LlmContextWindow, LlmNextToken, LlmTemperature, LlmTokens } from './LlmDiagrams';

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
  'sqli-concat': SqliConcat,
  'sqli-placeholder': SqliPlaceholder,
  'pi-indirect': PiIndirect,
  'pi-channels': PiChannels,
  'oauth-code-flow': OAuthCodeFlow,
  'oauth-pkce': OAuthPkce,
  'chaos-loop': ChaosLoop,
  'chaos-experiment': ChaosExperiment,
  'ua-timeline': UaTimeline,
  'ua-cascade': UaCascade,
  'ua-dns-race': UaDnsRace,
  'ua-congestion': UaCongestion,
  'k8s-architecture': K8sArchitecture,
  'k8s-pod-lifecycle': K8sPodLifecycle,
  'k8s-reconcile': K8sReconcile,
  'k8s-service': K8sService,
  'llm-next-token': LlmNextToken,
  'llm-tokens': LlmTokens,
  'llm-temperature': LlmTemperature,
  'llm-context-window': LlmContextWindow,
  'llm-attention': LlmAttention,
};

export function Diagram({ id }: { id: DiagramId }) {
  const Cmp = diagramRegistry[id];
  if (!Cmp) return null;
  return <Cmp />;
}
