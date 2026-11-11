const BASE_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080";
const API_KEY = process.env.EVOLUTION_API_KEY || "";

const headers = {
    "Content-Type": "application/json",
    apikey: API_KEY,
};

// Generates a sanitized, URL-safe instance name for Evolution API
export function getWhatsAppInstanceName(identifier: string): string {
    return `user_${identifier.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`;
}

// 1. Create or retrieve an instance for a user
export async function createWhatsAppInstance(instanceName: string) {
    try {
        const res = await fetch(`${BASE_URL}/instance/create`, {
            method: "POST",
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
                instanceName,
                qrcode: true,
                integration: "WHATSAPP-BAILEYS",
                rejectCall: false,
                msgCall: "",
                groupsIgnore: false,
                alwaysOnline: true,
                readMessages: false,
                readStatus: false,
                syncFullHistory: false,
            }),
        });
        return await res.json().catch(() => null);
    } catch (err: any) {
        console.error(`[createWhatsAppInstance] Failed for ${instanceName}:`, err?.message || err);
        return null;
    }
}

// 2. Fetch the QR code for the user to scan
export async function getConnectQrCode(instanceName: string) {
    try {
        const res = await fetch(`${BASE_URL}/instance/connect/${instanceName}`, {
            method: "GET",
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return null;
        return await res.json().catch(() => null);
    } catch (err: any) {
        console.error(`[getConnectQrCode] Failed for ${instanceName}:`, err?.message || err);
        return null;
    }
}

// 3. Send a text message
export async function sendWhatsAppMessage({
    instanceName,
    recipientNumber,
    text,
}: {
    instanceName: string;
    recipientNumber: string;
    text: string;
}) {
    // Check if instance is connected first
    const connection = await getWhatsAppConnectionState(instanceName);
    if (connection?.state !== "open") {
        throw new Error(
            `WhatsApp instance is not currently connected (status: ${connection?.state || "disconnected"}). Please link WhatsApp in Dashboard > Integrations.`
        );
    }

    // Format number: e.g. "919903194832" (international country code + number, no '+' or spaces)
    const cleanNumber = recipientNumber.replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 8) {
        throw new Error("Invalid recipient phone number. Please include the international country code without '+' or spaces.");
    }

    const res = await fetch(`${BASE_URL}/message/sendText/${instanceName}`, {
        method: "POST",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
            number: cleanNumber,
            text,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.response?.message || "Failed to send WhatsApp message");
    }

    return res.json();
}

// 4. Check connection state (e.g. "open", "close", "connecting", "not_found")
export async function getWhatsAppConnectionState(instanceName: string) {
    try {
        const res = await fetch(`${BASE_URL}/instance/connectionState/${instanceName}`, {
            method: "GET",
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
        });
        if (res.status === 404) {
            return { state: "not_found" };
        }
        if (!res.ok) {
            return { state: "close" };
        }
        const data = await res.json().catch(() => null);
        return data?.instance || data || { state: "close" };
    } catch {
        return { state: "close" };
    }
}

// 5. Logout instance from Evolution API
export async function logoutWhatsAppInstance(instanceName: string) {
    try {
        const res = await fetch(`${BASE_URL}/instance/logout/${instanceName}`, {
            method: "DELETE",
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return { success: false };
        return await res.json().catch(() => ({ success: true }));
    } catch {
        return { success: false };
    }
}

// 6. Delete instance completely from Evolution API (wipes instance and credentials)
export async function deleteWhatsAppInstance(instanceName: string) {
    try {
        const res = await fetch(`${BASE_URL}/instance/delete/${instanceName}`, {
            method: "DELETE",
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return { success: false };
        return await res.json().catch(() => ({ success: true }));
    } catch {
        return { success: false };
    }
}

