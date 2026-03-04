export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Global in-memory telemetry store (initialized in push/route.js)
if (!global.telemetryStore) {
    global.telemetryStore = {
        sessionId: null,
        timestamp: null,
        engineRunning: false,
        currentGear: "P",
        speed: 0,
        speedKmh: 0,
        rpm: 0,
        temperature: 85,
        fuelLevel: 60,
        fuelEconomy: 0,
        engineLoad: 0,
        horsepower: 0,
        acceleratorPosition: 0,
        brakePosition: 0,
        efficiency: 100,
        currentMode: "EFFICIENCY",
        recommendations: [],
        rpmHistory: Array.from({ length: 60 }, () => 0),
        speedHistory: Array.from({ length: 60 }, () => 0),
        tempHistory: Array.from({ length: 60 }, () => 85),
    };
}

if (!global.telemetryClients) {
    global.telemetryClients = new Set();
}

export async function GET(request) {
    let controllerRef = null;

    const stream = new ReadableStream({
        start(controller) {
            controllerRef = controller;

            // Register this client
            global.telemetryClients.add(controller);

            // Send current state immediately on connect
            const initial = `data: ${JSON.stringify(global.telemetryStore)}\n\n`;
            controller.enqueue(new TextEncoder().encode(initial));

            // Keep-alive heartbeat every 15s
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 15000);

            // Clean up on disconnect
            request.signal.addEventListener("abort", () => {
                clearInterval(heartbeat);
                global.telemetryClients.delete(controller);
                try {
                    controller.close();
                } catch { }
            });
        },
        cancel() {
            if (controllerRef) {
                global.telemetryClients.delete(controllerRef);
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "X-Accel-Buffering": "no",
        },
    });
}
