import { getCollection } from 'astro:content';

export const noteTopics = {
  systems: 'Linux／系統',
  go: 'Go',
  storage: '資料庫／儲存',
  build: 'Build／測試',
  ai: 'AI／Agent',
  devlog: '開發紀錄',
};
export const noteKinds = {
  reading: '閱讀筆記',
  concept: '概念筆記',
  experiment: '實作筆記',
  devlog: '開發紀錄',
};
export const noteUrl = (id: string) => `/notes/${id}/`;
export const noteTopicUrl = (topic: string) => `/notes/?topic=${encodeURIComponent(topic)}`;
export async function publishedNotes() {
  return (await getCollection('notes', ({data}) => data.status === 'published'))
    .sort((a, b) => b.data.updatedAt.localeCompare(a.data.updatedAt) || a.data.title.localeCompare(b.data.title, 'zh-Hant'));
}
