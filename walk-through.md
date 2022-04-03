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

- Create a new folder _Entities_
- Right click Entities folder and select new C# class (need C# Extensions installed in VS Code). Name it `Product`
- Inside Product class, type `prop` then hit Tab, it will auto generate a property with public getter and setter. Name it `Id`
- In the same way, add other properties such as `Name` and `Description` etc.
