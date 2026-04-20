/*



import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'



export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization')

  const USER = 't732666'
  const PASS = '21Huelvaasas'

  if (auth) {
    const encoded = auth.split(' ')[1]
    const decoded = Buffer.from(encoded, 'base64').toString()
    const [user, pass] = decoded.split(':')

    if (user === USER && pass === PASS) {
      return NextResponse.next()
    }
  }

  return new Response('Acceso restringido', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Zona privada"',
    },
  })
}



*/
