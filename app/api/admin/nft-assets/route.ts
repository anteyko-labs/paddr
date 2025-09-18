import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Путь к файлу конфигурации NFT ассетов
const ASSETS_CONFIG_FILE = path.join(process.cwd(), 'data', 'nft-assets-config.json');

// Папки для ассетов
const ASSETS_DIRS = {
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

// Дефолтная конфигурация NFT ассетов
const defaultAssetsConfig = {
  assets: [
    { id: '1', name: 'Bronze Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323179.mp4', tier: 'Bronze', isActive: true },
    { id: '2', name: 'Silver Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323180.mp4', tier: 'Silver', isActive: true },
    { id: '3', name: 'Gold Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323181.mp4', tier: 'Gold', isActive: true },
    { id: '4', name: 'Platinum Video 1', type: 'video', path: '/nft/nft_tiers/video5307504616261323182.mp4', tier: 'Platinum', isActive: true },
  ],
  version: 1,
  lastUpdated: new Date().toISOString()
};

// Функция для чтения конфигурации ассетов
function readAssetsConfig() {
  try {
    if (fs.existsSync(ASSETS_CONFIG_FILE)) {
      const data = fs.readFileSync(ASSETS_CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading assets config:', error);
  }
  return defaultAssetsConfig;
}

// Функция для записи конфигурации ассетов
function writeAssetsConfig(config: any) {
  try {
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(ASSETS_CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing assets config:', error);
    return false;
  }
}

// Функция для получения списка файлов в папке
function getFilesInDirectory(dirPath: string, extensions: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webm']): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// GET: Получить конфигурацию NFT ассетов
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');
    const type = searchParams.get('type');
    
    const config = readAssetsConfig();
    
    // Фильтруем ассеты по параметрам
    let assets = config.assets;
    
    if (tier) {
      assets = assets.filter((asset: any) => asset.tier === tier);
    }
    
    if (type) {
      assets = assets.filter((asset: any) => asset.type === type);
    }
    
    // Добавляем информацию о доступных файлах
    const assetsWithFiles = assets.map((asset: any) => {
      const assetDir = asset.type === 'video' 
        ? ASSETS_DIRS.videos[asset.tier as keyof typeof ASSETS_DIRS.videos]
        : ASSETS_DIRS.images[asset.tier as keyof typeof ASSETS_DIRS.images];
      
      const availableFiles = getFilesInDirectory(assetDir);
      
      return {
        ...asset,
        availableFiles,
        fileExists: fs.existsSync(path.join(process.cwd(), 'public', asset.path))
      };
    });
    
    return NextResponse.json({
      ...config,
      assets: assetsWithFiles
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read NFT assets configuration' },
      { status: 500 }
    );
  }
}

// POST: Добавить новый NFT ассет
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, tier, path: assetPath } = body;
    
    if (!name || !type || !tier || !assetPath) {
      return NextResponse.json(
        { error: 'name, type, tier, and path are required' },
        { status: 400 }
      );
    }
    
    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be either "image" or "video"' },
        { status: 400 }
      );
    }
    
    if (!['Bronze', 'Silver', 'Gold', 'Platinum'].includes(tier)) {
      return NextResponse.json(
        { error: 'tier must be Bronze, Silver, Gold, or Platinum' },
        { status: 400 }
      );
    }
    
    const config = readAssetsConfig();
    
    // Проверяем, что файл существует
    const fullPath = path.join(process.cwd(), 'public', assetPath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File does not exist at the specified path' },
        { status: 404 }
      );
    }
    
    // Создаем новый ассет
    const newAsset = {
      id: Date.now().toString(),
      name,
      type,
      path: assetPath,
      tier,
      isActive: true
    };
    
    config.assets.push(newAsset);
    config.version += 1;
    
    if (writeAssetsConfig(config)) {
      return NextResponse.json({
        success: true,
        message: 'NFT asset added successfully',
        asset: newAsset,
        version: config.version
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save NFT asset' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add NFT asset' },
      { status: 500 }
    );
  }
}

// PUT: Обновить NFT ассет
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetId, updates } = body;
    
    if (!assetId || !updates) {
      return NextResponse.json(
        { error: 'assetId and updates are required' },
        { status: 400 }
      );
    }
    
    const config = readAssetsConfig();
    const assetIndex = config.assets.findIndex((asset: any) => asset.id === assetId);
    
    if (assetIndex === -1) {
      return NextResponse.json(
        { error: `Asset ${assetId} not found` },
        { status: 404 }
      );
    }
    
    // Обновляем ассет
    config.assets[assetIndex] = {
      ...config.assets[assetIndex],
      ...updates,
      id: assetId // Сохраняем ID
    };
    
    config.version += 1;
    
    if (writeAssetsConfig(config)) {
      return NextResponse.json({
        success: true,
        message: `Asset ${assetId} updated successfully`,
        asset: config.assets[assetIndex],
        version: config.version
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save asset update' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update NFT asset' },
      { status: 500 }
    );
  }
}

// DELETE: Удалить NFT ассет
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('id');
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'assetId is required' },
        { status: 400 }
      );
    }
    
    const config = readAssetsConfig();
    const assetIndex = config.assets.findIndex((asset: any) => asset.id === assetId);
    
    if (assetIndex === -1) {
      return NextResponse.json(
        { error: `Asset ${assetId} not found` },
        { status: 404 }
      );
    }
    
    const asset = config.assets[assetIndex];
    
    // Удаляем файл, если он существует
    const fullPath = path.join(process.cwd(), 'public', asset.path);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.warn('Failed to delete file:', error);
      }
    }
    
    // Удаляем ассет из конфигурации
    config.assets.splice(assetIndex, 1);
    config.version += 1;
    
    if (writeAssetsConfig(config)) {
      return NextResponse.json({
        success: true,
        message: `Asset ${assetId} deleted successfully`,
        version: config.version
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save asset deletion' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete NFT asset' },
      { status: 500 }
    );
  }
}




