# Firebase table UI with CRUD

This application is created to show how to create an editable table display of data being stored in the firebase Cloud Firestore database.

Because we wanted this application to be server agnostic we decided to use firebase to store our data. This eliminates the need to have different setup requirements for different operating systems and also eliminates the need to setup a database. You will have to create a firebase project and then enter the details in the application, but that is all that is needed.

## The setup steps

- Setting up firebase
- Deploying to your server
- Adding layers

## Setting up firebase

Start by navigating to https://console.firebase.google.com. If you are not signed in to your google account it will ask you to do so before it takes you to the console.

Once at the console you will: 

- Click the Add project square.
- Enter mapviewer in the project name box
- Check both of the checkboxes to accept the terms.
- Click Create project
- Click Continue
- Click the button that looks like </> Add Firebase to your web app
- Copy the code snippet that is provided, set aside in a text editor and close the dialog box
- Expand Develop in the left menu panel
- Click Database
- Find the Cloud Firestore section (they move it frequently, currently it is at the top)
- Click Create database
- Click Enable (leave the default ‘Start in locked mode’)
- Click rules and remove the code that is there, replace it with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
   function getRole(role) {
    return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny([role]);
  }
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId && request.resource.data.roles.hasAny(["admin"]) == false;
    }
    match /book/{bookId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null && getRole('admin') == true;
    }
  }
}
```

## Deploying to your server

On any web server copy the files from https://github.com/billyz313/Firebase-table-UI-with-CRUD into the folder you would like to publish. Rename js/firebase.js.example to js/firebase.js then go to the code snippet that we set aside earlier. Copy everything inside the { } and replace the same in firebase.js (see example below.) Save the file.
```
apiKey: "5wUlAI22222Li5gMNesIk9jsnEdTGwfKExymsDQ",
authDomain: "firebasetableui.firebaseapp.com",
databaseURL: "https://firebasetableui.firebaseio.com",
projectId: "firebasetableui",
storageBucket: "firebasetableui.appspot.com",
messagingSenderId: "149999999352",
appId: "1:149999999352:web:12345f11febadf09"
```

Setup the routing to the application as you would with any application on your server.  (This step is specific to whatever flavor of server you choose.)

## Adding data

Your first step is to run your app and login with your google account.  The login link is at the top right, if it says "Logout" then you have been automatically logged in with your active google account.
Once you are logged in you will need to visit the firebase console one final time to grant yourself admin rights.  

In the firebase console:
- Click Data (if you were already there you may have to click Rules, then back to Data)
- Select users in the collections, there will be one document which was created when you logged in, select that
- select roles and hover to the right where it shows "Array +" 
- Click the "+"
- Type admin in the value box and hit Add

You are now an admin in the app and can add, edit, or remove books.  You will have to logout of the application and log back in to refresh the roles.  
Once you have logged back in you will notice the Add button which you can click to start adding.  To edit or remove an entry that has been added you simply click the entry in the table and edit or delete it in the dialog box.

All logged in users will be able to view the books, however only users with the admin role will be able to add, edit, or delete.  This application does not go into user management at this point so if you want to add an admin you will have to manually add the admin field to their user roles array.  

You can add the user management to your applications by adding the following security rule to the users path in the firebase security rules 
```
allow edit: if request.auth.uid != null && getRole('admin') == true;
```
Of course you will have to create a UI to manage them but you could follow this table example to do so!
Happy coding!
