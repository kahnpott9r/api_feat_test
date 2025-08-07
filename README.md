# Leanspot NestJS API

This is the backend codebase for Leanspot, a SaaS application designed for rental property owners. This NestJS API provides the necessary endpoints for managing rental properties and tenants.

## Installation

To get started with the Leanspot NestJS API, follow these steps:

1. Clone the repository to your local machine using `git clone`.
2. Install dependencies by running `npm install`.
3. Copy the `.env.example` file to a new file called `.env`.
4. Update the environment variables in the `.env` file to match your environment.
5. Start the development server by running `npm run start:dev`.

## Usage

Once you have the development server up and running, you can access the Leanspot API at `http://localhost:3000`. From there, you can send requests to the various API endpoints to manage your rental properties and tenants.

## Migration/Changing Fields

When making changes to the entity files in the NestJS API, you will need to generate a new migration file and apply the changes to the database. Here are the steps to follow:

1. Change the necessary entity files.
2. Generate a migration file by running `npm run migration:generate <migration-name>`.
3. Run the migration by running `npm run migration:run`.
4. Push the migration file to the repository.
5. Merge the merge request. This will automatically apply the migration file and update the database.

It is important to follow these steps carefully to ensure that your changes are properly reflected in the Leanspot application.

## Testing

To run the unit tests for the Leanspot NestJS API, run `npm run test`.

## Documentation

To view the API documentation, start the development server and navigate to `http://localhost:3000/api`. This will display the Swagger UI, which provides a user-friendly interface for exploring the API endpoints and their documentation.
