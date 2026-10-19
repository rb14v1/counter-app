# counter-app

A counter dashboard with a React frontend and an Express API that stores the value in MySQL.

```
frontend/   Vite, React and TypeScript. Calls the API at VITE_API_URL. server.js serves the built files.
backend/    Express and mysql2. Serves /api/counter and /healthz.
```

## Run it locally

You need Node 20 or later and a MySQL server.

```
cd backend
cp .env.example .env        # set DATABASE_URL, for example mysql://user:password@localhost:3306/appdb
npm install
npm run migrate             # creates the counter table; safe to run again
npm start                   # listens on port 8080

cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev                 # opens on http://localhost:5173
```

## Backend settings

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string. Without it the API answers 503 and `/healthz` reports `not configured`. |
| `FRONTEND_URL` | Comma-separated frontend origins allowed to call the API. Leave it unset to allow any origin. |
| `PORT` | Port to listen on. Defaults to 8080. |

## Database

`npm run migrate` creates one table, `counter`, holding a single row. It is idempotent: it creates the table only if it is missing and never resets the value.

## API

| Method and path | Purpose |
|---|---|
| `GET /healthz` | Health check. Always 200 while the server is up. |
| `GET /api/counter` | The current value, as `{ "value": 0 }`. |
| `POST /api/counter/increment` | Add one. |
| `POST /api/counter/decrement` | Subtract one. |
| `POST /api/counter/reset` | Set to zero. |
| `PUT /api/counter` | Set the value from `{ "value": 42 }`. It must be a whole number. |

## Database backups

The `terraform/` directory contains the Terraform configuration for the RDS MySQL instance and its backup policy.

### Backup configuration

| Setting | Value |
|---|---|
| Engine | MySQL 8.0 on AWS RDS |
| Automated backups (PITR) | Enabled — `backup_retention_period = 30` days |
| Backup window | 02:00–03:00 UTC daily |
| Cross-region copy | AWS Backup copies each daily snapshot to `var.backup_region` (default `us-west-2`) within 24 hours |
| Secondary vault retention | 30 days |
| Encryption at rest | Enabled (`storage_encrypted = true`) |

Point-in-time recovery (PITR) is automatically available for any timestamp within the 30-day retention window because `backup_retention_period > 0` enables continuous transaction-log archiving in RDS.

### Restore procedure

#### Point-in-time restore (preferred for recent data loss)

```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier counter-app-mysql \
  --target-db-instance-identifier counter-app-mysql-restored \
  --restore-time 2024-01-15T06:00:00Z   # replace with target timestamp (UTC, within 30-day window)
```

After the instance becomes `available`, update `DATABASE_URL` in the application environment to point at the new endpoint, then run `npm run migrate` (idempotent) to confirm the schema is intact.

#### Restore from a cross-region snapshot (disaster recovery)

1. List available recovery points in the secondary vault:

   ```bash
   aws backup list-recovery-points-by-backup-vault \
     --backup-vault-name counter-app-backup-vault-secondary \
     --region us-west-2
   ```

2. Start the restore job from the chosen recovery point ARN:

   ```bash
   aws backup start-restore-job \
     --recovery-point-arn <recovery-point-arn> \
     --iam-role-arn arn:aws:iam::<account-id>:role/counter-app-backup-role \
     --region us-west-2 \
     --metadata '{"engine":"mysql","instanceClass":"db.t3.micro","multiAZ":"false","dbInstanceIdentifier":"counter-app-mysql-dr"}'
   ```

3. Once the instance is `available`, point `DATABASE_URL` at the restored endpoint and run `npm run migrate`.

#### Pre-go-live restore test

Before go-live, perform a PITR restore to a non-production identifier (e.g. `counter-app-mysql-test-restore`), confirm `SELECT value FROM counter WHERE id = 1` returns the expected value, then delete the test instance. Record the test date and result in the incident log.
