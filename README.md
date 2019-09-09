# Usage

Clone project to desired directory and cd to root of basebot project. Once there, run `npm install` to install any dependencies. After perform the following command to create a slack bot token javascript file:

`cp slackBotToken.js.example slackBotToken.js`

Then, in the api.slack.com/apps site, navigate to the basebot app and go to the `OAuth & Permissions` tab. Copy the `Bot User OAuth Access Token` to the botToken constant.

Lastly, run `npm start` to begin the bot in production mode! To run testing mode in test channel, user `npm start:test`.
