import { NextRequest, NextResponse } from 'next/server';
import { getContacts, writeContacts } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const contacts = getContacts();
    const newContact = {
      id: 'con_' + Math.random().toString(36).substring(2, 11),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      created_at: new Date().toISOString()
    };

    contacts.push(newContact);
    writeContacts(contacts);

    return NextResponse.json({ success: true, contact: newContact });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Failed to record contact message' }, { status: 500 });
  }
}
