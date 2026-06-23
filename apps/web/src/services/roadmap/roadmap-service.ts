/**
 * 学习路线规划服务
 *
 * 基于 AI 能力生成个性化学习路线图。
 * AI 不可用时基于 career-paths.json 匹配最接近的职业路径进行降级规划。
 *
 * 输入：学习目标、已学模块、可用时间
 * 输出：学习路线（阶段列表，每阶段包含推荐模块和学习顺序）
 * 流程：分析目标 -> 匹配职业路径 -> AI 规划 / 规则规划
 */

import { createAIAdapter } from '../ai/adapter';
import { isAIAvailable } from '../ai/config';
import type { ChatMessage } from '../ai/types';

/** 路线步骤 */
export interface RoadmapStep {
  /** 步骤序号 */
  order: number;
  /** 模块 ID */
  moduleId: string;
  /** 步骤标题 */
  title: string;
  /** 步骤描述 */
  description: string;
  /** 预计时长（天） */
  estimatedDays: number;
}

/** 学习阶段 */
export interface RoadmapPhase {
  /** 阶段序号 */
  phase: number;
  /** 阶段名称 */
  name: string;
  /** 阶段目标 */
  goal: string;
  /** 阶段包含的步骤 */
  steps: RoadmapStep[];
  /** 阶段检验标准 */
  checkpoint: string;
}

/** 路线规划请求 */
export interface RoadmapRequest {
  /** 学习目标（如"全栈开发"） */
  goal: string;
  /** 已学模块 ID 列表 */
  learnedModules: string[];
  /** 可用时间（周） */
  weeksAvailable: number;
  /** 当前水平（beginner | intermediate | advanced） */
  level: string;
}

/** 路线评估结果 */
export interface RoadmapEvaluation {
  /** 完成百分比（0-100） */
  completionPercent: number;
  /** 预计剩余时间（天） */
  estimatedDaysRemaining: number;
  /** 下一步建议 */
  nextSteps: RoadmapStep[];
}

/** 个性化学习路线 */
export interface PersonalizedRoadmap {
  /** 路线 ID（用于 localStorage 存储） */
  id: string;
  /** 学习目标 */
  goal: string;
  /** 生成时间戳 */
  createdAt: number;
  /** 是否由 AI 生成 */
  aiGenerated: boolean;
  /** 阶段列表 */
  phases: RoadmapPhase[];
}

/** 职业路径数据结构（来自 career-paths.json） */
interface CareerPath {
  label: string;
  color: string;
  steps: Array<{ id: string; label: string }>;
}

/** 模块前置依赖映射（来自 modules.json） */
type PrerequisitesMap = Record<string, string[]>;

/** 模块信息 */
interface ModuleInfo {
  id: string;
  title: string;
  description: string;
}

/** localStorage 存储键前缀 */
const STORAGE_KEY_PREFIX = 'fandex-roadmap-';

/**
 * 学习路线规划服务类
 *
 * 职责：
 * 1. 个性化学习路线规划（AI + 规则降级）
 * 2. 路线评估（进度追踪）
 * 3. 路线持久化（localStorage）
 */
export class RoadmapService {
  private adapter = createAIAdapter();
  private careerPaths: CareerPath[] = [];
  private prerequisites: PrerequisitesMap = {};
  private modulesInfo: ModuleInfo[] = [];
  private dataLoaded = false;

  /**
   * 加载路线图元数据
   *
   * 输入：无
   * 输出：void（加载到内存）
   * 流程：fetch career-paths.json + modules.json -> 解析 -> 缓存
   */
  private async loadData(): Promise<void> {
    if (this.dataLoaded) return;
    try {
      const base = import.meta.env.BASE_URL || '/';
      const [careerRes, modulesRes] = await Promise.all([
        fetch(`${base}data/career-paths.json`),
        fetch(`${base}data/modules.json`),
      ]);

      if (careerRes.ok) {
        const careerData: CareerPath[] = await careerRes.json();
        this.careerPaths = careerData;
      }

      if (modulesRes.ok) {
        const modulesData: {
          modules: ModuleInfo[];
          modulePrerequisites: PrerequisitesMap;
        } = await modulesRes.json();
        this.modulesInfo = modulesData.modules ?? [];
        this.prerequisites = modulesData.modulePrerequisites ?? {};
      }

      this.dataLoaded = true;
    } catch (error) {
      console.error('路线图元数据加载失败:', error);
      this.dataLoaded = true;
    }
  }

  /**
   * 生成个性化学习路线
   *
   * 输入：RoadmapRequest（目标、已学模块、可用时间、水平）
   * 输出：PersonalizedRoadmap（分阶段学习路线）
   * 流程：加载数据 -> 检查 AI -> AI 规划 / 规则规划降级
   */
  async generateRoadmap(request: RoadmapRequest): Promise<PersonalizedRoadmap> {
    await this.loadData();

    if (isAIAvailable()) {
      try {
        const roadmap = await this.aiGenerateRoadmap(request);
        if (roadmap.phases.length > 0) {
          return roadmap;
        }
      } catch (error) {
        console.error('AI 路线规划失败，降级为规则规划:', error);
      }
    }

    return this.ruleBasedRoadmap(request);
  }

  /**
   * AI 规划学习路线
   *
   * 输入：RoadmapRequest
   * 输出：PersonalizedRoadmap
   * 流程：构建提示词 -> 调用 AI -> 解析分阶段路线
   */
  private async aiGenerateRoadmap(request: RoadmapRequest): Promise<PersonalizedRoadmap> {
    const availableModules = this.getAvailableModules(request.learnedModules);
    const messages = this.buildAIPrompt(request, availableModules);
    const response = await this.adapter.chatCompletion({ messages, temperature: 0.4 });
    const phases = this.parseAIRoadmap(response.content, availableModules);

    return {
      id: `roadmap-${Date.now()}`,
      goal: request.goal,
      createdAt: Date.now(),
      aiGenerated: true,
      phases,
    };
  }

  /**
   * 构建 AI 规划提示词
   *
   * 输入：请求参数、可用模块列表
   * 输出：ChatMessage 数组
   */
  private buildAIPrompt(request: RoadmapRequest, availableModules: ModuleInfo[]): ChatMessage[] {
    /** 构建模块列表（含前置依赖） */
    const moduleList = availableModules
      .map((m) => {
        const prereqs = this.prerequisites[m.id] ?? [];
        const prereqStr = prereqs.length > 0 ? ` (前置: ${prereqs.join(', ')})` : '';
        return `- ${m.id}: ${m.title} - ${m.description}${prereqStr}`;
      })
      .join('\n');

    return [
      {
        role: 'system',
        content: `你是一个学习规划专家。根据以下信息为用户制定个性化学习路线：
- 学习目标：{goal}
- 已学模块：{learnedModules}
- 可用时间：{availableTime}
- 可选模块：{availableModules}（含前置依赖关系）

请生成一个分阶段的学习路线，每个阶段包含：
1. 阶段名称和目标
2. 推荐学习的模块（按顺序）
3. 每个模块的预计学习时间
4. 阶段检验标准

输出严格的 JSON 格式，不要包含任何其他文本。格式如下：
{
  "phases": [
    {
      "phase": 1,
      "name": "阶段名称",
      "goal": "阶段目标",
      "steps": [
        {"order":1,"moduleId":"模块ID","title":"步骤标题","description":"步骤描述","estimatedDays":7}
      ],
      "checkpoint": "阶段检验标准"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `学习目标：${request.goal}
已学模块：${request.learnedModules.length > 0 ? request.learnedModules.join(', ') : '无'}
可用时间：${request.weeksAvailable} 周
当前水平：${request.level}

可选模块（含前置依赖）：
${moduleList}`,
      },
    ];
  }

  /**
   * 解析 AI 返回的路线数据
   *
   * 输入：AI 返回的文本内容
   * 输出：RoadmapPhase 数组
   * 流程：提取 JSON -> 校验结构 -> 过滤无效步骤
   */
  private parseAIRoadmap(content: string, availableModules: ModuleInfo[]): RoadmapPhase[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed.phases)) return [];

      /** 校验 moduleId 是否在可用模块中 */
      const validModuleIds = new Set(availableModules.map((m) => m.id));

      return parsed.phases
        .filter(
          (phase: Record<string, unknown>) =>
            typeof phase.name === 'string' && Array.isArray(phase.steps)
        )
        .map((phase: Record<string, unknown>, index: number) => ({
          phase: typeof phase.phase === 'number' ? phase.phase : index + 1,
          name: phase.name as string,
          goal: typeof phase.goal === 'string' ? phase.goal : '',
          steps: (phase.steps as Array<Record<string, unknown>>)
            .filter(
              (step: Record<string, unknown>) =>
                typeof step.moduleId === 'string' && validModuleIds.has(step.moduleId as string)
            )
            .map((step: Record<string, unknown>, stepIndex: number) => ({
              order: typeof step.order === 'number' ? step.order : stepIndex + 1,
              moduleId: step.moduleId as string,
              title: typeof step.title === 'string' ? step.title : (step.moduleId as string),
              description: typeof step.description === 'string' ? step.description : '',
              estimatedDays: typeof step.estimatedDays === 'number' ? step.estimatedDays : 7,
            })),
          checkpoint: typeof phase.checkpoint === 'string' ? phase.checkpoint : '',
        }))
        .filter((phase: RoadmapPhase) => phase.steps.length > 0);
    } catch {
      return [];
    }
  }

  /**
   * 规则规划降级：基于 career-paths.json 匹配最接近的职业路径
   *
   * 输入：RoadmapRequest
   * 输出：PersonalizedRoadmap
   * 流程：关键词匹配职业路径 -> 过滤已学模块 -> 按前置依赖排序 -> 分阶段
   */
  private ruleBasedRoadmap(request: RoadmapRequest): PersonalizedRoadmap {
    /** 匹配最接近的职业路径 */
    const matchedPath = this.matchCareerPath(request.goal);

    if (matchedPath) {
      return this.buildRoadmapFromCareerPath(matchedPath, request);
    }

    /** 无匹配路径时，基于目标关键词推荐模块 */
    return this.buildFallbackRoadmap(request);
  }

  /**
   * 匹配最接近的职业路径
   *
   * 输入：用户目标文本
   * 输出：匹配的 CareerPath 或 null
   * 流程：关键词匹配 -> 计算匹配度 -> 返回最佳匹配
   */
  private matchCareerPath(goal: string): CareerPath | null {
    if (this.careerPaths.length === 0) return null;

    /** 目标关键词映射表 */
    const goalKeywords: Record<string, string[]> = {
      全栈: ['全栈入门'],
      前端: ['前端工程师'],
      后端: ['后端工程师'],
      系统: ['系统开发者'],
      数据: ['数据工程师'],
      运维: ['DevOps 工程师'],
      安全: ['安全工程师'],
      AI: ['AI 工程师'],
      人工智能: ['AI 工程师'],
      移动: ['移动开发'],
      理论: ['CS 理论'],
      算法: ['CS 理论'],
    };

    const lowerGoal = goal.toLowerCase();
    let bestMatch: CareerPath | null = null;
    let bestScore = 0;

    for (const [keyword, pathLabels] of Object.entries(goalKeywords)) {
      if (lowerGoal.includes(keyword.toLowerCase())) {
        for (const label of pathLabels) {
          const path = this.careerPaths.find((p) => p.label === label);
          if (path) {
            const score = keyword.length;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = path;
            }
          }
        }
      }
    }

    /** 关键词无匹配时，尝试直接匹配路径标签 */
    if (!bestMatch) {
      for (const path of this.careerPaths) {
        if (lowerGoal.includes(path.label.toLowerCase())) {
          bestMatch = path;
          break;
        }
      }
    }

    /** 仍然无匹配时，返回第一条路径（全栈入门） */
    if (!bestMatch && this.careerPaths.length > 0) {
      bestMatch = this.careerPaths[0];
    }

    return bestMatch;
  }

  /**
   * 从职业路径构建学习路线
   *
   * 输入：CareerPath、RoadmapRequest
   * 输出：PersonalizedRoadmap
   * 流程：过滤已学模块 -> 按前置依赖排序 -> 分阶段
   */
  private buildRoadmapFromCareerPath(
    path: CareerPath,
    request: RoadmapRequest
  ): PersonalizedRoadmap {
    const learnedSet = new Set(request.learnedModules);

    /** 过滤已学模块，保留待学模块 */
    const stepsToLearn = path.steps.filter((s) => !learnedSet.has(s.id));

    /** 按前置依赖排序 */
    const sortedSteps = this.topologicalSort(stepsToLearn.map((s) => s.id));

    /** 将步骤映射回带标签的步骤 */
    const sortedWithLabels = sortedSteps
      .map((id) => path.steps.find((s) => s.id === id))
      .filter((s): s is { id: string; label: string } => s !== undefined);

    /** 分阶段：每 2-3 个模块一个阶段 */
    const phases = this.divideIntoPhases(sortedWithLabels, request.weeksAvailable);

    return {
      id: `roadmap-${Date.now()}`,
      goal: request.goal,
      createdAt: Date.now(),
      aiGenerated: false,
      phases,
    };
  }

  /**
   * 拓扑排序：按前置依赖排序模块
   *
   * 输入：模块 ID 数组
   * 输出：排序后的模块 ID 数组
   * 流程：Kahn 算法拓扑排序
   */
  private topologicalSort(moduleIds: string[]): string[] {
    const idSet = new Set(moduleIds);
    /** 计算入度 */
    const inDegree: Record<string, number> = {};
    const adjacency: Record<string, string[]> = {};

    for (const id of moduleIds) {
      inDegree[id] = 0;
      adjacency[id] = [];
    }

    for (const id of moduleIds) {
      const prereqs = this.prerequisites[id] ?? [];
      for (const prereq of prereqs) {
        if (idSet.has(prereq)) {
          adjacency[prereq].push(id);
          inDegree[id] = (inDegree[id] ?? 0) + 1;
        }
      }
    }

    /** 入度为 0 的节点入队 */
    const queue: string[] = [];
    for (const id of moduleIds) {
      if (inDegree[id] === 0) {
        queue.push(id);
      }
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      for (const neighbor of adjacency[current]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    /** 无法排序的模块追加到末尾 */
    for (const id of moduleIds) {
      if (!result.includes(id)) {
        result.push(id);
      }
    }

    return result;
  }

  /**
   * 将模块列表分阶段
   *
   * 输入：带标签的步骤列表、可用周数
   * 输出：RoadmapPhase 数组
   * 流程：每 2-3 个模块一个阶段 -> 计算每阶段时间 -> 生成检验标准
   */
  private divideIntoPhases(
    steps: Array<{ id: string; label: string }>,
    weeksAvailable: number
  ): RoadmapPhase[] {
    if (steps.length === 0) return [];

    /** 每阶段模块数 */
    const stepsPerPhase = Math.max(
      2,
      Math.min(3, Math.ceil(steps.length / Math.max(1, Math.ceil(weeksAvailable / 2))))
    );
    const phases: RoadmapPhase[] = [];
    const totalDays = weeksAvailable * 7;
    const daysPerStep = Math.max(3, Math.ceil(totalDays / steps.length));

    for (let i = 0; i < steps.length; i += stepsPerPhase) {
      const phaseSteps = steps.slice(i, i + stepsPerPhase);
      const phaseIndex = Math.floor(i / stepsPerPhase) + 1;

      phases.push({
        phase: phaseIndex,
        name: `阶段 ${phaseIndex}：${phaseSteps.map((s) => s.label).join(' + ')}`,
        goal: `掌握 ${phaseSteps.map((s) => s.label).join('、')} 的核心知识`,
        steps: phaseSteps.map((step, stepIndex) => {
          const moduleInfo = this.modulesInfo.find((m) => m.id === step.id);
          return {
            order: stepIndex + 1,
            moduleId: step.id,
            title: step.label,
            description: moduleInfo?.description ?? `学习 ${step.label} 模块内容`,
            estimatedDays: daysPerStep,
          };
        }),
        checkpoint: `能够独立完成 ${phaseSteps.map((s) => s.label).join('、')} 相关的基础练习`,
      });
    }

    return phases;
  }

  /**
   * 无匹配路径时的降级路线
   *
   * 输入：RoadmapRequest
   * 输出：PersonalizedRoadmap
   * 流程：基于目标关键词搜索模块 -> 排序 -> 分阶段
   */
  private buildFallbackRoadmap(request: RoadmapRequest): PersonalizedRoadmap {
    const learnedSet = new Set(request.learnedModules);
    const goalLower = request.goal.toLowerCase();

    /** 从模块列表中搜索与目标相关的模块 */
    const relevantModules = this.modulesInfo.filter((m) => {
      if (learnedSet.has(m.id)) return false;
      return (
        goalLower.includes(m.id.toLowerCase()) ||
        goalLower.includes(m.title.toLowerCase()) ||
        m.description.toLowerCase().includes(goalLower)
      );
    });

    /** 相关模块不足时，补充基础模块 */
    if (relevantModules.length < 3) {
      const basics = ['getting-started', 'markdown', 'git', 'html5', 'css', 'javascript'];
      for (const id of basics) {
        if (!learnedSet.has(id) && !relevantModules.some((m) => m.id === id)) {
          const mod = this.modulesInfo.find((m) => m.id === id);
          if (mod) relevantModules.push(mod);
        }
      }
    }

    const stepsWithLabels = relevantModules.map((m) => ({
      id: m.id,
      label: m.title,
    }));
    const phases = this.divideIntoPhases(stepsWithLabels, request.weeksAvailable);

    return {
      id: `roadmap-${Date.now()}`,
      goal: request.goal,
      createdAt: Date.now(),
      aiGenerated: false,
      phases,
    };
  }

  /**
   * 获取可用模块列表（排除已学模块）
   *
   * 输入：已学模块 ID 列表
   * 输出：ModuleInfo 数组
   */
  private getAvailableModules(learnedModules: string[]): ModuleInfo[] {
    const learnedSet = new Set(learnedModules);
    return this.modulesInfo.filter((m) => !learnedSet.has(m.id));
  }

  /**
   * 评估路线进度
   *
   * 输入：路线、用户已学模块列表
   * 输出：RoadmapEvaluation（完成百分比、剩余时间、下一步建议）
   * 流程：计算已完成模块 -> 估算剩余 -> 返回评估结果
   */
  async evaluateRoadmap(
    roadmap: PersonalizedRoadmap,
    learnedModules: string[]
  ): Promise<RoadmapEvaluation> {
    const learnedSet = new Set(learnedModules);

    /** 统计所有步骤 */
    const allSteps: RoadmapStep[] = [];
    for (const phase of roadmap.phases) {
      allSteps.push(...phase.steps);
    }

    const totalSteps = allSteps.length;
    if (totalSteps === 0) {
      return {
        completionPercent: 100,
        estimatedDaysRemaining: 0,
        nextSteps: [],
      };
    }

    /** 计算已完成步骤 */
    const completedSteps = allSteps.filter((s) => learnedSet.has(s.moduleId));
    const completionPercent = Math.round((completedSteps.length / totalSteps) * 100);

    /** 计算剩余步骤的预计时间 */
    const remainingSteps = allSteps.filter((s) => !learnedSet.has(s.moduleId));
    const estimatedDaysRemaining = remainingSteps.reduce((sum, s) => sum + s.estimatedDays, 0);

    /** 下一步建议：取前 3 个未完成步骤 */
    const nextSteps = remainingSteps.slice(0, 3);

    return {
      completionPercent,
      estimatedDaysRemaining,
      nextSteps,
    };
  }

  /**
   * 保存路线到 localStorage
   *
   * 输入：PersonalizedRoadmap
   * 输出：void
   */
  saveRoadmap(roadmap: PersonalizedRoadmap): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${roadmap.id}`;
      localStorage.setItem(key, JSON.stringify(roadmap));
      /** 同时保存最新路线 ID，方便快速读取 */
      localStorage.setItem(`${STORAGE_KEY_PREFIX}latest`, roadmap.id);
    } catch (error) {
      console.error('路线保存失败:', error);
    }
  }

  /**
   * 从 localStorage 加载路线
   *
   * 输入：路线 ID
   * 输出：PersonalizedRoadmap 或 null
   */
  loadRoadmap(id: string): PersonalizedRoadmap | null {
    try {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as PersonalizedRoadmap;
    } catch (error) {
      console.error('路线加载失败:', error);
      return null;
    }
  }

  /**
   * 加载最新保存的路线
   *
   * 输入：无
   * 输出：PersonalizedRoadmap 或 null
   */
  loadLatestRoadmap(): PersonalizedRoadmap | null {
    try {
      const latestId = localStorage.getItem(`${STORAGE_KEY_PREFIX}latest`);
      if (!latestId) return null;
      return this.loadRoadmap(latestId);
    } catch {
      return null;
    }
  }

  /**
   * 删除已保存的路线
   *
   * 输入：路线 ID
   * 输出：void
   */
  deleteRoadmap(id: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    } catch (error) {
      console.error('路线删除失败:', error);
    }
  }
}

/** 路线规划服务单例 */
let roadmapServiceInstance: RoadmapService | null = null;

/**
 * 获取路线规划服务实例
 *
 * 输入：无
 * 输出：RoadmapService 实例（单例）
 */
export function getRoadmapService(): RoadmapService {
  if (!roadmapServiceInstance) {
    roadmapServiceInstance = new RoadmapService();
  }
  return roadmapServiceInstance;
}
