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

- cd into `./API` folder and then run `dotnet run`
- A web server should be running on _https://localhost:5001_
- We should be able to open swagger at _https://localhost:5001/swagger/index.html_

### VS Code extensions

- C#
- C# Extensions (JosKreativ): right click folder to create classes
- Auto Rename Tag: rename paired HTML/XML tags
- Bracket Pair Colorizer 2
- NuGet Gallery
- SQLite

### Trouble shooting

- If see _Unable to configure HTTPS endpoint. No server certificate was specified_ in terminal, run `dotnet dev-certs https --trust`
