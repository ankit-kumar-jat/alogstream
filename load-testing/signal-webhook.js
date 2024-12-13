import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  vus: 20,
  duration: '10s',
}

// update signal webhook keys here
const signalKeys = [
  'cm4ck1lbp0003ehhowb9mc2fh',
  'cm4cj29t80001ehhodhv0c7nn',
  'cm4mmdp1d000113f0n0pivibr',
]

export default function () {
  let randomIndex = Math.floor(Math.random() * signalKeys.length)
  let signalKey = signalKeys[randomIndex]

  const res = http.post(
    `http://localhost:3000/webhook/signal?key=${signalKey}`,
    JSON.stringify({
      txnType: 'BUY',
    }),
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
      },
    },
  )
  check(res, { 'status was 200': r => r.status == 200 })
  // Sleep for 1 second to simulate real-world usage
  sleep(1)
}
