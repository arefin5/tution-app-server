var admin = require("firebase-admin");
var serviceAccount = require("../constants/serviceAccountKey.json");

const firebaseAdmin = admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tuition-app-bd.firebaseio.com"
});
module.exports = {
    firebaseAdmin
}