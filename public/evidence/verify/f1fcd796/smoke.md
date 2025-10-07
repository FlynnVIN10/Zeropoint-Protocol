### healthz
HTTP/1.1 200 OK
vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch
cache-control: no-store
content-disposition: inline
content-type: application/json; charset=utf-8
x-content-type-options: nosniff
Date: Tue, 07 Oct 2025 20:25:30 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"ok":true,"service":"web","now":"2025-10-07T20:25:30.575Z"}
### readyz
HTTP/1.1 200 OK
vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch
cache-control: no-store
content-disposition: inline
content-type: application/json; charset=utf-8
x-content-type-options: nosniff
Date: Tue, 07 Oct 2025 20:25:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"ready":true,"checks":{"db":true},"now":"2025-10-07T20:25:35.713Z"}
### version
Dev
local
local
2025-10-07T19:30:00.000Z
