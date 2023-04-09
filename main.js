const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { DateTime } = require('luxon');
const https = require('https');

const fs = require('fs');

const config = fs.readFileSync('config.txt', 'utf-8');
const TRELLO_BOARD_ID = config.match(/TRELLO_BOARD_ID=(.*)/)[1];
const TRELLO_LIST_NAME = config.match(/TRELLO_TARGET_LISTNAME=(.*)/)[1];
const EMAILS_FROM_X_LAST_HOURS = config.match(/EMAILS_FROM_X_LAST_HOURS=(.*)/)[1];

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const TRELLO_API_KEY = config.match(/TRELLO_API_KEY=(.*)/)[1];;
const TRELLO_TOKEN = config.match(/TRELLO_TOKEN=(.*)/)[1];
const EMAILS_TO_TRELLO_CADENCE = config.match(/EMAILS_TO_TRELLO_CADENCE=(.*)/)[1];
var TRELLO_LIST_ID = "";

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = fs.readFileSync(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log("no loaded credentials");
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    console.log("client loaded", client);
    if (client) {
        return client;
    }
    console.log("about to authenticat with credentials path", CREDENTIALS_PATH);
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        console.log("authenticated w creds", client.credentials);
        await saveCredentials(client);
    }
    return client;
}

// authorize().then(listFiles).catch(console.error);

async function listMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    let emailsFromLastHours = `newer_than:${EMAILS_FROM_X_LAST_HOURS}h`;
    // const messages = await gmail.users.messages.list({ userId: 'me', maxResults: 20, q: emailsFromLastHours });
    const messages = await gmail.users.messages.list({ userId: 'me', q: emailsFromLastHours });
    if (messages.data && messages.data.messages) {
        return messages.data.messages;
    } else {
        console.log('No messages found.');
        return [];
    }
}

async function getMessage(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });
    const message = await gmail.users.messages.get({ userId: 'me', id: messageId });
    return message.data;
}

async function main() {
    console.log("about to authenticate");
    const auth = await authorize();
    console.log("about to get messages");
    const messages = await listMessages(auth);
    console.log(messages)
    for (const message of messages) {
        const email = await getMessage(auth, message.id);
        const headers = email.payload.headers;
        const subject = headers.find(header => header.name === 'Subject').value;
        const snippet = email.snippet;
        console.log(subject, snippet.substring(0, 20));
        await createNewCard(subject, snippet);
    }
    console.log(`Dumped ${messages.length} emails to emails.csv at ${DateTime.now().toLocaleString(DateTime.DATETIME_FULL)}.`);
}

async function createNewCard(subject, snippet) {

    const options = {
        hostname: 'api.trello.com',
        path: `/1/cards?idList=${TRELLO_LIST_ID}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&name=${encodeURIComponent(subject)}&desc=${encodeURIComponent(snippet)}`,
        method: 'POST'
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);
            let data = '';

            res.on('data', d => {
                data += d;
            });

            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

        req.on('error', error => {
            reject(error);
        });

        req.end();
    });
}


function getListIdByName() {
    const options = {
        hostname: 'api.trello.com',
        path: `/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
        method: 'GET',
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Unexpected status code: ${res.statusCode}`));
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const lists = JSON.parse(data);
                    const list = lists.find((list) => list.name === TRELLO_LIST_NAME);
                    resolve(list ? list.id : null);
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

function envPrint() {
    console.log("TRELLO BOARD ", TRELLO_BOARD_ID);
    console.log("TRELLO_API_KEY ", TRELLO_API_KEY);
    console.log("TRELLO TRELLO_LIST_ID ", TRELLO_LIST_ID);
    console.log("TRELLO_LIST_NAME ", TRELLO_LIST_NAME);
    console.log("TRELLO_TOKEN ", TRELLO_TOKEN);


}

// setInterval(createNewCard, 60 * 60 * 1000); // Run every hour

getListIdByName()
    .then((listId) => {
        TRELLO_LIST_ID = listId;
        console.log(`List ID: ${listId}`);
    })
    .catch((err) => {
        console.error(err);
    });

envPrint();
// setInterval(main, EMAILS_FROM_X_LAST_HOURS * 60 * 60 * 1000);

await main()
setInterval(await main, EMAILS_TO_TRELLO_CADENCE * 60 * 60 * 1000);

//check why async is not working https://stackoverflow.com/questions/70383779/read-and-write-files-from-fs-not-working-asynchronously
//Write logs to console https://stackoverflow.com/questions/8393636/configure-node-js-to-log-to-a-file-instead-of-the-console
//pkg main.js --targets node16-win-x64

process.on('uncaughtException', UncaughtExceptionHandler);

function UncaughtExceptionHandler(err) {
    console.log("Uncaught Exception Encountered!!");
    console.log("err: ", err);
    console.log("Stack trace: ", err.stack);
    setInterval(function () { }, 1000);
}