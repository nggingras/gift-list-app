# Gift List App

## What is this?

The Gift List App is a simple web application that allows users to manage a list of gifts. Users can add new gifts, reserve gifts, unreserve gifts, and remove gifts. The application is built using Node.js, Express, and SQLite for the backend, and vanilla JavaScript, HTML, and CSS for the frontend.

## What it does

It allows a host to create a gift list. The URL is then shared with users so they can reserve gifts. The list is stored in a SQL DB locally on the host repository.

- **Add Gifts:** Users can add new gifts to the list.
- **Reserve Gifts:** Users can reserve gifts, preventing others from reserving the same gift.
- **Unreserve Gifts:** Users can unreserve gifts they have reserved.
- **Remove Gifts:** Users with the appropriate permissions can remove gifts from the list.
- **View Lists:** Users can view available gift lists, except those they have created.

It uses the following technologies:

**Backend:**
- Node.js
- Express
- SQLite

**Frontend:**
- HTML
- CSS
- JavaScript

## How to Install and Configure

### Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)

### Installation and execution

- Download Node.js from the official website: https://nodejs.org.
- Install dependencies by running:

  ```
  npm install express sqlite3 body-parser express-session bcrypt
  npm install --save-dev cypress
  ```

- Start the server with the following command:

  ```
  node app.js
  ```

- Open your web browser and navigate to:

  ```
  http://localhost:3000
  ```

to run test:
  ```
  npx cypress open
  ```

To open the port to outsiders, you can use a third-party tool like `ngrok.exe`:

- Download `ngrok.exe`.
- Place `ngrok.exe` in the repository directory.
- Run the following command:

  ```
  ngrok http 3000
  ```

## Project structure

```markdown
gift-list-app/
├── public/
│   ├── index.html
│   ├── styles.css
├── [app.js]
├── [package.json]
├── gift-list.db
└── README.md
```

## To add
- Add copilot test
- Add copilot documentation
- Add copilot security autofix
- Create Doc
- Create unit test