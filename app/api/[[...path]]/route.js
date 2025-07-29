import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Digital Twin Car API",
        version: "1.0.0",
        endpoints: {
          "GET /api/": "API information",
          "POST /api/car-state": "Save car simulation state",
          "GET /api/car-state": "Get saved car states",
          "GET /api/car-state/:id": "Get specific car state"
        }
      }))
    }

    if (route === '/car-state' && method === 'POST') {
      const body = await request.json()
      
      const carState = {
        id: uuidv4(),
        engineRunning: body.engineRunning || false,
        currentGear: body.currentGear || 'P',
        speed: body.speed || 0,
        rpm: body.rpm || 0,
        temperature: body.temperature || 85,
        fuel: body.fuel || 60,
        mileage: body.mileage || 0,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        sessionId: body.sessionId || uuidv4()
      }

      await db.collection('car_states').insertOne(carState)
      
      const { _id, ...cleanedCarState } = carState
      return handleCORS(NextResponse.json(cleanedCarState))
    }

    if (route === '/car-state' && method === 'GET') {
      const url = new URL(request.url)
      const sessionId = url.searchParams.get('sessionId')
      const limit = parseInt(url.searchParams.get('limit')) || 50

      let query = {}
      if (sessionId) {
        query.sessionId = sessionId
      }

      const carStates = await db.collection('car_states')
        .find(query)
        .limit(limit)
        .sort({ timestamp: -1 })
        .toArray()

      const cleanedCarStates = carStates.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json(cleanedCarStates))
    }

    if (route.startsWith('/car-state/') && method === 'GET') {
      const id = route.split('/car-state/')[1]
      
      const carState = await db.collection('car_states').findOne({ id })
      
      if (!carState) {
        return handleCORS(NextResponse.json(
          { error: "Car state not found" }, 
          { status: 404 }
        ))
      }

      const { _id, ...cleanedCarState } = carState
      return handleCORS(NextResponse.json(cleanedCarState))
    }

    if (route === '/metrics' && method === 'GET') {
      const totalStates = await db.collection('car_states').countDocuments()
      const uniqueSessions = await db.collection('car_states').distinct('sessionId')
      
      const recentStates = await db.collection('car_states')
        .find({})
        .limit(100)
        .sort({ timestamp: -1 })
        .toArray()

      const avgSpeed = recentStates.length > 0 
        ? recentStates.reduce((sum, state) => sum + (state.speed || 0), 0) / recentStates.length
        : 0

      const avgRpm = recentStates.length > 0
        ? recentStates.reduce((sum, state) => sum + (state.rpm || 0), 0) / recentStates.length
        : 0

      const avgTemperature = recentStates.length > 0
        ? recentStates.reduce((sum, state) => sum + (state.temperature || 85), 0) / recentStates.length
        : 85

      const avgMileage = recentStates.length > 0
        ? recentStates.reduce((sum, state) => sum + (state.mileage || 0), 0) / recentStates.length
        : 0

      const engineRunningCount = recentStates.filter(state => state.engineRunning).length
      const engineRunningPercentage = recentStates.length > 0 
        ? (engineRunningCount / recentStates.length) * 100 
        : 0

      const metrics = {
        totalSimulations: totalStates,
        uniqueSessions: uniqueSessions.length,
        averageSpeed: Math.round(avgSpeed * 100) / 100,
        averageRPM: Math.round(avgRpm),
        averageTemperature: Math.round(avgTemperature * 100) / 100,
        averageMileage: Math.round(avgMileage * 100) / 100,
        engineRunningPercentage: Math.round(engineRunningPercentage * 100) / 100,
        lastUpdated: new Date()
      }

      return handleCORS(NextResponse.json(metrics))
    }

    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute