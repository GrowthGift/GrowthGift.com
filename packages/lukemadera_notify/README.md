# lukemadera:notify

Sends notifications (push, email, sms, in app) to one or more users.


## Usage / Flow
- call the `lmNotify.send` function with the notification `type` and `data`
- the `lmNotify.send` function then calls the corresponding `type` function and uses the `data` to select the appropriate user ids to notify and fills the notification content.
- the `type` function calls the `lmNotifyHelpers.separateUsers` and `lmNotify.sendAll` functions to get the appropriate users (taking into account their notifications settings) and actually send out the notifications.


## To add a new notification (type)

- create a new function in the `lukemadera_notify-types.js` file; mimicking an existing one. Basically this function does 4 things:
  - creates an array of the appropriate user ids we want to notify
  - calls the `lmNotifyHelpers.separateUsers` function to take those user ids and the notification type to return users separated by protocol (in app, email, push, sms). This function will check the user's notification settings and only put that user in the corresponding protocol object if the user wants this type of notification.
  - fills the actual content that will go in the in app, email, push, sms notifications that will go out
    - if the content is the SAME (or there is template data / variables passed through that are the same) for all users, the `lmNotify.sendAll` only needs to be called once. Otherwise the `lmNotify.sendAll` function will need to be called once per each different set of content (possibly once per user per protocol in the worst case).
  - calls `lmNotify.sendAll` to actually send out the notifications to all the protocols


## App Wide Overrides

Which protocols / notifications go out depends on the user settings as well as app wide settings, which is handled in the `lukemadera_notify-separate-users.js` file.
If no user settings are set yet, defaults will be used. The `lmNotifyHelpers.checkNotificationSettings` function (at the bottom) also can app wide override ALL settings so make sure to check there if you think you should be getting notifications are you are not. For example, email may be turned off currently, meaning NO ONE will get email notifications, no matter what! If you want to test email for debugging, just turn it back on and make sure to reset it when you're done testing!