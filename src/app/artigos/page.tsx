import { dbQuery } from '@/lib/query';
import ArticlesClient from '@/components/ArticlesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArticlesPage() {
  let settings: any = {};
  let articles: any[] = [];

  try {
    const settingsRows = await dbQuery<{ key: string; value: string }>('SELECT key, value FROM settings');
    settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
  } catch (e) {
    settings = {};
  }

  try {
    articles = await dbQuery('SELECT * FROM articles WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id DESC');
  } catch (e) {
    articles = [];
  }

  return (
    <ArticlesClient 
      initialSettings={settings}
      initialArticles={articles}
    />
  );
}
