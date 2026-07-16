import http from 'http'
import url from 'url'
import dotenv from 'dotenv'

// Load environment variables first
dotenv.config()

// Disable TLS verification for local dev server requests (resolves proxy/antivirus SSL issues)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'


// Dynamically import database-connected handlers after dotenv has loaded the env variables
const eventsHandler = (await import('../api/events.js')).default
const impactHandler = (await import('../api/impact.js')).default
const textChatHandler = (await import('../api/text-chat.js')).default
const aiChatHandler = (await import('../api/ai-chat.js')).default

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const parsedUrl = url.parse(req.url || '', true)
  const pathname = parsedUrl.pathname
  const query = parsedUrl.query

  // Read request body
  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    let parsedBody = {}
    try {
      if (body) parsedBody = JSON.parse(body)
    } catch (e) {}

    // Mock Vercel response helper
    const vercelRes: any = {
      status(code: number) {
        res.statusCode = code
        return vercelRes
      },
      json(data: any) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
        return vercelRes
      },
      send(data: any) {
        res.end(data)
        return vercelRes
      },
      end() {
        res.end()
        return vercelRes
      },
      setHeader(name: string, value: string) {
        res.setHeader(name, value)
        return vercelRes
      }
    }

    const vercelReq: any = {
      method: req.method,
      query,
      body: parsedBody,
      headers: req.headers
    }

    try {
      if (pathname === '/api/events') {
        await eventsHandler(vercelReq, vercelRes)
      } else if (pathname === '/api/impact') {
        await impactHandler(vercelReq, vercelRes)
      } else if (pathname === '/api/text-chat') {
        await textChatHandler(vercelReq, vercelRes)
      } else if (pathname === '/api/ai-chat') {
        await aiChatHandler(vercelReq, vercelRes)
      } else {
        res.statusCode = 404
        res.end('Not Found')
      }
    } catch (err: any) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end(JSON.stringify({ error: err.message }))
    }
  })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Local backend simulation server running on http://localhost:${PORT}`)
})
