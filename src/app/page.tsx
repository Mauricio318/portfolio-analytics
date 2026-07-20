import { getDb } from '@/lib/db';
import PortfolioClient from '@/components/PortfolioClient';

export const dynamic = 'force-dynamic';

export default function Home() {
  const db = getDb(true);
  
  // Fetch Settings
  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string, value: string }[];
  const settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
  
  // Fetch Skills, CV and Portfolio (ordenados por sort_order)
  const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC, percentage DESC').all() as any[];
  const jobs = db.prepare('SELECT * FROM resume_items WHERE type = ? ORDER BY sort_order ASC, id DESC').all('job') as any[];
  const academic = db.prepare('SELECT * FROM resume_items WHERE type = ? ORDER BY sort_order ASC, id DESC').all('academic') as any[];
  const certifications = db.prepare('SELECT * FROM resume_items WHERE type = ? ORDER BY sort_order ASC, id DESC').all('certification') as any[];
  const courses = db.prepare('SELECT * FROM resume_items WHERE type = ? ORDER BY sort_order ASC, id DESC').all('course') as any[];
  const portfolio = db.prepare('SELECT * FROM portfolio_items ORDER BY sort_order ASC, id DESC').all() as any[];

  return (
    <PortfolioClient 
      initialSettings={settings}
      initialSkills={skills}
      initialJobs={jobs}
      initialAcademic={academic}
      initialCertifications={certifications}
      initialCourses={courses}
      initialPortfolio={portfolio}
    />
  );
}
