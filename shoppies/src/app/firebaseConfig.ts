import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, getDocs, query, where, Timestamp, updateDoc, getDoc, DocumentReference } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, signOut, onAuthStateChanged, User, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAqVtdqwIYvlNdz4jIDDJ6IAIYZVpOTj_Y",
    authDomain: "hack4good-f1ff4.firebaseapp.com",
    projectId: "hack4good-f1ff4",
    storageBucket: "hack4good-f1ff4.firebasestorage.app",
    messagingSenderId: "228793364194",
    appId: "1:228793364194:web:c81852d72d98c73aea38bb"
  };

export const app = initializeApp(firebaseConfig)
export const database = getFirestore(app)
export const auth = getAuth(app);

let currentUser: User | null = null;

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     currentUser = user;
//   } else {
//     currentUser = null;
//   }
// });

export async function newUserSignUp(email : string, password : string) {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password)
        return response
    } catch (error) {
        console.error("Error: ", error)
    }
}

export async function SignOut() {
    try {
        const response = await signOut(auth)
    } catch (error) {
        console.error("Error: ", error)
    }
}

// export async function createUserData(
//     successful_login : number, quest_login : number, successful_purchase : number,
//     quest_purchase : number, visited_rewards : boolean, quest_expiry : Timestamp, points : number,
//     streak : number[], travel : number, fashion : number, electronics : number, health : number,
//     beauty : number
// ) {
//     try {
//         if (!currentUser) {
//           throw new Error("No user signed in");
//         }
//         const response = await addDoc(collection(database, "userData"), {
//             "userEmail" : currentUser.email, //ignore error: user must be signed in for this function to be called
//             "streak" : streak,
            
//             // quest related
//             "successful_logins": successful_login, //curr number of successful logins
//             "quest_logins" : quest_login, //number of logins needed to complete current quest
//             "successful_purchases" : successful_purchase, //curr number of successful purchases
//             "quest_purchases" : quest_purchase, //number of purchases needed to complete current quest
//             "quest_has_visited_rewards" : visited_rewards, //has the user visited rewards page
//             "quest_expiry" : quest_expiry, //time that the quest expires

//             "points" : points, //number of points the user has from doing quests/streaks
//             "travel" : travel,
//             "fashion" : fashion,
//             "electronics" : electronics,
//             "health" : health,
//             "beauty" : beauty
//         })
//     } catch (error) {
//         console.log("Error: ", error)
//     }
// }

// export async function updateUserData(
//     successful_login : number, quest_login : number, successful_purchase : number,
//     quest_purchase : number, visited_rewards : boolean, quest_expiry : Timestamp, points : number, 
//     streak : number[], travel : number, fashion : number, electronics : number, health : number,
//     beauty : number
// ) {
//     try {
//         if (!currentUser) {
//           throw new Error("No user signed in");
//         }
//         const doc = await getDocs(query(collection(database, "userData"), where("userEmail", "==", currentUser.email)))
//         if (doc.empty) {
//           throw new Error("No user data found");
//         }
//         const docRef = doc.docs[0].ref
//         const response = await updateDoc(docRef, {
//             "userEmail" : currentUser.email, //ignore error: user must be signed in for this function to be called
//             "streak" : streak,
            
//             // quest related
//             "successful_logins": successful_login, //curr number of successful logins
//             "quest_logins" : quest_login, //number of logins needed to complete current quest
//             "successful_purchases" : successful_purchase, //curr number of successful purchases
//             "quest_purchases" : quest_purchase, //number of purchases needed to complete current quest
//             "quest_has_visited_rewards" : visited_rewards, //has the user visited rewards page
//             "quest_expiry" : quest_expiry, //time that the quest expires

//             "points" : points, //number of points the user has from doing quests/streaks
//             "travel" : travel,
//             "fashion" : fashion,
//             "electronics" : electronics,
//             "health" : health,
//             "beauty" : beauty

//         })
//         console.log("Successfully updated data")
//     } catch (error) {
//         console.log("Error: ", error)
//     }
// }

// export async function getUserData() {
//     try {
//         //ignore error: user must be signed in for this function to be called
//         if (!currentUser) {
//           throw new Error("No user signed in");
//         }
//         const response = await getDocs(query(collection(database, "userData"), where("userEmail", "==", currentUser.email)))
//         return response.docs[0].data()
//     } catch (error) {
//         console.log("Error:", error)
//     }
// }

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

export async function createInventoryData(item_name : string, quantity : number) {
    try {
        const log_entry = String("Added " + quantity + " " + item_name)
        await addDoc(collection(database, "inventory"), {
            "item_name" :  item_name,
            "quantity" : quantity,
            "log" : [log_entry]
        })
        console.log("Successfully created new inventory item.")
    } catch (error) {
        console.error("Error creating new inventory item. ", error)
    }
}

export async function updateInventoryData(item_name : string, quantity : number, type : number) {
    // type argument should be either 0 or 1. 0 represents subtract (purchase), 1 represents add (restock)
    try {
        const original_docs =  await getDocs(
            query(collection(database, "inventory"), where("item_name", "==", item_name))
        )
        if (!original_docs.empty && original_docs.size == 1) {
            const original_data = original_docs.docs[0].data()
            const original_data_ref = original_docs.docs[0].ref

            const new_item_quantity = type == 0 ? original_data["quantity"] - quantity : original_data["quantity"] + quantity
            const new_log_entry = type == 0
                ? quantity + " amount of " + item_name + " purchased on " + Timestamp.now().toString()
                : quantity + " amount of " + item_name + " restocked on " + Timestamp.now().toString()

            const new_log : string[] = original_data["log"].push(new_log_entry)

            await updateDoc(original_data_ref, {
                "quantity": new_item_quantity,
                "log" : new_log_entry
            })
            console.log("Successfully updated inventory item.")
        } else {
            console.error("Error!")
        }
    } catch (error) {
        console.error("Error updating new inventory item. ", error)
    }
}

export async function getInventoryData(item_name : string) {
    try {
        const original_docs =  await getDocs(
            query(collection(database, "inventory"), where("item_name", "==", item_name))
        )
        if (!original_docs.empty && original_docs.size == 1) {
            return original_docs.docs[0].data()
        }
    } catch (error) {
        console.error("Error updating new inventory item. ", error)
    }
}

export async function getLast7DaysInventoryData() {
    // returns an array of all the request documents from the past 7 days
    try {
        const docs = await getDocs(
            query(collection(database, "inventory"))
        )
        if (!docs.empty) {
            return docs.docs
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createRequestData(user_email : string, item_name : string, quantity : number) {
    //status is a string of either of the following values: pending/approved/rejected. always initially "pending"
    try {
        const log_entry = "Request created on " + Timestamp.now().toString()
        await addDoc(collection(database, "requests"), {
            "user_email" : user_email,
            "item_name" : item_name,
            "quantity" : quantity,
            "date" : Timestamp.now(),
            "status" : "pending",
            "log" : [log_entry]
        })
        console.log("Successfully created new request.")
    } catch (error) {
        console.error("Error creating request. ", error)
    }
}

export async function updateRequestData(docRef : DocumentReference, status : string, log : string[]) {
    //status is a string of either of the following values: pending/approved/rejected. always initially "pending"
    try {
        updateDoc(docRef, {
            "status" : status,
            "log" : log.push("Status updated to " + status + " on " + Timestamp.now().toString())
        })
    } catch (error) {
        console.error(error)
    }
}

export async function getRequestData() {
    // returns an array of all the request documents
    try {
        const docs = await getDocs(
            query(collection(database, "requests"))
        )
        if (!docs.empty) {
            return docs.docs
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getPendingRequestData() {
    // returns an array of all the request documents that are currently pending
    try {
        const docs = await getDocs(
            query(collection(database, "requests"), where("status", "==", "pending"))
        )
        if (!docs.empty) {
            return docs.docs
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getLast7DaysRequestData() {
    // returns an array of all the request documents from the past 7 days
    try {
        const docs = await getDocs(
            query(collection(database, "requests"), where("date", ">=", new Timestamp(Timestamp.now().seconds - 7 * 24 * 60 * 60, 0)))
        )
        if (!docs.empty) {
            return docs.docs
        }
    } catch (error) {
        console.error(error)
    }
}