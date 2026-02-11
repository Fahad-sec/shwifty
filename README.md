# Shwifty(shwifty.vercel.app)
- A Messaging chat Web-Application featuring a public chat using WebSockets to enable real-time messaging.
![Shwifty Demo](./poc/Shwifty-POC-GIF.gif)

## Key Techincal Achievements
### Real-Time Event Architecture
- **WebSockets**: Used socket.io to power Shwifty making it possible to have a fast and reliable Bidirectional stream of data.
### Unqiue User Tracking
- **Online-Users**: Created unique user tracking logic using Map and Set logic to distinguish users based on their Unqiue-Id and displaying online user count on the Chat-Page.
### Full-stack Architecture
- **Online Presence**: Used git to track all changes in the codeBase While vercel provided a complete pipeline. which allowed a local push command to update the live web-application hosted on vercel. And the server hosted on huggingface also connected to the vercel-page, allowing the app to be running 24/7 on the Internet.

## Features
### Secure Authentication
- Supabase authentication integrated in the codeBase allowed Shwifty to possess secure and reliable authentication.
### Persistent Global History
- Saving every message with the user's name, userId, time and content to a Database on the cloud and in this case Supabase's PostgreSQL made it possible to Fetch old messages from the dataBase upon login, so user's can have long conversations without worrying about loosing conversation upon logging out or closing the browser.
### Live Feedback Loop
- Added a typing indicator using webSockets allowing user's to see if another user is currenty typing and their name while the online count on top of the screen allows user's to see if any other person beside them is online in the Application.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend**: Node.js, Express, Socket.io.
- **DataBase & Auth**: Supabase's PostgreSQL & Authentication.
- **Deployment**: Git, Github, Vercel for the Client and Hugging Face for server.

## Project Evolution
- **V1** Started with the UI and Supabase fetching messages everytime a user sends a message and saving it to storage.
- **V2** Created a backend using node.js and socket.io to enable realtime conversation rather then sending a http request everytime a user sent message the web-sockets holds a persistent connection for fast Bidirectional stream of data while still saving the data to Database.

## Challenges 
- **feat: Online Count**, Initially I tried to implement a online count based on the number of users connected to webSocket but because of my limited experience with webSockets I didn't realise that because of the transport upgrade from http would cause double connection which would consequently show double the amount of users in the online count so upon research I found that rather then basing the online count on number of connections I should base it on number of unique Id's which solved the problem of doubling count.
