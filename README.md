
## Gmail to Trello script: convert your emails to cards in Trello

--------

### Requirements:

- Users gmails invited to integrate with the Google Cloud Console App

- A Trello account, a Trello board, a Trello API key, a Trello token

  

### GMail Setup

- Enable GMail API in Google Cloud Console: https://support.google.com/googleapi/answer/6158841?hl=en
- Create an OAuth Client IDs in the Credentials section https://developers.google.com/identity/protocols/oauth2?hl=en
- Configure the OAuth Consent screen: https://developers.google.com/workspace/guides/configure-oauth-consent?hl=en
- Add users in the Test Users section in the OAuth Consent screen configuration
- ***Important: download the credentials.json from the OAuth Client IDs and put it in the same folder as the executable*** 


### Trello Setup

  

1. Create a trello board, retrieve link to board, inside is

TRELLO_BOARD_ID Create a list, it would be TRELLO_TARGET_LISTNAME

2. Navigate to https://trello.com/power-ups/admin

3. There, click on New, next to Power-ups and integrations

4. Fill form the following

4.1. Name=GMAILTOTRELLO

4.2. Workspace=choose default one or first option

4.3. iframe URL=https://localhost

4.4. Use your own account for fields email, support email, and author

5. Once you create this, go to API key section on the left list menu

6. There, click on Generate new API Key

7. Once the API Key is created, save the value in API Key, this will become TRELLO_API_KEY

8. On the right where you got the API Key, save the token this will become TRELLO_TOKEN

  

  

#### config.txt

  

TRELLO_BOARD_ID= found in the link to your trello board https://trello.com/b/(THIS_IS_UR_TRELLO_BOARD_ID)/test

TRELLO_TARGET_LISTNAME= name of the Trello list/column where emails/cards will create to

TRELLO_TOKEN= obtain after allowing custom powerup permission to your Trello account

TRELLO_API_KEY= obtain after allowing custom powerups to integrate with

EMAILS_FROM_X_LAST_HOURS= number of hours back in time from which retrieve emails

EMAILS_TO_TRELLO_CADENCE= how frequent in X hours this script will run (you'd want this to be same as EMAILS_FROM_X_LAST_HOURS)

  

#### How to use

  

Once your config.txt is created and well configured, proceed to run main.exe by double clicking

  

#### FAQ

  

Q: I closed the app just after it created the first cards, then reopen it and now I have duplicates, is this expected?

A: yes, as of now, script does not do a duplicate check on the target list's cards

Q: when granting access to the gmail account, I'm shown a message Access denied: GMAILTOTRELLO has no completed verification process by Google

A: this means logging user has not been added to the cloud console app's consent auth screen, refer to the GMAIL SETUP section

  

--------

*This repo was written with the help of ChatGPT, prompts in prompts.txt; wrote as well an article about how I came to do this here: https://medium.com/p/838529d9990b/edit*