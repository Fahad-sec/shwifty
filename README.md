# Shwifty
[![Vercel](https://img.shields.io/badge/Live_Demo-Shwifty-brightgreen?style=for-the-badge&logo=vercel)](https://shwifty.vercel.app)
Base![Shwifty Demo](./poc/Shwifty-POC-GIF.gif)

## Key Technical Achievements
### Real-Time Event Architecture
- **WebSockets**: Used socket.io to power Shwifty making it possible to have a fast and reliable Bidirectional stream of data.
### Unique User Tracking
- **Online-Users**: Created unique user tracking logic using Map and Set logic to distinguish users based on their Unqiue-id and displaying online user count on the Chat-Page.
### Full-stack Architecture
- **Online Presence**: Used git to track all changes in the Codebase While vercel provided a complete pipeline. which allowed a local push command to update the live web-application hosted on vercel. And the server hosted on huggingface also connected to the vercel-page, allowing the app to be running 24/7 on the Internet.

## Features
### Direct Messages
- Added direct messages using dynamic private rooms. By generating a unique id to ensure distinct conversation channels.
### Notifications
- Added smart notifications using browser's api. Ensuring that they are private and only trigger when the user is Inactive in the chat.
### Secure Authentication
- Supabase authentication integrated in the Codebase allowed Shwifty to possess secure and reliable authentication.
### Persistent Global History
- Saving every message with the user's name, userId, time and content to a Database on the cloud and in this case Supabase's PostgreSQL made it possible to Fetch old messages from the dataBase upon login, so user's can have long conversations without worrying about losing conversation upon logging out or closing the browser.
### Live Feedback Loop
- Added a typing indicator using webSockets allowing user's to see if another user is currently typing and their name while the online count on top of the screen allows user's to see if any other person beside them is online in the Application.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend**: Node.js, Express, Socket.io.
- **DataBase & Auth**: Supabase's PostgreSQL & Authentication.
- **Deployment**: Git, Github, Vercel for the Client and Hugging Face for server.

## Project Evolution
- **V1** Started with the UI and Supabase fetching messages everytime a user sends a message and saving it to storage.
- **V2** Created a backend using node.js and socket.io to enable realtime conversation rather then sending a http request everytime a user sent message the web-sockets holds a persistent connection for fast Bidirectional stream of data while still saving the data to Database.
- **v3** Added Direct messages to shwifty.Using dynamic rooms based on users UUIDS to create private chats.
- Added smart notifications for global lobby and private chats using browser's Api.
- Much more refined UI inlcuding animation for a better Ux.
- Dynamic loading screens based on user's action.
- Async race patterns hadles data fetching by utilizing Promise.race to handle server timeout.

## Challenges 
- **feat: Online Count**, Initially I tried to implement a online count based on the number of users connected to webSocket but because of my limited experience with webSockets I didn't realise that because of the transport upgrade from http would cause double connection which would consequently show double the amount of users in the online count so upon research I found that rather then basing the online count on number of connections I should base it on number of Unique-id's which solved the problem of doubling count.
