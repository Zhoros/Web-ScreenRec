# Web ScreenRec
Lightweight screen recorder running on the web that doesn't require any native installation  
<ins>**Please star if you like it, thank you!**</ins>

<img width="1763" height="851" alt="image" src="https://github.com/user-attachments/assets/0e557603-45ae-4d3d-9645-46e6892c1195" />

## Features 🌟
- This app allows cross-platform screen recording without any installation
- Can Record screen, microphone and desktop audio simultaneously
- Can convert output to mp4 via ffmpeg with a single button press

## Run Without Docker 💻
Clone this repo, open `public/index.html` in your browser then record your screen. That's it!

## Run With Docker 🐋
Simply run `docker compose up -d`

## Additional Information
- For accessing the site through the internet, HTTPS/TLS is required  
- The webserver implements some cors headers that are required for recording permission. Trying to acess the website using simple http server won't work
