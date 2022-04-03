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

- C#
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
