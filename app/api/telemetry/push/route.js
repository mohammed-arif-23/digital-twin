import { NextResponse } from "next/server";

// Global in-memory telemetry store shared across all API routes
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

// Global SSE client registry
if (!global.telemetryClients) {
  global.telemetryClients = new Set();
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Update the global telemetry store
    global.telemetryStore = {
      ...global.telemetryStore,
      ...body,
      timestamp: new Date().toISOString(),
    };

    // Push real-time update to all connected SSE clients
    const payload = `data: ${JSON.stringify(global.telemetryStore)}\n\n`;
    for (const client of global.telemetryClients) {
      try {
        client.enqueue(new TextEncoder().encode(payload));
      } catch {
        global.telemetryClients.delete(client);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
