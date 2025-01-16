import * as admin from 'firebase-admin'

var serviceAccount = require("./hack4good-f1ff4-firebase-adminsdk-pvntr-4a365a070b.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export async function createNewUser(user_email : string, password : string) {
    await admin.auth().createUser({
        email: user_email,
        password: password
    })
}

export async function updateUserPassword(user_email : string, password : string) {
    const user = await admin.auth().getUserByEmail(user_email)
    if (user) {
        await admin.auth().updateUser(user.uid, {
            password: password
        })
    }
}

export async function suspendUser(user_email : string) {
    const user = await admin.auth().getUserByEmail(user_email)
    if (user) {
        await admin.auth().updateUser(user.uid, {
            disabled: true
        })
    }
}

export async function reenableUser(user_email : string) {
    const user = await admin.auth().getUserByEmail(user_email)
    if (user) {
        await admin.auth().updateUser(user.uid, {
            disabled: false
        })
    }
}