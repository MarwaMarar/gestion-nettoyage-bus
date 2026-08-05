 # Migration PostgreSQL

PostgreSQL is the active database. Credentials are supplied only through
environment variables; no password is stored in this repository.

## Start the backend locally

On Windows, run `run-backend-postgresql.cmd`. It securely prompts for the
`alsa_app` password, keeps it only in the process environment, and starts the
backend at `http://localhost:8080`. Use `Ctrl+C` to stop it.

## Active configuration

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/alsa_clean_fleet'
$env:DB_USERNAME='alsa_app'
# Set DB_PASSWORD interactively in the terminal that launches the application.
```

For normal process startup, expose `DB_PASSWORD` through the deployment secret
manager or set it interactively in the launching terminal. Do not commit it.

## Temporary MySQL rollback

The MySQL JDBC and Flyway support dependencies are intentionally retained until
PostgreSQL is fully accepted. To point the application back to the untouched
source database, launch it with these environment settings:

```powershell
$env:DB_URL='jdbc:mysql://localhost:3306/alsa_clean_fleet?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true'
$env:DB_USERNAME='root'
# Set DB_PASSWORD interactively in the terminal that launches the application.
$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME='com.mysql.cj.jdbc.Driver'
$env:SPRING_FLYWAY_LOCATIONS='classpath:db/migration'
```

Never run PostgreSQL migration scripts against MySQL. The source MySQL database
and its external dump must remain untouched until final acceptance.
