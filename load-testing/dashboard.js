import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 70 },
    { duration: '1m', target: 10 },
    { duration: '20s', target: 0 },
  ],
}

export default function () {
  const res = http.get('https://algostream.in/dashboard', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
      Cookie:
        'en_session=eyJzZXNzaW9uSWQiOiJjbTQ4ajlteHIwMDAwcGd5YTBob3NidjMxIiwiZXhwaXJlcyI6IjIwMjUtMDEtMDJUMTQ6MDc6MTEuMTk5WiJ9.0%2F0ZELdOpcs32vP4lnprF25B7yQ%2FoiJdcFZhbSnOsfk',
    },
  })
  check(res, { 'status was 200': r => r.status == 200 })
  // Sleep for 1 second to simulate real-world usage
  sleep(1)
}
