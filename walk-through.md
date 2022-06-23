## 1 Summary

- This doc is to keep track of non-code procedures for building Re-Store e-commerce app from scratch
- Key info can be found in the summary video at the end of each section
- All installed Nuget Packages and their versions can be found in _API.csproj_
- To check locally saved secrets (not on GitHub repo), run `dotnet user-secrets list`
- If prod database is corrupted, go to Heroku Postgres and click `Reset Database`, or restore from local dump

## 2 Initialise the project

### 2.1 Initialise project with dotnet CLI

- Create a new folder called _Restore_
- run `dotnet new -l` to list all project templates, we will use **webapi** and **sln**
- run `dotnet new sln` to create a new solution file _Restore.sln_ in the folder
- run `dotnet new webapi -o API` to create a new Web API project inside folder _./API_
- run `dotnet sln add API` to add project _./API/API.csproj_ to the solution

### 2.2 Setup .gitignore with dotnet CLI

- run `dotnet new gitignore` to auto create .gitignore
- Inside .gitignore, manually add `API/appsettings.json`

### 2.3 Test the newly created API project

- Update _./API/Properties/launchSettings.json_, set `"applicationUrl": "http://localhost:5000",`
- cd into _./API_ folder and then run `dotnet watch run`
- A web server should be running on _http://localhost:5000_
- We should be able to open swagger at _http://localhost:5000/swagger/index.html_

### 2.4 VS Code extensions

- C# (In settings, manually check `Omnisharp: Enable Import Completion`)
- C# Extensions (JosKreativ): right click folder to create classes
- Auto Rename Tag: rename paired HTML/XML tags
- Bracket Pair Colorizer 2
- NuGet Gallery
- SQLite

### 2.5 Trouble shooting

- If see HTTPS issues in terminal, run `dotnet dev-certs https --trust`
- Alternatively, update the _./API/Properties/launchSettings.json_, and remove `https://localhost:5001` from `applicationUrl` (only use http)

## 3 Start building the API

### 3.1 Create a new C# class for the Product entity

- Create a new folder _./API/Entities_
- Right click Entities folder and select new C# class (need C# Extensions installed in VS Code). Name it `Product`
- Inside Product class, type `prop` then hit Tab, it will auto generate a property with public getter and setter. Name it `Id`
- In the same way, add other properties such as `Name` and `Description` etc.

### 3.2 Install Entity Framework with NuGet gallery

- In VS Code, press `ctrl + shift + p` and type "nuget", then select `Open NuGet Gallery`
- Inside NuGet Gallery, find `Microsoft.EntityFrameworkCore.Sqlite`, tick `API.csproj` and click **Install**
- To avoid compatibility errors, make sure the Sqlite package version is V5 if using .NET 5. (Use Sqlite V6 for .NET 6)
- Repeat for package `Microsoft.EntityFrameworkCore.Design`, this package is for running Migration

### 3.3 Setup Database Context class using EF

- Create a new folder _./API/Data_, inside folder, create a new class _StoreContext.cs_
- Update the StoreContext class so that it is derived from `DbContext` class in EF
- Create a constructor to pass in options. Options such as DB connection string will be passed in from _Startup.cs_
- Create a new `DbSet<entity>` type of property for each entity, property name will be table name (e.g. "Products" table)

### 3.4 Add DbContext to the Startup class as a service (Dependency Injection)

- In _appsettings.Development.json_, add connection string for SQLite: `Data source=store.db`
- Go to _Startup.cs_, auto delete unused imports by `ctrl + .` and select `Remove Unnecessary Usings`.
- Inside `ConfigureServices` method, add the StoreContext, passing in option for DB connection string (for SQLite in dev)

### 3.5 Install CLI tool "dotnet-ef"

- Goto to the webpage for [dotnet-ef](https://nuget.org/packages/dotnet-ef), this is a tool for the dotnet SDK (CLI)
- In CLI, enter `dotnet tool install --global dotnet-ef --version 5.0.8`
- If see error "already installed", enter `dotnet tool list -g` to check the installed packages and versions
- To update the version of dotnet-ef, run `dotnet tool update --global dotnet-ef --version 5.0.8`
- To check the installed tool, run `dotnet ef`

### 3.6 Creating an Entity Framework Migration

- Go to API folder, run `dotnet ef migrations add InitialCreate -o Data/Migrations`, this will create migration files inside folder _./API/Data/Migrations_
- Running the `Up()` method in migration file _timestamp-InitialCreate.cs_, a database will be created with a table "Products"
- To run the migration files, run `dotnet ef database update` from API folder. This will create database (store.db) if not created yet
- Use vscode SQLite extension to check the newly created database: `ctrl + shift + p` > Open store.db with SQLite > left bar SQLite explorer

### 3.7 Programatically create and seed database

- Create class _DbInitializer.cs_ for seed data
- Add the scoped migration service into `Main()` method
- Delete the existing database: goto API folder and run `dotnet ef database drop`
- Once _store.db_ is deleted, run `dotnet watch run`
- The store.db should be re-created and seeded

## 4 Start building the frontend

### 4.1 Setup React

- Use CRA to create the project `npx creat-react-app client --template typescript --use-npm`

### 4.2 Setup Material UI

- Run `npm install @mui/material @emotion/react @emotion/styled`
- Add Roboto font by adding the link element (stylesheet) into index.html
- Add pre-built SVG icons: `npm install @mui/icons-material`
- Copy folder "images" from course assets into public folder

## 5 Shopping cart feature

### 5.1 Creating the Basket entity and BasketItem entity

- Create the Basket entity class
- Make sure CLI tool **dotnet-ef** is installed globally
- Run migration: `dotnet ef migrations add BasketEntityAdded`
- Check the migration files, make sure the relationships reflects the business model, if not then remove the migration
- Make sure the relationship in entity classes (e.g. 1-to-many) are setup on both ends
- To remove the previous migration, run `dotnet ef migrations remove`
- Once the migration files are generated, run `dotnet watch run` to apply the migration
- Once migration is done, the SQLite database should have 2 new tables: **Baskets**, **BasketItems**

## 6 Identity (login)

### 6.1 Install nuget packages

- Go to Nuget Gallery, install **Microsoft.AspNetCore.Authentication.JwtBearer**
- Also in Nuget, install **Microsoft.AspNetCore.Identity.EntityFrameworkCore**

### 6.2 Setup identity

- Create a custom entity class `User`
- User class will derive from `IdentityUser`, then User will have all the useful properties (e.g. PasswordHash)
- Update StoreContext, make sure it is now derived from `IdentityDbContext<User>`
- Seed data into db by overiding the `OnModelCreating` method

### 6.3 Create identity tables and new users in migration

- In Startup.cs, add config for auth and identity, which will create identity tables in db
- In DbInitializer.cs, add 2 users: "admin" and "bob"
- In Program.cs, modify the `Main` method to be async, and pass in userManager
- Create migration: `dotnet ef migrations add IdentityAdded`
- Re-run the app: `dotnet watch run`, this will create the tables in DB

## 7 Setup Order table

### 7.1 Add new entities for Order table

- Add new entities in folder _API/Entities/OrderAggregate_

### 7.2 Refactor identity and re-build database

- By default, the Id of Identity tables are string (GUID), need to convert them into integer
- Update Id types in User.cs, Role.cs, StoreContext.cs and Startup.cs
- Drop the current database, run `dotnet ef database drop`, this will delete _store.db_
- Remove all the migrations: delete folder _API/Data/Migrations_
- Create a new migration: `dotnet ef migrations add OrderEntityAdded -o Data/Migrations`
- The new migration file uses `<int>` for Id columns (autoincrement) in Identity tables (e.g. AspNetRoles)
- Run the migration: `dotnet watch run`, this will re-build the database with updated table structures, and re-seed the data

## 8 Stripe integration

- Webhook is used to integrate Stripe with our API, to make payment compatible in most countries
- When client click "CHECKOUT" button, API will create `PaymentIntent` and `ClientSecret` and return to client
- Frontend will use `PaymentIntent` and `ClientSecret` to interact directly with Stripe

### 8.1 Setup Stripe account

- Signup and login to Stripe
- Create a new account: **re-store**
- In dashboard, click the **Developers** tab, then select **API keys**
- Copy the publishable key and secret key and paste them into _appsettings.json_ under `StripeSettings`

### 8.0 Install Nuget package for Stripe

- Open Nuget Gallery, search for "stripe"
- Find `Stripe.net`, and install it into API.csproj

### 8.3 Setup backend API

- In `Basket.cs`, add new properties (columns) `PaymentIntentId` and `ClientSecret`
- In `Order.cs`, add new property (column) `PaymentIntentId`
- Since entities classes are changed, need to run migration
- Create new migration: `dotnet ef migrations add PaymentIntentAdded`
- Run migration: `dotnet watch run`, new columns will be added

## 9 Test card payment

- Make sure the Stripe dashboard is set to TEST mode
- Test various card [numbers](https://stripe.com/docs/testing#cards) for different payment results:
- Successful: _4242 4242 4242 4242_
- Insufficient funds decline: _4000 0000 0000 9995_
- Stolen card decline: _4000 0000 0000 9979_
- Popup authentication: _4000 0027 6000 3184_. Stripe will show a modal for further authentication

## 10 Stripe CLI and webhook

### 10.1 Setup Stripe CLI for localhost

- Download Stripe CLI file for Windows: https://stripe.com/docs/stripe-cli
- Extract the zip file, and go to the folder containing **stripe.exe**
- In that folder, run `stripe login`, then it will open a browser, click **allow access** to `re-store` project in Stripe
- Login will expire after 90 days

### 10.2 Get webhook signing secret

- Run `stripe listen`, it will give a webhook **Signing Secret** for localhost
- Copy the key and paste it to _appsettings.json_ as `WhSecret` under `StripeSettings`
- Once the app is deployed, a new **Signing Secret** will be provided and then be added as environment variable in Heroku

### 10.3 Integrate webhook in API

- In PaymentController, add a new route handler `[HttpPost("webhook")]`
- Once added, run `stripe listen -f http://localhost:5000/api/payment/webhook -e charge.succeeded`
- Above command will forward the request to localhost, pass in event: `charge.succeeded`
- While the `stripe listen` is running, make another payment in frontend, the Order Status should show `PaymentReceived`

## 11 Handle user secrets

### 11.1 Create user secrets for local machine

- user-secrets is for local machine, and need reset when running localhost (Development env) in another machine
- Run `dotnet user-secrets init` in API folder, this will add `UserSecretsId` in _API.csproj_
- Set the Stripe PublishableKey: `dotnet user-secrets set "StripeSettings:PublishableKey" <your_pub_key>`
- Set the Stripe SecretKey: `dotnet user-secrets set "StripeSettings:SecretKey" <your_sec_key>`
- Set the Stripe webhook signing secret: `dotnet user-secrets set "StripeSettings:WhSecret" <your_wh_secret>`

### 11.2 Test user secrets in localhost

- To check the secrets, run `dotnet user-secrets list`
- Once secrets are setup, remove `StripeSettings` object from _appsettings.json_
- Restart the API and stripe listener, and the app should be working fine

## 12 Deployment

### 12.1 Serve the React production build from backend

- In frontend, add _.env.development_ and _.env.production_ to store API endpoint for feach env
- Update agent.ts to use environment variables for different API end points for dev and prod
- Create a new folder _wwwroot_ in API
- In client folder, run `npm run build`, static files will be created under _build_ folder
- Copy the static files from _/client/build_ to _/API/wwwroot_
- In API, update the _startup.cs_ to serve static files

### 12.2 Switch to Postgres from SQLite

- Start docker container: `docker run --name restore_dev -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=secret -p 54321:5432 -d postgres:latest`
- Note that on Windows the exposed port should is `54321`, because `5432` is already used by PostgreSQL for Windows.
- In _appsettings.Development.json_, update ConnectionStrings
- In Nuget Gallery, install `Npgsql.EntityFrameworkCore.PostgreSQL` into API.csproj
- In Startup.cs, update the `services.AddDbContext()` by adding `opt.UseNpgsql()`
- Remove the _Migrations_ folder completely, as they were for SQLite
- Create a clean migration: `dotnet ef migrations add PostgresInitial -o Data/Migrations`
- Run the migration `dotnet watch run`, all seed data will be loaded into the postgres in docker

### 12.3 Setup Heroku

- Login to heroku, create a new app: **re-store-88**
- Install Heroku CLI, then run `heroku login`, then login throuh a popup browser page
- In project folder (re-store), run `heroku git:remote -a re-store-88`, this will add the git repo to heroku
- Once created, go to **Resources** tab, search for _Heroku Postgres_ and click
- Select the free plan: **Hobby Dev - Free**, and submit order
- Then _Heroku Postgres_ will ba attached to **re-store-88** app as DATABASE
- In Settings tab, click _Reveal Config Vars_, there will be an new env var: `DATABASE_URL` for connection string
- Also in Settings tab, under Buildpacks, click _Find nui buildpacks on Heroku Elements_, search for **dotnet**
- In search results, select `dotnetcore-buildpack` (by jincod), read the docs
- In CLI, run `heroku buildpacks:set jincod/dotnetcore`. Next release on re-store-88 will use jincod/dotnetcore.

### 12.4 Deploy to Heroku

- Add environment variables: run `dotnet user-secrets list`, add the to _Config Vars_ in Heroku
- When adding JWT secret to Heroku, make sure it is different from that in _appsettings.Development.json_
- For DB connection string, update the `services.AddDbContext` method in _startup.cs_, to use env var from Heroku
- Commit the latest changes, make sure _wwwroot_ folder is tracked
- Run `git push heroku`, this will deploy the app to Heroku
- URL: https://re-store-88.herokuapp.com

### 12.5 Add Stripe webhook

- Login into Stripe -> Developers -> Webhooks -> Add an Endpoint
- Add Endpoint URL: https://re-store-88.herokuapp.com/api/payment/webhook
- Click **Select events**, select `charge.succeeded`, the app will listen for this event
- Once the webhook endpoint is added, copy the new **Signing Secret** and paste it to the Heroku env var `StripeSettings:WhSecret`

### 12.6 Trouble shooting

- Go the the Heroku dashboard and view logs, replicate the problem while the logs window is open
- If something is wrong about payment, go to check Stripe -> Developers tab -> events

### 12.7 Connect GitHub to Heroku

- Go to Heroku -> re-store -> Deploy tab -> Deployment method
- Select GitHub, and a popup window will show up and setup connection to the _re-store_ repo in GitHub
- Once setup, any update in **master** branch on GitHub will trigger a new redeployment on Heroku
- From now on, new features should be added to a new local branch, and merge PR on GitHub

## 13 Admin role and CRUD operations

### 13.1 Add admin features

- Create a new branch: `git checkout -b Inventory`
- In _ProductsController.cs_, add an admin-only route handler `CreateProduct`, guard it with `[Authorize(Roles = "Admin")]`

### 13.2 Add automapper

- AutoMapper is used to map `Product` to `ProductDto` automatically
- Open Nuget Gallery, search for _automapper_, install `AutoMapper.Extensions.Microsoft.DependencyInjection`
- Create a helper class _API/RequestHelpers/MappingProfiles.cs_
- Add AutoMapper to _Startup.cs_, then it can be injected into `ProductController`

### 13.3 Integrate Cloudinary

- Cloudinary is used to store uploaded pictures
- Login to Cloudinary, grab `CloudName`, `ApiKey`, and `ApiSecret`
- Save them into `user-secrets` in localhost, example: `dotnet user-secrets set "Cloudinary:CloudName" "<your_cloud_name>"`
- Go to Nuget Gallery, search for _cloudinary_ and install `CloudinaryDotNet` to API.csproj
- Create a new service _ImageService.cs_ to integrate Cloudinary
- Add ImageService to _Startup.cs_, so that it can be injected into `ProductController`

### 13.4 Update Product entity and run migration

- Add a new property (column) `PublicId` in entity class _Product.cs_, to reference uploaded images
- Create a new migration: `dotnet ef mimgrations add PublicIdAdded`
- Run migration `dotnet watch run`, new column should be added to the Products table

### 13.5 Deploy the updated app with Inventory features

- Build the React app and copy the contents from _client/build_ into _API/wwwroot_
- In Heroku, add the Cloudinary secrets as environment variables
- Make sure Automatic deployment from `master` branch is enabled
- On GitHub, merge the `Inventory` branch into `master` branch, then the app will be automatically deployed to Heroku
- Database on Heroku will also be updated automatically with the new columns

## 14 Upgrade to .NET 6

### 14.1 System setup

- Download and install .NET 6 SDK
- In VS Code, upgrade the C# extension, so that omnisharp is compatible with .NET 6

### 14.2 App setup

- In _API.csproj_, update TargetFramework from `net5.0` to `net6.0`
- In _API.csproj_, update the related packages (e.g. Microsoft.EntityFrameworkCore.Design) to the latest version for .NET 6
- Once versions are updated, run `dotnet restore`
- Run `dotnet watch run`, the app should compile with warning

### 14.3 Fix warnings and errors

- To fix the warning, in _Order.cs_ add `[Required]` to the `ShippingAddress` attribute
- For Postgres format issue, update the `DateTime.Now` to `DataTime.UtcNow`

### 14.4 Apply .NET 6 minimal hosting model

- .NET 6 removed some boiler plates, DI container and middlewares now moved from _Startup.cs_ into _Program.cs_
- _Program.cs_ now uses `builder.Services` to add services to the Dependency Injection container
- _Program.cs_ uses `builder.Build()` to return a configured application `app`, which can be used to add middlewares
- Delete the *Startup.cs* file
- Move all the usings from _Program.cs_ into _GlobalUsings.cs_
- Remove unused usings from other cs files
