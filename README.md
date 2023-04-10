README.md

Requirements:
- Users gmails invited to integrate with the Google Cloud Console App
- A Trello account, a Trello board, a Trello API key, a Trello token

GMAIL SETUP
Ensure to add users under your application OAuth Consent Screen as Test user
[ATTACH SOME IMAGES WHERE TO]


TRELLO SETUP
1 create a trello board, retrieve link to board, inside is TRELLO_BOARD_ID
2 create a list, it would be TRELLO_TARGET_LISTNAME
3 navigate to https://trello.com/power-ups/admin
	3.1 there, click on New, next to Power-ups and integrations
	3.2 fill form the following
		3.2.1 Name=GMAILTOTRELLO
		3.2.2 Workspace=choose default one or first option
		3.2.3 iframe URL=https://localhost
		3.2.4 use your own account for fields email, support email, and author
4 once you create this, go to <API Key> on the left list menu
5 there, click on <Generate new API Key>
6 once the API Key is created, retrieved the value in API Key, this will become TRELLO_API_KEY
7 on the right where you got the API Key, look for the word <token> it would redirect you to a page where you can get the token, this becomes TRELLO_TOKEN

CONFIG.TXT
TRELLO_BOARD_ID= found in the link to your trello board https://trello.com/b/(THIS_IS_UR_TRELLO_BOARD_ID)/test
TRELLO_TARGET_LISTNAME= name of the Trello list/column where emails/cards will create to
TRELLO_TOKEN= obtain after allowing custom powerup permission to your Trello account
TRELLO_API_KEY= obtain after allowing custom powerups to integrate with
EMAILS_FROM_X_LAST_HOURS= number of hours back in time from which retrieve emails
EMAILS_TO_TRELLO_CADENCE= how frequent in X hours this script will run (you'd want this to be same as EMAILS_FROM_X_LAST_HOURS)


HOW TO USE

Once your config.txt is created and well configured, proceed to run main.exe by double clicking (THIS DOES NOT REQUIRE ADMIN PRIVILEGES)


FAQ:
Q: I closed the app just after it created the first cards, then reopen it and now I have duplicates, is this expected?
A: yes, as of now, script does not do a duplicate check on the target list's cards
Q: when granting access to the gmail account, I'm shown a message Access denied: GMAILTOTRELLO has no completed verification process by Google
A: this means logging user has not been added to the cloud console app's consent auth screen, refer to the GMAIL SETUP section