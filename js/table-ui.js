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
        removeAdminFunctions();
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
            $("#booktitle").val(selectedData.title);
            $("#author").val(selectedData.author);
            $("#category").val(selectedData.category);
            $("#isbn").val(selectedData.isbn);
            $("#price").val(selectedData.price);
            $("#condition").val(selectedData.condition);
            $("#myModal").modal("show");
            $("#btnDelete").show();
        }
    });
};

$(() => {
    dtTable = $("#dataLayersTable").DataTable({
        columns: [
            { data: "title" },
            { data: "author" },
            { data: "category" },
            { data: "isbn" },
            { data: "price" },
            { data: "condition" }
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
    $("#booktitle").val("");
    $("#author").val("");
    $("#category").val("");
    $("#isbn").val("");
    $("#price").val("");
    $("#condition").val("");
    $("#myModal").val("");
};

saveData = () => {
    const book = {
        id: "",
        title: $("#booktitle").val(),
        author: $("#author").val(),
        category: $("#category option:selected").text(),
        isbn: $("#isbn").val(),
        price: $("#price").val(),
        condition: $("#condition option:selected").text()
    };

    if ($("#hd-id").val().length > 0) {
        console.log("update");
        book.id = $("#hd-id").val();
        updateBook(book);
    } else {
        console.log("new");
        Key = db.collection("service/").doc();
        book.id = Key.id;
        addBook(book);
    }
};

addBook = book => {
    console.log("adding book");
    db.collection("book").doc(Key.id).set(book).then(() => {
        displayToastMessage("book successfully added!");
        getData();
        $("#myModal").modal("toggle");
    }, error => {
        displayToastMessage(error, true);
    });
    clearInput();
};

updateBook = book => {
    db.collection("book").doc(book.id).update(book)
        .then(() => {
            getData();
            $("#myModal").modal("toggle");
        }, error => {
            displayToastMessage(error, true);
        });
};

getData = () => {
    const docRef = db.collection("book").orderBy("title");
    docRef.get().then(docData => {
        if (docData.size) {
            const arrObj = [];
            docData.forEach(data => {
                const obj = data.data();
                obj.id = data.id;
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
    db.collection("book").doc(id).delete()
        .then(() => {
            getData();
            $("#myModal").modal("toggle");
            displayToastMessage("Book deleted");
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

