import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createWhatsAppInstance, getConnectQrCode, getWhatsAppInstanceName, getWhatsAppConnectionState, deleteWhatsAppInstance } from "@/lib/evolution";

export async function GET(req: Request) {
    const user = await currentUser().catch(() => null);
    const identifier = user?.primaryEmailAddress?.emailAddress || user?.id;

    if (!identifier) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instanceName = getWhatsAppInstanceName(identifier);
    const stateData = await getWhatsAppConnectionState(instanceName);
    const isConnected = stateData?.state === "open";

    return NextResponse.json({
        instanceName,
        status: stateData?.state || "close",
        isConnected,
    });
}

export async function POST(req: Request) {
    const user = await currentUser().catch(() => null);
    const identifier = user?.primaryEmailAddress?.emailAddress || user?.id;

    if (!identifier) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const forceRefresh = Boolean(body?.forceRefresh);

    // Each user gets their own isolated instance name matched to their account
    const instanceName = getWhatsAppInstanceName(identifier);

    try {
        const currentState = await getWhatsAppConnectionState(instanceName);

        // If already connected and not forcing a refresh, return existing open state
        if (!forceRefresh && currentState?.state === "open") {
            return NextResponse.json({
                instanceName,
                status: "open",
                isConnected: true,
            });
        }

        let qrCode: string | null = null;

        // If the instance is already in 'connecting' and not forcing a refresh, try to get existing QR code
        if (!forceRefresh && currentState?.state === "connecting") {
            const connectData = await getConnectQrCode(instanceName);
            qrCode = connectData?.base64 || connectData?.qrcode?.base64 || null;
            if (qrCode) {
                return NextResponse.json({
                    instanceName,
                    qrCode,
                    status: "connecting",
                });
            }
        }

        // If forcing a refresh, or if instance was closed/not_found/stuck without a valid QR:
        // Delete any existing instance to ensure fresh clean credentials
        if (currentState?.state !== "not_found") {
            await deleteWhatsAppInstance(instanceName).catch(() => null);
        }

        // Attempt fresh creation (which returns the QR code directly in Evolution API v2)
        const createRes = await createWhatsAppInstance(instanceName);
        qrCode = createRes?.qrcode?.base64 || createRes?.base64 || null;

        // Fallback to connect endpoint if create didn't include the base64 QR directly
        if (!qrCode) {
            const connectData = await getConnectQrCode(instanceName);
            qrCode = connectData?.base64 || connectData?.qrcode?.base64 || null;
        }

        const status = qrCode ? "connecting" : "waiting";

        return NextResponse.json({
            instanceName,
            qrCode,
            status,
        });
    } catch (error: any) {
        console.error(`[POST /api/agent/tools/whatsapp] Error for ${instanceName}:`, error?.message || error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}
