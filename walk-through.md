## Initialise the project

### Initialise project with dotnet CLI

- Create a new folder called _Restore_
- run `dotnet new -l` to list all project templates, we will use **webapi** and **sln**
- run `dotnet new sln` to create a new solution file _Restore.sln_ in the folder
- run `dotnet new webapi -o API` to create a new Web API project inside folder _./API_
- run `dotnet sln add API` to add project _./API/API.csproj_ to the solution

### Setup .gitignore with dotnet CLI

- run `dotnet new gitignore` to auto create .gitignore
- Inside .gitignore, manually add `API/appsettings.json`

### Test the newly created API project

- Update _./API/Properties/launchSettings.json_, set `"applicationUrl": "http://localhost:5000",`
- cd into _./API_ folder and then run `dotnet watch run`
- A web server should be running on _http://localhost:5000_
- We should be able to open swagger at _http://localhost:5000/swagger/index.html_

### VS Code extensions

- C# (In settings, manually check `Omnisharp: Enable Import Completion`)
- C# Extensions (JosKreativ): right click folder to create classes
- Auto Rename Tag: rename paired HTML/XML tags
- Bracket Pair Colorizer 2
- NuGet Gallery
- SQLite

### Trouble shooting

- If see HTTPS issues in terminal, run `dotnet dev-certs https --trust`
- Alternatively, update the _./API/Properties/launchSettings.json_, and remove `https://localhost:5001` from `applicationUrl` (only use http)

## Start building the API

### Create a new C# class for the Product entity

- Create a new folder _./API/Entities_
- Right click Entities folder and select new C# class (need C# Extensions installed in VS Code). Name it `Product`
- Inside Product class, type `prop` then hit Tab, it will auto generate a property with public getter and setter. Name it `Id`
- In the same way, add other properties such as `Name` and `Description` etc.

### Install Entity Framework with NuGet gallery

- In VS Code, press `ctrl + shift + p` and type "nuget", then select `Open NuGet Gallery`
- Inside NuGet Gallery, find `Microsoft.EntityFrameworkCore.Sqlite`, tick `API.csproj` and click **Install**
- To avoid compatibility errors, make sure the Sqlite package version is V5 if using .NET 5. (Use Sqlite V6 for .NET 6)
- Repeat for package `Microsoft.EntityFrameworkCore.Design`, this package is for running Migration

### Setup Database Context class using EF

- Create a new folder _./API/Data_, inside folder, create a new class _StoreContext.cs_
- Update the StoreContext class so that it is derived from `DbContext` class in EF
- Create a constructor to pass in options. Options such as DB connection string will be passed in from _Startup.cs_
- Create a new `DbSet<entity>` type of property for each entity, property name will be table name (e.g. "Products" table)

### Add DbContext to the Startup class as a service (Dependency Injection)

- In _appsettings.Development.json_, add connection string for SQLite: `Data source=store.db`
- Go to _Startup.cs_, auto delete unused imports by `ctrl + .` and select `Remove Unnecessary Usings`.
- Inside `ConfigureServices` method, add the StoreContext, passing in option for DB connection string (for SQLite in dev)

### Install CLI tool "dotnet-ef"

- Goto to the webpage for [dotnet-ef](https://nuget.org/packages/dotnet-ef), this is a tool for the dotnet SDK (CLI)
- In CLI, enter `dotnet tool install --global dotnet-ef --version 5.0.8`
- If see error "already installed", enter `dotnet tool list -g` to check the installed packages and versions
- To update the version of dotnet-ef, run `dotnet tool update --global dotnet-ef --version 5.0.8`
- To check the installed tool, run `dotnet ef`

### Creating an Entity Framework Migration

- Go to API folder, run `dotnet ef migrations add InitialCreate -o Data/Migrations`, this will create migration files inside folder _./API/Data/Migrations_
- Running the `Up()` method in migration file _timestamp-InitialCreate.cs_, a database will be created with a table "Products"
- To run the migration files, run `dotnet ef database update` from API folder. This will create database (store.db) if not created yet
- Use vscode SQLite extension to check the newly created database: `ctrl + shift + p` > Open store.db with SQLite > left bar SQLite explorer

### Programatically create and seed database

- Create class _DbInitializer.cs_ for seed data
- Add the scoped migration service into `Main()` method
- Delete the existing database: goto API folder and run `dotnet ef database drop`
- Once _store.db_ is deleted, run `dotnet watch run`
- The store.db should be re-created and seeded

## Start building the frontend

### Setup React

- Use CRA to create the project `npx creat-react-app client --template typescript --use-npm`

### Setup Material UI

- Run `npm install @mui/material @emotion/react @emotion/styled`
- Add Roboto font by adding the link element (stylesheet) into index.html
- Add pre-built SVG icons: `npm install @mui/icons-material`
- Copy folder "images" from course assets into public folder

## Shopping cart feature

### Creating the Basket entity and BasketItem entity

- Create the Basket entity class
- Make sure CLI tool **dotnet-ef** is installed globally
- Run migration: `dotnet ef migrations add BasketEntityAdded`
- Check the migration files, make sure the relationships reflects the business model, if not then remove the migration
- Make sure the relationship in entity classes (e.g. 1-to-many) are setup on both ends
- To remove the previous migration, run `dotnet ef migrations remove`
- Once the migration files are generated, run `dotnet watch run` to apply the migration
- Once migration is done, the SQLite database should have 2 new tables: **Baskets**, **BasketItems**

## Identity (login)

### Install nuget packages

- Go to Nuget Gallery, install **Microsoft.AspNetCore.Authentication.JwtBearer**
- Also in Nuget, install **Microsoft.AspNetCore.Identity.EntityFrameworkCore**

### Setup identity

- Create a custom entity class `User`
- User class will derive from `IdentityUser`, then User will have all the useful properties (e.g. PasswordHash)
- Update StoreContext, make sure it is now derived from `IdentityDbContext<User>`
- Seed data into db by overiding the `OnModelCreating` method

### Create identity tables and new users in migration

- In Startup.cs, add config for auth and identity, which will create identity tables in db
- In DbInitializer.cs, add 2 users: "admin" and "bob"
- In Program.cs, modify the `Main` method to be async, and pass in userManager
- Create migration: `dotnet ef migrations add IdentityAdded`
- Re-run the app: `dotnet watch run`, this will create the tables in DB

## Setup Order table

### Add new entities for Order table

- Add new entities in folder _API/Entities/OrderAggregate_

### Refactor identity and re-build database

- By default, the Id of Identity tables are string (GUID), need to convert them into integer
- Update Id types in User.cs, Role.cs, StoreContext.cs and Startup.cs
- Drop the current database, run `dotnet ef database drop`, this will delete _store.db_
- Remove all the migrations: delete folder _API/Data/Migrations_
- Create a new migration: `dotnet ef migrations add OrderEntityAdded -o Data/Migrations`
- The new migration file uses `<int>` for Id columns (autoincrement) in Identity tables (e.g. AspNetRoles)
- Run the migration: `dotnet watch run`, this will re-build the database with updated table structures, and re-seed the data

## Stripe integration

- Webhook is used to integrate Stripe with our API, to make payment compatible in most countries
- When client click "CHECKOUT" button, API will create `PaymentIntent` and `ClientSecret` and return to client
- Frontend will use `PaymentIntent` and `ClientSecret` to interact directly with Stripe

### Setup Stripe account

- Signup and login to Stripe
- Create a new account: **re-store**
- In dashboard, click the **Developers** tab, then select **API keys**
- Copy the publishable key and secret key and paste them into _appsettings.json_ under `StripeSettings`

### Install Nuget package for Stripe

- Open Nuget Gallery, search for "stripe"
- Find `Stripe.net`, and install it into API.csproj

### Setup backend API

- In `Basket.cs`, add new properties (columns) `PaymentIntentId` and `ClientSecret`
- In `Order.cs`, add new property (column) `PaymentIntentId`
- Since entities classes are changed, need to run migration
- Create new migration: `dotnet ef migrations add PaymentIntentAdded`
- Run migration: `dotnet watch run`, new columns will be added

## Test card payment

- Make sure the Stripe dashboard is set to TEST mode
- Test various card [numbers](https://stripe.com/docs/testing#cards) for different payment results:
- Successful: _4242 4242 4242 4242_
- Insufficient funds decline: _4000 0000 0000 9995_
- Stolen card decline: _4000 0000 0000 9979_
- Popup authentication: _4000 0027 6000 3184_. Stripe will show a modal for further authentication

## Stripe CLI and webhook

### Setup Stripe CLI for localhost

- Download Stripe CLI file for Windows: https://stripe.com/docs/stripe-cli
- Extract the zip file, and go to the folder containing **stripe.exe**
- In that folder, run `stripe login`, then it will open a browser, click **allow access** to `re-store` project in Stripe
- Login will expire after 90 days

### Get webhook signing secret

- Run `stripe listen`, it will give a webhook signing secret
- Copy the key and paste it to _appsettings.json_ as `WhSecret` under `StripeSettings`

### Integrate webhook in API

- In PaymentController, add a new route handler `[HttpPost("webhook")]`
- Once added, run `stripe listen -f http://localhost:5000/api/payment/webhook -e charge.succeeded`
- Above command will forward the request to localhost, pass in event: `charge.succeeded`
- While the `stripe listen` is running, make another payment in frontend, the Order Status should show `PaymentReceived`

## Handle user secrets

### Create user secrets for local machine

- user-secrets is for local machine, and need reset when running localhost (Development env) in another machine
- Run `dotnet user-secrets init` in API folder, this will add `UserSecretsId` in _API.csproj_
- Set the Stripe PublishableKey: `dotnet user-secrets set "StripeSettings:PublishableKey" <your_pub_key>`
- Set the Stripe SecretKey: `dotnet user-secrets set "StripeSettings:SecretKey" <your_sec_key>`
- Set the Stripe webhook signing secret: `dotnet user-secrets set "StripeSettings:WhSecret" <your_wh_secret>`

### Test user secrets in localhost

- To check the secrets, run `dotnet user-secrets list`
- Once secrets are setup, remove `StripeSettings` object from _appsettings.json_
- Restart the API and stripe listener, and the app should be working fine
