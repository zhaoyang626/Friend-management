
# friend-management-api

### Tech
Express.js + mongoose+docker-compose

### Sample APIs
#### /friend
Create friend connection when target friend isn't in the block list. After establishing connections, friends will subscribe and follow each other as well.
#### /friend/list
Retrieve the friends list for an email address.
#### /friend/common
Retrieve common friends list between two email address.
#### /subscribe
Subscribe to updates from an email address. Requestor will show in target's follower list. Target will show in requestor's subscribe list.
#### /block
Block updates from an email address. Target will show in requestor's block list.
If requestor subscribed target, target will be removed from subscribe list.
#### /recipient
Retrieve all email addresses that can receive updates from an email address. If send mention target's email in the text, then target's email will show in the requestor's follower list. 

### How to run
 - sudo docker-compose build
 - sudo docker-compose up
 
### Test API
- Data is in user.json
- Support all samples api tests appearing in requirement

### Release limitation
 - Didn't write unit tests.