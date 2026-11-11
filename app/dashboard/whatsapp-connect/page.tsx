"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Loader2,
    QrCode,
    RefreshCw,
    Smartphone,
    AlertCircle,
    ArrowLeft,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhatsAppConnectPage() {
    const router = useRouter();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("loading");
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef<number>(0);

    const fetchQr = useCallback(async (force: boolean = false) => {
        try {
            setError(null);
            if (force) {
                setIsRefreshing(true);
            } else {
                setStatus("loading");
            }

            const res = await fetch("/api/agent/tools/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ forceRefresh: force }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to load WhatsApp QR Code");
            }

            if (data?.status === "open" || data?.isConnected) {
                setIsConnected(true);
                setStatus("open");
                return;
            }

            if (data?.qrCode) {
                setQrCode(data.qrCode);
                setStatus("ready");
                retryCountRef.current = 0;
            } else {
                setStatus(data?.status || "waiting");
                // If waiting for QR, retry up to 3 times with a short pause
                if (retryCountRef.current < 3) {
                    retryCountRef.current += 1;
                    retryTimeoutRef.current = setTimeout(() => {
                        fetchQr(false);
                    }, 3000);
                }
            }
        } catch (err: any) {
            setError(err?.message || "Could not connect to WhatsApp service");
            setStatus("error");
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchQr(false);
        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        };
    }, [fetchQr]);

    // Polling for connection status
    useEffect(() => {
        if (isConnected) return;

        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch("/api/agent/tools/whatsapp", { method: "GET" });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.isConnected || data?.status === "open") {
                        setIsConnected(true);
                        setStatus("open");
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

                        // Auto-navigate or close popup after 2 seconds
                        setTimeout(() => {
                            if (window.opener) {
                                window.close();
                            } else {
                                router.push("/dashboard/integrations");
                            }
                        }, 2000);
                    }
                }
            } catch {}
        }, 2500);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [isConnected, router]);

    const handleDisconnectAndReconnect = async () => {
        setIsRefreshing(true);
        try {
            await fetch("/api/agent/tools/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolSlug: "whatsapp" }),
            });
            setIsConnected(false);
            setQrCode(null);
            await fetchQr(true);
        } catch (err: any) {
            setError(err?.message || "Failed to reset WhatsApp connection");
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            {/* Top Navigation */}
            <div className="w-full max-w-md mb-2 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (window.opener) {
                            window.close();
                        } else {
                            router.push("/dashboard/integrations");
                        }
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 gap-1.5 p-0 h-auto"
                >
                    <ArrowLeft className="size-3.5" /> Back to Integrations
                </Button>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-[#25D366] px-6 py-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Smartphone className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Link WhatsApp</h1>
                            <p className="text-xs text-emerald-100">StratX Personal WhatsApp Integration</p>
                        </div>
                    </div>
                    {status === "ready" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isRefreshing}
                            onClick={() => fetchQr(true)}
                            className="text-white hover:bg-white/20 rounded-lg p-2 h-auto"
                            title="Regenerate QR Code"
                        >
                            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center text-center">
                    {isConnected ? (
                        <div className="py-8 flex flex-col items-center">
                            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                                <CheckCircle2 className="size-10" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">WhatsApp Connected!</h2>
                            <p className="text-sm text-slate-500 mt-2 max-w-xs">
                                Your account is linked and ready for autonomous agent messaging.
                            </p>
                            <div className="flex flex-col gap-2 mt-6 w-full max-w-xs">
                                <Button
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl"
                                    onClick={() => {
                                        if (window.opener) {
                                            window.close();
                                        } else {
                                            router.push("/dashboard/integrations");
                                        }
                                    }}
                                >
                                    Return to Integrations
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isRefreshing}
                                    onClick={handleDisconnectAndReconnect}
                                    className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl text-xs gap-1.5"
                                >
                                    <LogOut className="size-3.5" /> Unlink & Connect New Phone
                                </Button>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="py-6 flex flex-col items-center">
                            <div className="size-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                                <AlertCircle className="size-8" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Connection Failed</h2>
                            <p className="text-xs text-slate-500 mt-2 max-w-sm px-2">
                                {error}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                The cloud WhatsApp server may be waking up or resetting. Please retry.
                            </p>
                            <Button
                                onClick={() => fetchQr(true)}
                                disabled={isRefreshing}
                                className="mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs"
                            >
                                <RefreshCw className={`size-3.5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} /> Retry Fresh Connection
                            </Button>
                        </div>
                    ) : status === "loading" || isRefreshing ? (
                        <div className="py-12 flex flex-col items-center">
                            <Loader2 className="size-10 text-[#25D366] animate-spin mb-4" />
                            <p className="text-sm font-medium text-slate-600">
                                {isRefreshing ? "Regenerating fresh QR Code..." : "Connecting to WhatsApp gateway..."}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">This may take a few seconds</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            <div className="relative bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner my-2">
                                {qrCode ? (
                                    <img
                                        src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                                        alt="WhatsApp QR Code"
                                        className="size-60 object-contain rounded-lg"
                                    />
                                ) : (
                                    <div className="size-60 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                        <Loader2 className="size-8 text-emerald-500 animate-spin mb-2" />
                                        <span className="text-xs">Preparing pairing code...</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isRefreshing}
                                    onClick={() => fetchQr(true)}
                                    className="text-xs text-slate-500 hover:text-slate-800 gap-1.5 h-8"
                                >
                                    <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} /> Regenerate QR Code
                                </Button>
                            </div>

                            {/* Instructions */}
                            <div className="w-full mt-4 text-left bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    How to link:
                                </p>
                                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                                    <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
                                    <li>Tap <strong>Settings</strong> (iOS) or <strong>Menu ⋮</strong> (Android)</li>
                                    <li>Select <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></li>
                                    <li>Point your camera at this QR code to scan</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
