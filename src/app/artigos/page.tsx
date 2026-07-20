import { getDb } from '@/lib/db';
import ArticlesClient from '@/components/ArticlesClient';

export const dynamic = 'force-dynamic';

export default function ArticlesPage() {
  const db = getDb(true);

  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);

  let articles: any[] = [];
  try {
    articles = db.prepare('SELECT * FROM articles WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id DESC').all() as any[];
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
