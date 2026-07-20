import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { isAllowedFileExtension, isSafeUploadPath } from '@/lib/security';

async function checkAuth() {
  const session = cookies().get('session')?.value;
  if (!session) return false;
  return await decrypt(session);
}

export async function POST(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Security check: Extension validation
    if (!isAllowedFileExtension(file.name)) {
      return NextResponse.json({ error: 'Extensão de arquivo não permitida. Envie PNG, JPG, WEBP, SVG ou PDF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'misc';

    // Sanitize subfolder name to prevent path injection
    const sanitizedType = type.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedType);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Clean name using pattern: nome_cod.extensao
    let filename = '';
    if (sanitizedType === 'cv') {
      filename = 'CV_MAURICIO_BIMBU.pdf';
    } else if (sanitizedType === 'lattes') {
      filename = 'CV_LATTES_MAURICIO_BIMBU.pdf';
    } else {
      const ext = path.extname(file.name);
      const rawBase = path.basename(file.name, ext);
      const sanitizedBase = rawBase.replace(/[^a-zA-Z0-9\-_]/g, '_').replace(/_+/g, '_') || 'file';
      const shortCode = Math.random().toString(36).substring(2, 5); // Código curto de 3 caracteres
      filename = `${sanitizedBase}_${shortCode}${ext.toLowerCase()}`;
    }

    const relativePath = `/uploads/${sanitizedType}/${filename}`;
    
    // Path Traversal Security Verification
    if (!isSafeUploadPath(relativePath)) {
      return NextResponse.json({ error: 'Caminho de arquivo inválido ou inseguro' }, { status: 400 });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      filePath: relativePath 
    });
  } catch (error: any) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json({ error: 'Erro no upload: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  
  try {
    const url = new URL(request.url);
    const filePath = url.searchParams.get('filePath');

    if (!filePath || !isSafeUploadPath(filePath)) {
      return NextResponse.json({ error: 'Caminho inválido ou não permitido' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));

    if (existsSync(fullPath)) {
      await unlink(fullPath);
      console.log(`✓ Arquivo removido do disco com sucesso: ${fullPath}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar arquivo:', error);
    return NextResponse.json({ error: 'Erro ao remover arquivo: ' + error.message }, { status: 500 });
  }
}
