import { dbQuery } from '@/lib/query';
import PortfolioClient from '@/components/PortfolioClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let settings: any = {};
  let services: any[] = [];
  let skills: any[] = [];
  let jobs: any[] = [];
  let academic: any[] = [];
  let certifications: any[] = [];
  let courses: any[] = [];
  let portfolio: any[] = [];
  let articles: any[] = [];

  try {
    const settingsRows = await dbQuery<{ key: string; value: string }>('SELECT key, value FROM settings');
    settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
  } catch (e) {}

  try {
    services = await dbQuery('SELECT * FROM services WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id ASC');
    skills = await dbQuery('SELECT * FROM skills WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id ASC');
    jobs = await dbQuery('SELECT * FROM resume_items WHERE type = ? AND (is_visible IS NULL OR is_visible = 1) ORDER BY sort_order ASC, id DESC', ['job']);
    academic = await dbQuery('SELECT * FROM resume_items WHERE type = ? AND (is_visible IS NULL OR is_visible = 1) ORDER BY sort_order ASC, id DESC', ['academic']);
    certifications = await dbQuery('SELECT * FROM resume_items WHERE type = ? AND (is_visible IS NULL OR is_visible = 1) ORDER BY sort_order ASC, id DESC', ['certification']);
    courses = await dbQuery('SELECT * FROM resume_items WHERE type = ? AND (is_visible IS NULL OR is_visible = 1) ORDER BY sort_order ASC, id DESC', ['course']);
    portfolio = await dbQuery('SELECT * FROM portfolio_items WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id DESC');
    articles = await dbQuery('SELECT * FROM articles WHERE is_visible IS NULL OR is_visible = 1 ORDER BY sort_order ASC, id DESC');
  } catch (e) {}

  return (
    <PortfolioClient 
      initialSettings={settings}
      initialServices={services}
      initialSkills={skills}
      initialJobs={jobs}
      initialAcademic={academic}
      initialCertifications={certifications}
      initialCourses={courses}
      initialPortfolio={portfolio}
      initialArticles={articles}
    />
  );
}
