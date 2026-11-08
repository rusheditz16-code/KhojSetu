import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/server-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || undefined;
  const category = searchParams.get('category') || undefined;
  const zone = searchParams.get('zone') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const items = serverStore.getItems({ type, category, zone, status, search });
  return NextResponse.json({ items, count: items.length });
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'usr-priya-01';
    const contentType = request.headers.get('content-type') || '';

    let data: any = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        type: (formData.get('type') as string) || 'LOST',
        title: formData.get('title') as string,
        category: (formData.get('category') as string) || 'electronics',
        campusArea: formData.get('location_campus_area') as string,
        zone: (formData.get('location_zone') as string) || 'library',
        latitude: parseFloat((formData.get('latitude') as string) || '12.9716'),
        longitude: parseFloat((formData.get('longitude') as string) || '77.5946'),
        incidentDate: (formData.get('incident_date') as string) || new Date().toISOString(),
        description: formData.get('description') as string,
        secretPrompt: formData.get('secret_verification_prompt') as string,
      };

      // If photo was provided in form data, provide realistic placeholder
      const photo = formData.get('photo') as File | null;
      if (photo && photo.size > 0) {
        data.photoUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80';
      }
    } else {
      data = await request.json();
    }

    if (!data.title || data.title.trim().length < 3) {
      return NextResponse.json({ message: 'Title must be at least 3 characters' }, { status: 400 });
    }

    const item = serverStore.createItem({
      ...data,
      userId,
    });

    return NextResponse.json({ item, message: 'Item reported successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create item' }, { status: 500 });
  }
}
