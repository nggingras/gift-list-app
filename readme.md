# Gift List App

## What is this?

The Gift List App is a simple web application that allows users to manage a list of gifts. Users can add new gifts, reserve gifts, unreserve gifts, and remove gifts. The application is built using Node.js, Express, and SQLite for the backend, and vanilla JavaScript, HTML, and CSS for the frontend.

## What it does

It allows an host to create a gift. URL is then shared to users so they can reserve gifts.

- **Add Gifts:** Users can add new gifts to the list.
- **Reserve Gifts:** Users can reserve gifts, preventing others from reserving the same gift.
- **Unreserve Gifts:** Users can unreserve gifts they have reserved.
- **Remove Gifts:** Users with the appropriate permissions can remove gifts from the list.

It uses the following technologies :

Backend:
Node.js
Express
SQLite

Frontend:
HTML
CSS
JavaScript

## How to Install and Configure

### Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)

### Installation and execution

- Download node js from the official web site https://nodejs.org.
- Install dependancies by running : npm install express sqlite3 body-parser
- Start the server with the following command : node app.js
- Open Web browser and navigate to http://localhost:3000

## Project structure

```markdown
gift-list-app/
├── public/
│   ├── index.html
│   ├── styles.css
├── [app.js]
├── [package.json]
├── .env
└── README.md
```