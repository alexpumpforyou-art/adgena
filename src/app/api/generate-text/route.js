import { NextResponse } from 'next/server';
import { generateProductText, generateAdCopy } from '@/lib/apiyi';

export async function POST(request) {
  try {
    const body = await request.json();
    const { productName, category, type, keywords } = body;

    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'productName is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'ads') {
      result = await generateAdCopy({
        productName,
        targetAudience: category,
        platform: 'universal',
        tone: 'продающий',
      });
    } else {
      result = await generateProductText({
        productName,
        category,
        keywords,
        language: 'ru',
      });
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Text generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
