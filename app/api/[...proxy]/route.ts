import { NextRequest } from 'next/server';
import { forwardToBackend } from '@/lib/api-gateway/forwarder';


export async function GET(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return forwardToBackend(req, (await params).proxy);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return forwardToBackend(req, (await params).proxy);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return forwardToBackend(req, (await params).proxy);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return forwardToBackend(req, (await params).proxy);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return forwardToBackend(req, (await params).proxy);
}
