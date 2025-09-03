# SSE Validation

The `/api/events/training?run_id={run_id}` endpoint streams training events in Server-Sent Events (SSE) format. Each event includes `epoch`, `loss`, and `accuracy`.

## Validation Process
1. Connect to `/api/events/training?run_id={run_id}` using an SSE client.
2. Verify ≥10 events are received within 10 seconds.
3. Confirm each event contains `epoch`, `loss`, and `accuracy`.

## Test Endpoint
- **URL**: `/api/events/training/test`
- **Behavior**: Streams 10 sample events with dummy data for validation.
- **Example**:
  ```bash
  curl https://8b685ab4.zeropoint-protocol.pages.dev/api/events/training/test
  ```
  **Output**:
  ```
  data: {"epoch":1,"loss":2.5,"accuracy":0.85}
  data: {"epoch":2,"loss":2.3,"accuracy":0.87}
  ...
  ```

## Expected Event Format
```json
{
  "epoch": 1,
  "loss": 2.4567,
  "accuracy": 0.5234,
  "timestamp": "2025-09-02T23:45:00Z",
  "test_mode": true
}
```

## Validation Criteria
- **Event Count**: ≥10 events within 10 seconds
- **Event Format**: Each event contains `epoch`, `loss`, `accuracy`, `timestamp`
- **Loss Trend**: Loss should generally decrease over epochs
- **Accuracy Trend**: Accuracy should generally increase over epochs
- **Headers**: Proper SSE headers (`Content-Type: text/event-stream`)

## SCRA Verification
SCRA should verify:
1. Endpoint returns proper SSE headers
2. Streams ≥10 events in 10 seconds
3. Each event contains required fields
4. Loss shows decreasing trend
5. No mock data in production (test_mode should be false for real runs)
