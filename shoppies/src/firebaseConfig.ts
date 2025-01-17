import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, getDocs, query, where, Timestamp, updateDoc, DocumentReference } from 'firebase/firestore'
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    currentUser = null;
  }
});

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
        await signOut(auth)
    } catch (error) {
        console.error("Error: ", error)
    }
}

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

export interface Transaction {
    item_name: string;
    quantity: number;
    purchase_date: Timestamp;
}

type transactions = Transaction[];

export async function createUserData(voucher_amount : number, transaction_history : transactions[]) {
    try {
        if (!currentUser) {
            throw new Error("No user signed in");
        }
        await addDoc(collection(database, "userData"), {
            "user_email" : currentUser.email,
            "voucher_amount" : voucher_amount,
            "transaction_history" : transaction_history
        }) 
        console.log("Successfully created new user");
    } catch (error) {
        console.log("Error: ", error) 
    }
}

export async function updateUserData(voucher_amount : number, transaction_history : transactions[]) {
    try {
        if (!currentUser) {
            throw new Error("No user signed in");
        }
        const doc = await getDocs(query(collection(database, "userData"), where("user_email", "==", currentUser.email)))
        if (doc.empty) {
            throw new Error("No user data found");
        }
        const docRef = doc.docs[0].ref
        await updateDoc(docRef, {
            "user_email" : currentUser.email,
            "voucher_amount" : voucher_amount,
            "transaction_history" : transaction_history
        })
        console.log("Successfully updated user data")
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function getUserData() {
    try {
        if (!currentUser) {
          throw new Error("No user signed in");
        }
        const response = await getDocs(query(collection(database, "userData"), where("user_email", "==", currentUser.email)))
        return response.docs[0].data()
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function getAllUserData() {
    try {
        const response = await getDocs(query(collection(database, "userData")))
        return response.docs
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function createTransactionData(purchase : { item_name: string, quantity: number }[], purchase_date : Timestamp) {
    // calling function must handle a possible error
    if (!currentUser) {
        throw new Error("No user signed in");
    }
    await addDoc(collection(database, "transactions"), {
        "userEmail" : currentUser.email,
        "purchase" : purchase,
        "purchase_date" : purchase_date
    })
}

export async function updateTransactionData(purchase : { item_name: string, quantity: number }[], purchase_date : Timestamp) {
    try {
        if (!currentUser) {
            throw new Error("No user signed in");
        }
        const doc = await getDocs(query(collection(database, "transactions"), where("user_email", "==", currentUser.email)))
        if (doc.empty) {
            throw new Error("No transaction data found");
        }
        const docRef = doc.docs[0].ref
        await updateDoc(docRef, {
            "user_email" : currentUser.email,
            "purchase" : purchase,
            "purchase_date" : purchase_date
        })
        console.log("Successfully updated transaction data")
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function getTransactionData() {
    try {
        //ignore error: user must be signed in for this function to be called
        if (!currentUser) {
          throw new Error("No user signed in");
        }
        const response = await getDocs(query(collection(database, "transactions"), where("user_email", "==", currentUser.email)))
        return response.docs[0].data()
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function createInventoryData(item_name : string, quantity : number, cost : number) {
    try {
        const log_entry = String("Added " + quantity + " " + item_name)
        await addDoc(collection(database, "inventory"), {
            "item_name" :  item_name,
            "quantity" : quantity,
            "cost" : cost,
            "log" : [log_entry]
        })
        console.log("Successfully created new inventory item.")
    } catch (error) {
        console.error("Error creating new inventory item. ", error)
    }
}

export async function changeCostOfInventoryItem(item_name : string, cost : number) {
    try {
        const original_docs =  await getDocs(
            query(collection(database, "inventory"), where("item_name", "==", item_name))
        )
        if (!original_docs.empty && original_docs.size == 1) {
            const original_data = original_docs.docs[0].data()
            const original_data_ref = original_docs.docs[0].ref

            const new_log_entry = "Price of " + item_name + " changed to $" + cost + " on " + Timestamp.now().toDate().toLocaleString()

            const new_log = original_data["log"]
            new_log.push(new_log_entry)

            await updateDoc(original_data_ref, {
                "cost" : cost,
                "log" : new_log
            })
            console.log("Successfully updated inventory item.")
        } else {
            console.error("Error!")
        }
    } catch (error) {
        console.error("Error updating new inventory item. ", error)
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
                ? quantity + " " + item_name + " removed on " + Timestamp.now().toDate().toLocaleString()
                : quantity + " " + item_name + " stocked on " + Timestamp.now().toDate().toLocaleString()

            
            const new_log = original_data["log"]
            new_log.push(new_log_entry)
            // const new_log : string[] = original_data["log"].push(new_log_entry)

            await updateDoc(original_data_ref, {
                "quantity": new_item_quantity,
                "log" : new_log
            })
            console.log("Successfully updated inventory item.")
        } else {
            console.error("Error!")
        }
    } catch (error) {
        console.error("Error updating new inventory item. ", error)
    }
}

export async function getItemInventoryData(item_name : string) {
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

export async function getAllInventoryData() {
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

export async function createRequestData(item_name : string) {
    //status is a string of either of the following values: pending/approved/rejected. always initially "pending"
    //this function may throw errors and must be handled by the caller
    if (!auth.currentUser) {
        throw new Error("No User signed in")
    }
    const log_entry = "Request created on " + Timestamp.now().toDate().toLocaleString()
    await addDoc(collection(database, "requests"), {
        "user_email" : auth.currentUser.email,
        "item_name" : item_name,
        "date" : Timestamp.now(),
        "status" : "pending",
        "log" : [log_entry]
    })
}

export async function updateRequestData(docRef : DocumentReference, status : string, log : string[]) {
    //status is a string of either of the following values: pending/approved/rejected. always initially "pending"
    try {
        updateDoc(docRef, {
            "status" : status,
            "log" : log.push("Status updated to " + status + " on " + Timestamp.now().toDate().toLocaleString())
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