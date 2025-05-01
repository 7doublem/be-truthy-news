# NC News Seeding

Set up your .env files:
1. Create 2 new files in your root directory:
  - ".env.test" for your test environment
  - ".env.development" for your development environment
2. To connect to both your test database and development database, add the following to each file:
  - Test: "PGDATABASE=nc_news_test", if you have set up a password for Postgress also include "PGPASSWORD="password""
  - Development: "PGDATABASE=nc_news", if you have set up a password for Postgress also include "PGPASSWORD="password""
