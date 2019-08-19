// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let googleUser;
const db = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
    prompt: "select_account"
});
provider.addScope("https://www.googleapis.com/auth/userinfo.email");

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        $("#btnGoogleLogin").text("Logout");
        googleUser = user;
        checkUser();
        checkwrite();

    } else {
        $("#btnGoogleLogin").text("Login with Google");
    }
});

startLogin = () => {
    firebase.auth().signInWithPopup(provider).then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const token = result.credential.accessToken;
        // The signed-in user info.
        googleUser = result.user;
        //check if user is in db or add if not
        checkUser();
    }).catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user"s account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
    });
};

checkUser = () => {
    const docRef = db.collection("users/").doc(googleUser.uid);
    docRef.get().then(querySnapshot => {
        if (querySnapshot.exists) {
            console.log("I exist");
        } else {
            var user = {
                name: googleUser.displayName,
                email: googleUser.email,
                roles: ["user"]
            };
            db.collection("users").doc(googleUser.uid).set(user).then(() => {
                console.log("I now exist");
            });
        }
    }).catch(err => {
        console.log("login needed");
    });
};

logout = () => {
    firebase.auth().signOut().then(() => {
        $("#adminForm").hide();
        $("#userForm").show();
        $("#btnAdd").hide();
        $("#uRoles").hide();
    }, error => {
        // An error happened.
        console.log("Logout error.");
    });
};

toggleAuthentication = () => {
    if (firebase.auth().currentUser !== null) {
        logout();
    } else {
        startLogin();
    }
};

checkwrite = () => {
    try {
        const docRef = db.collection("users/").doc(googleUser.uid);
        docRef.get().then(querySnapshot => {
            if (querySnapshot.data().roles.includes('admin')) {
                setDtClick();
                $("#btnAdd").show();
                $("#uRoles").show();
            } else {
                removeAdminFunctions();
            }
            $("#adminForm").show();
            $("#userForm").hide();
            getData();
        }).catch(err => {
            console.log("login needed");
        });
    }
    catch (e) {
        console.log(e);
        console.log(e.message);
        console.log("no permissions");
    }
};

removeAdminFunctions = () => {
    dtTable.off('click');
    $("#btnAdd").hide();
};

setDtClick = () => {
    dtTable.on("click", "tr", function () {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
        } else {
            dtTable.$("tr.selected").removeClass("selected");
            $(this).addClass("selected");
        }
        if (dtTable.row(this).data()) {
            const selectedData = dtTable.row(this).data();
            clearInput();
            $("#hd-id").val(selectedData.id);
            $("#name").val(selectedData.name);
            $("#email").val(selectedData.email);
            $("#roles").val(selectedData.roles.split(","));
            $("#myModal").modal("show");
            $("#btnDelete").show();
        }
    });
};

$(() => {
    dtTable = $("#dataLayersTable").DataTable({
        columns: [
            { data: "name" },
            { data: "email" },
            { data: "roles" }
        ]
    });
    
    $("#btnAdd").on("click", () => {
        clearInput();
        $("#myModal").modal("show");
        $("#btnDelete").hide();
    });

    $("#btnSave").on("click", () => {
        saveData();
    });
    $("#btnDelete").on("click", () => {
        deleteData();
    });
});

clearInput = () => {
    $("#hd-id").val("");
    $("#name").val("");
    $("#email").val("");
    $("#roles").val("");
};

saveData = () => {
    const user = {
        id: "",
        name: $("#name").val(),
        email: $("#email").val(),
        roles: $("#roles").val().split(",")
    };

    if ($("#hd-id").val().length > 0) {
        console.log("update");
        user.id = $("#hd-id").val();
        updateUser(user);
    } else {
        console.log("new");
        Key = db.collection("users/").doc();
        user.id = Key.id;
        addUser(user);
    }
};

addUser = user => {
    console.log("adding user");
    db.collection("users").doc(Key.id).set(user).then(() => {
        displayToastMessage("user successfully added!");
        getData();
        $("#myModal").modal("toggle");
    }, error => {
        displayToastMessage(error, true);
    });
    clearInput();
};

updateUser = user => {
    db.collection("users").doc(user.id).update(user)
        .then(() => {
            getData();
            $("#myModal").modal("toggle");
        }, error => {
            displayToastMessage(error, true);
        });
};

getData = () => {
    const docRef = db.collection("users").orderBy("name");
    docRef.get().then(docData => {
        if (docData.size) {
            const arrObj = [];
            docData.forEach(data => {
                const obj = data.data();
                obj.id = data.id;
                obj.roles = obj.roles.toString();
                arrObj.push(obj);
            });
            dtTable.clear();
            dtTable.rows.add(arrObj);
            dtTable.draw();
        } else {
            console.log(docData);
            dtTable.clear();
            dtTable.draw();
        }

    }, error => {
        console.log("error=", error);
    });
};

deleteData = () => {
    const id = $("#hd-id").val();
    deleteDB(id);
};

deleteDB = id => {
    db.collection("users").doc(id).delete()
        .then(() => {
            getData();
            $("#myModal").modal("toggle");
            displayToastMessage("User deleted");
        }, error => {
            displayToastMessage(error, true);
        });
};

displayToastMessage = (message, error) => {
    var x = document.getElementById("snackbar");
    x.innerHTML = message;
    // Add the "show" class to DIV
    if (error) {
        x.className = "show error";
    } else {
        x.className.replace("error", "");
        x.className = "show";
    }
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
};

