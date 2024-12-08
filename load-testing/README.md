# Load testing

I'm using k6 for load testing and this folder has all scripts required for load
testing.

## Server Specs

Note: using aws for deployment with bare minimum specs availabe in free tier.
For vm using ec2 instance and for db using RDS postgreSQL instance.

```yml
VM Info:
vCPUs: 1
RAM: 1GB
SWAP File/Partition: 1GB
OS: Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-1019-aws x86_64)
Storage: 15GB General Purpose SSD (gp3)

DB Info:
vCPUs: 2
RAM: 1GB
PostgreSQL version: 16.3
Storage: 20GB General Purpose SSD (gp2)
```

## how to run tests

Please install k6 if not already from:
https://grafana.com/docs/k6/latest/set-up/install-k6/?pg=oss-k6&plcmt=deploy-box-1

To run test

```
k6 run script.js
```

To check docker warm server load

```
docker stats --all --format "table {{.ID}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## Results

I only checked endpoints that are not dependent on third party brokers (In our
case AngelOne)

```bash
Endpoint: https://algostream.in/dashboard
scenarios: (100.00%) 1 scenario, 20 max VUs, 2m50s max duration (incl. graceful stop):
        * default: Up to 20 looping VUs for 2m20s over 3 stages (gracefulRampDown: 30s, gracefulStop: 30s)


✓ status was 200

checks.........................: 100.00% 1432 out of 1432
data_received..................: 41 MB   295 kB/s
data_sent......................: 393 kB  2.8 kB/s
http_req_blocked...............: avg=1.63ms   min=123ns   med=743ns    max=136.64ms p(90)=1.18µs   p(95)=1.34µs
http_req_connecting............: avg=665.26µs min=0s      med=0s       max=65.53ms  p(90)=0s       p(95)=0s
http_req_duration..............: avg=267.19ms min=99.05ms med=237.58ms max=667.86ms p(90)=460.52ms p(95)=502.07ms
  { expected_response:true }...: avg=267.19ms min=99.05ms med=237.58ms max=667.86ms p(90)=460.52ms p(95)=502.07ms
http_req_failed................: 0.00%   0 out of 1432
http_req_receiving.............: avg=116.96ms min=40.16ms med=95.17ms  max=358.8ms  p(90)=223.05ms p(95)=257.36ms
http_req_sending...............: avg=99.75µs  min=10.89µs med=102.85µs max=368.9µs  p(90)=135.48µs p(95)=150.21µs
http_req_tls_handshaking.......: avg=953.08µs min=0s      med=0s       max=84.68ms  p(90)=0s       p(95)=0s
http_req_waiting...............: avg=150.13ms min=55.23ms med=126.85ms max=373.64ms p(90)=268.87ms p(95)=290.79ms
http_reqs......................: 1432    10.209774/s
iteration_duration.............: avg=1.26s    min=1.1s    med=1.24s    max=1.66s    p(90)=1.46s    p(95)=1.5s
iterations.....................: 1432    10.209774/s
vus............................: 1       min=1            max=20
vus_max........................: 20      min=20           max=20
```

```bash
Endpoint: https://algostream.in/dashboard
scenarios: (100.00%) 1 scenario, 70 max VUs, 2m50s max duration (incl. graceful stop):
        * default: Up to 70 looping VUs for 2m20s over 4 stages (gracefulRampDown: 30s, gracefulStop: 30s)



✓ status was 200

checks.........................: 100.00% 2304 out of 2304
data_received..................: 67 MB   477 kB/s
data_sent......................: 808 kB  5.8 kB/s
http_req_blocked...............: avg=3.87ms   min=134ns   med=720ns    max=197ms    p(90)=1.16µs   p(95)=1.39µs
http_req_connecting............: avg=1.53ms   min=0s      med=0s       max=89.9ms   p(90)=0s       p(95)=0s
http_req_duration..............: avg=837.48ms min=99.93ms med=816.16ms max=2.13s    p(90)=1.8s     p(95)=1.84s
  { expected_response:true }...: avg=837.48ms min=99.93ms med=816.16ms max=2.13s    p(90)=1.8s     p(95)=1.84s
http_req_failed................: 0.00%   0 out of 2304
http_req_receiving.............: avg=393.87ms min=41.09ms med=364.9ms  max=1.31s    p(90)=819.73ms p(95)=994.74ms
http_req_sending...............: avg=94.73µs  min=11.11µs med=90.36µs  max=4.32ms   p(90)=131.93µs p(95)=149.67µs
http_req_tls_handshaking.......: avg=2.32ms   min=0s      med=0s       max=113.02ms p(90)=0s       p(95)=0s
http_req_waiting...............: avg=443.51ms min=56.11ms med=392.4ms  max=1.3s     p(90)=1s       p(95)=1.08s
http_reqs......................: 2304    16.44723/s
iteration_duration.............: avg=1.84s    min=1.1s    med=1.81s    max=3.13s    p(90)=2.8s     p(95)=2.84s
iterations.....................: 2304    16.44723/s
vus............................: 1       min=1            max=70
vus_max........................: 70      min=70           max=70
```
