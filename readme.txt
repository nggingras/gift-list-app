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

### Installation

- Download node js from the official web site https://nodejs.org.
- Install dependancies by running : npm install express sqlite3 body-parser
- Start the server with the following command : node app.js
- Open Web browser and navigate to http://localhost:3000

## Project structure

gift-list-app/
├── public/
│   ├── index.html
│   ├── styles.css
├── [app.js](http://_vscodecontentref_/#%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5CNicolas%5C%5CDocuments%5C%5CGitHub%5C%5Cgift-list-app%5C%5Capp.js%22%2C%22_sep%22%3A1%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FNicolas%2FDocuments%2FGitHub%2Fgift-list-app%2Fapp.js%22%2C%22scheme%22%3A%22file%22%7D%7D)
├── [package.json](http://_vscodecontentref_/#%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5CNicolas%5C%5CDocuments%5C%5CGitHub%5C%5Cgift-list-app%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FNicolas%2FDocuments%2FGitHub%2Fgift-list-app%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%7D)
├── .env
└── README.md
