import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return new Response('Address required', { status: 400 });
  }

  // Создаем Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      // Отправляем начальное сообщение
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', address })}\n\n`);

      // Симулируем события каждые 30 секунд
      const interval = setInterval(() => {
        const event = {
          type: 'nft_update',
          address,
          timestamp: Date.now(),
          message: 'Checking for new NFTs...'
        };
        
        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
      }, 30000);

      // Очистка при закрытии соединения
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
