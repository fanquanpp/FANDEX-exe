/**
 * 服务层统一导出
 *
 * 所有服务通过此文件统一导出，UI 层仅从此文件引入服务实例。
 * 禁止 UI 层直接导入服务内部模块。
 *
 * 分层规则：
 * - UI 层：仅使用 services/index.ts 导出的接口和实例
 * - Service 层：业务逻辑实现，可引用 AI 适配器和数据层
 * - Data 层：API 请求封装、数据索引加载
 */

/* AI 服务 */
export { createAIAdapter, resetAIAdapter } from './ai/adapter';
export { getAIConfig, isAIAvailable } from './ai/config';
export type {
  AIProvider,
  ChatRole,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  AIAdapter,
  TokenUsage,
  EmbeddingUsage,
} from './ai/types';

/* 搜索服务 */
export { getSearchService } from './search/search-service';
export type { SearchResult, SearchMode } from './search/search-service';
export { generateEmbeddings, EMBEDDING_DIM_API, EMBEDDING_DIM_FALLBACK } from './search/embedding';
export type { EmbeddingResult } from './search/embedding';

/* Quiz 服务 */
export { getQuizService } from './quiz/quiz-service';
export type {
  QuizType,
  FillQuiz,
  ChoiceQuiz,
  FixQuiz,
  Quiz,
  QuizRequest,
} from './quiz/quiz-service';

/* 学习推荐服务 */
export { getTutorService } from './tutor/tutor-service';
export type {
  TutorRecommendation,
  TutorRequest,
  LearningStats,
  ModulePrerequisiteMap,
} from './tutor/tutor-service';

/* 路线规划服务 */
export { getRoadmapService } from './roadmap/roadmap-service';
export type {
  RoadmapStep,
  RoadmapPhase,
  RoadmapRequest,
  RoadmapEvaluation,
  PersonalizedRoadmap,
} from './roadmap/roadmap-service';

/* GraphRAG 服务 */
export { getGraphRAGService } from './graphrag/graphrag-service';
export type {
  GraphNode,
  GraphEdge,
  GraphRAGAnswer,
  GraphRAGRequest,
  GraphQuery,
  SubGraph,
} from './graphrag/graphrag-service';
