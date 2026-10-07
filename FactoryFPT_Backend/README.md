# FactoryFPT — Web & Data Pipeline

## Stack
- .NET 8 / ASP.NET Core Web API
- EF Core + SQL Server
- BackgroundService + bounded Channel queue
- SignalR realtime dashboard
- JWT-ready authentication
- Swagger
- Docker Compose

## Architecture
Hardware -> Ingestion API -> Queue -> Processing Worker -> SQL Server -> API -> Dashboard /Dataset API

## Run locally
1. Install .NET 8 SDK.
2. Start SQL Server or run `docker compose up -d sqlserver`.
3. Update `src/FactoryFPT.Api/appsettings.json` if your SQL connection differs.
4. Run `dotnet restore` then `dotnet run --project src/FactoryFPT.Api`.
5. Open `/swagger` for APIs and `/` for Dashboard.

## Demo flow
1. POST `/api/v1/sessions` with `{ "deviceCode":"D001", "operatorCode":"Huy" }`.
2. Copy returned `id`.
3. POST `/api/v1/ingestion/batch` with that session ID and sample array.
4. Worker writes samples and pushes SignalR events.
5. Dashboard subscribes to `session:{id}`.
6. We can GET `/api/v1/datasets/{sessionId}` to train model AI.

## Important scale note
The queue is an in-memory bounded Channel for the MVP. Each queued batch carries its `SessionId`. When scaling to multiple API instances, replace it with RabbitMQ/Kafka/Azure Service Bus while preserving that message contract. Also consider a time-series database or partitioned/object storage for very high-volume raw data.

## Production hardening
- Replace EnsureCreated with EF Core migrations.
- Use real JWT issuer/audience/signing key from secret storage.
- Add idempotency keys to ingestion batches.
- Add device authentication/API keys or mTLS.
- Add retry/dead-letter handling when using a broker.
- Use bulk insert for very high throughput.
- Add retention/archive policy.
- Add structured logging and metrics.
