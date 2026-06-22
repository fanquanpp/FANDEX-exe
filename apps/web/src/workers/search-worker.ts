import Fuse, { type IFuseOptions } from 'fuse.js';

/** 搜索索引条目类型定义 */
interface SearchIndexItem {
  title: string;
  tags: string[];
  slug: string;
  description: string;
  module: string;
  updated?: string;
}

/** 搜索结果条目（含计算得分） */
interface ScoredItem extends SearchIndexItem {
  score: number;
}

let fuse: Fuse<SearchIndexItem> | null = null;

const FUSE_OPTIONS: IFuseOptions<SearchIndexItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'tags', weight: 0.25 },
    { name: 'slug', weight: 0.15 },
    { name: 'description', weight: 0.2 },
  ],
  threshold: 0.4,
  distance: 200,
  minMatchCharLength: 2,
  includeScore: true,
  useExtendedSearch: false,
};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'init') {
    fuse = new Fuse(payload.index, FUSE_OPTIONS);
    self.postMessage({ type: 'ready' });
    return;
  }

  if (type === 'search') {
    if (!fuse) {
      self.postMessage({ type: 'results', payload: { results: [], query: payload.query } });
      return;
    }

    let results = fuse.search(payload.query);

    if (payload.moduleFilter) {
      results = results.filter((r) => r.item.module === payload.moduleFilter);
    }

    const items: ScoredItem[] = results.map((r) => ({
      ...r.item,
      score: r.score ? 1 - r.score : 1,
    }));

    if (payload.sortMode === 'date') {
      items.sort((a, b) => {
        const da = a.updated || '';
        const db = b.updated || '';
        return db.localeCompare(da) || b.score - a.score;
      });
    }

    self.postMessage({
      type: 'results',
      payload: { results: items.slice(0, 50), query: payload.query },
    });
  }
};
