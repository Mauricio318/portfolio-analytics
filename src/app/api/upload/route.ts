import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'misc';

    // Save under public/uploads/[type]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Clean name to avoid issues
    let filename = '';
    if (type === 'cv') {
      filename = 'CV_MAURICIO_BIMBU.pdf';
    } else {
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      filename = `${Date.now()}_${sanitizedFilename}`;
    }
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log(`Arquivo salvo com sucesso em: ${filePath}`);

    return NextResponse.json({ 
      success: true, 
      filePath: `/uploads/${type}/${filename}` 
    });
  } catch (error: any) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json({ error: 'Erro no upload: ' + error.message }, { status: 500 });
  }
}
