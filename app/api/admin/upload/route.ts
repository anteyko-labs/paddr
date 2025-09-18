import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Папки для загрузки файлов
const UPLOAD_DIRS = {
  images: {
    Bronze: path.join(process.cwd(), 'public', 'assets', 'tier1'),
    Silver: path.join(process.cwd(), 'public', 'assets', 'tier2'),
    Gold: path.join(process.cwd(), 'public', 'assets', 'tier3'),
    Platinum: path.join(process.cwd(), 'public', 'assets', 'tier4'),
  },
  videos: {
    Bronze: path.join(process.cwd(), 'public', 'nft', 'nft_tiers'),
    Silver: path.join(process.cwd(), 'public', 'nft', 'nft_tiers'),
    Gold: path.join(process.cwd(), 'public', 'nft', 'nft_tiers'),
    Platinum: path.join(process.cwd(), 'public', 'nft', 'nft_tiers'),
  }
};

// Разрешенные типы файлов
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Максимальный размер файла (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Функция для создания папки если её нет
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Функция для генерации уникального имени файла
function generateUniqueFileName(originalName: string, dirPath: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  
  let counter = 1;
  let fileName = `${baseName}${ext}`;
  
  while (fs.existsSync(path.join(dirPath, fileName))) {
    fileName = `${baseName}_${counter}${ext}`;
    counter++;
  }
  
  return fileName;
}

// POST: Загрузить файл
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tier = formData.get('tier') as string;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!tier || !type) {
      return NextResponse.json(
        { error: 'tier and type are required' },
        { status: 400 }
      );
    }
    
    if (!['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be Bronze, Silver, Gold, or Platinum' },
        { status: 400 }
      );
    }
    
    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be image or video' },
        { status: 400 }
      );
    }
    
    // Проверяем размер файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }
    
    // Проверяем тип файла
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Определяем папку для загрузки
    const uploadDir = type === 'image' 
      ? UPLOAD_DIRS.images[tier as keyof typeof UPLOAD_DIRS.images]
      : UPLOAD_DIRS.videos[tier as keyof typeof UPLOAD_DIRS.videos];
    
    // Создаем папку если её нет
    ensureDirectoryExists(uploadDir);
    
    // Генерируем уникальное имя файла
    const fileName = generateUniqueFileName(file.name, uploadDir);
    const filePath = path.join(uploadDir, fileName);
    
    // Сохраняем файл
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    
    // Определяем относительный путь для API
    const relativePath = type === 'image' 
      ? `/assets/${tier.toLowerCase()}/${fileName}`
      : `/nft/nft_tiers/${fileName}`;
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: relativePath,
        tier,
        assetType: type
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET: Получить список файлов в папке
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');
    const type = searchParams.get('type');
    
    if (!tier || !type) {
      return NextResponse.json(
        { error: 'tier and type are required' },
        { status: 400 }
      );
    }
    
    if (!['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }
    
    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      );
    }
    
    const dirPath = type === 'image' 
      ? UPLOAD_DIRS.images[tier as keyof typeof UPLOAD_DIRS.images]
      : UPLOAD_DIRS.videos[tier as keyof typeof UPLOAD_DIRS.videos];
    
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({
        files: [],
        path: dirPath,
        exists: false
      });
    }
    
    const files = fs.readdirSync(dirPath).map(fileName => {
      const filePath = path.join(dirPath, fileName);
      const stats = fs.statSync(filePath);
      
      return {
        name: fileName,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        path: type === 'image' 
          ? `/assets/${tier.toLowerCase()}/${fileName}`
          : `/nft/nft_tiers/${fileName}`
      };
    });
    
    return NextResponse.json({
      files,
      path: dirPath,
      exists: true,
      tier,
      type
    });
    
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

// DELETE: Удалить файл
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
    const tier = searchParams.get('tier');
    const type = searchParams.get('type');
    
    if (!fileName || !tier || !type) {
      return NextResponse.json(
        { error: 'fileName, tier, and type are required' },
        { status: 400 }
      );
    }
    
    if (!['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }
    
    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      );
    }
    
    const dirPath = type === 'image' 
      ? UPLOAD_DIRS.images[tier as keyof typeof UPLOAD_DIRS.images]
      : UPLOAD_DIRS.videos[tier as keyof typeof UPLOAD_DIRS.videos];
    
    const filePath = path.join(dirPath, fileName);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    fs.unlinkSync(filePath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      fileName,
      tier,
      type
    });
    
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}




