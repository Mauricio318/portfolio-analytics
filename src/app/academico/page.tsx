import AcademicClient from '@/components/AcademicClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mauricio Garcia Bimbu - Currículo Acadêmico & Lattes',
  description: 'Histórico acadêmico, publicações científicas e projetos de pesquisa de Mauricio Garcia Bimbu, Mestrando em Ciência da Computação na USP.',
};

export default function AcademicPage() {
  return <AcademicClient />;
}
