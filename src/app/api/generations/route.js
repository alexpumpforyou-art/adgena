import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getGenerationsByUser } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Не авторизован' }, { status: 401 });
    }

    const generations = getGenerationsByUser(user.id, 50);

    return NextResponse.json({
      success: true,
      generations: generations.map(g => ({
        id: g.id,
        type: g.type,
        templateId: g.template_id,
        sizeId: g.size_id,
        productName: g.product_name,
        imageOutput: g.image_output_path,
        status: g.status,
        createdAt: g.created_at,
      })),
    });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ success: false, error: 'Ошибка загрузки' }, { status: 500 });
  }
}
