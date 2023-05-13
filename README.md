# ai-chef
A job for emailing ChatGPT generated recipes to my wife and I 

## Google Cloud Function
Calls the script in index.js which prompts chatGPT for a JSON formatted list of recipies which we parse and send as an email. 
[AI Chef](https://console.cloud.google.com/functions/details/us-central1/function-1?env=gen1&project=ai-chef-385301)


## Google Cloud Scheduler Jon
Triggers the above cloud function every Friday at 5pm so we can get the shopping list read for Saturday morning.
[Friday Shopping List](https://console.cloud.google.com/cloudscheduler/jobs/edit/us-central1/friday-shopping-list?project=ai-chef-385301)
