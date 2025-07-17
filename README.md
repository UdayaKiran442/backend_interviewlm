To install dependencies:
```sh
bun install
```

To run server in development environment:
```sh
bun run dev
```

To run server in production environment:
```sh
bun run prod
```

open http://localhost:3000


# Migration Script for running drizzle schemas

```sh
npx drizzle-kit generate
```

# Coding Guidelines
## 1. Naming Conventions

### 1.1. Variables
- Use camal case for all variable names
- Example userName, getUser()

### 1.2. Constants
- Use uppercase for all constants
- Example USER_NAME, USER_COUNT

### 1.3. Classes and constructors
- Use PasacalCase for all classes
- Example UserManager

### 1.4 File names
- Use dot notation
- Example user.controller.ts


## 2. Folder Structure

```
src/
├── controllers/
├── exceptions/
├── repositories/
├── routes/
├── services/
├── utils/
└── index.ts
└── README.md
└── drizzle.config.ts
└── .env.*
└── package.json
└── tsconfig.json
└── .gitignore
```

### 2.1. Controllers
- Use dot notation for controller names
- Example user.controller.ts
- Controllers are used to handle the business logic of the application, to call services or repositories

### 2.2. Exceptions
- Use dot notation for exception names
- Example user.exception.ts
- Exceptions are used to handle the errors that occur in the application
- Use PascalCase for exception names
- Example AddUserError

### 2.3. Repositories
- Use dot notation for repository names
- Example user.repository.ts
- Repositories are used to handle the database operations of the applications, such as adding, updating, deleting, and fetching data from the database
- Core business logic should not be present in repositories, only database operations should be present
- Use camelCase for repository names
- Example addUserInDB

### 2.4. Routes
- Use dot notation for route names
- Example user.route.ts
- Routes are used to handle the routing of the application
- Use zod to validate the request body and to create schema for the payload
- Routes are versioned
- Example /api/v1/auth/login
- While creating a new version of any route always write it in the new version folder
- Example if v3 version of auth route is created, write it in src/routes/v3/auth/auth.route.ts

### 2.5. Services
- Use dot notation for service names
- Example user.service.ts
- Services are used to call third party APIs such as openai, google, pinecone, etc.

### 2.6. Utils
- Use dot notation for utility names
- Example user.utils.ts
- Utilities are used to handle reusable functions of the application

### 2.7. Index
- Contains core server of the application
- Handles the routing of the application, cors and other middleware

### 2.8. README.md
- Contains the documentation of the application
- Includes installation and setup instructions, api documentation, and other relevant information

### 2.9. drizzle.config.ts
- Contains the configuration for drizzle
- Drizzle config is used to generate the sql queries for the database as per the schema

### 2.10. .env
- Contains the environment variables for the application
- Should not be committed to the repository

### 2.11. package.json
- Contains the dependencies and scripts for the application

### 2.12. tsconfig.json
- Contains the configuration for typescript

### 2.13. .gitignore
- Contains the files and directories that should not be committed to the repository
