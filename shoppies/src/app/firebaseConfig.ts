import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, getDocs, query, where, Timestamp, updateDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, signOut, onAuthStateChanged, User, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCNs0dmj_xnh1BTd7F-31nZVH385mIYAK4",
  authDomain: "nus-shopback-hackathon.firebaseapp.com",
  projectId: "nus-shopback-hackathon",
  storageBucket: "nus-shopback-hackathon.firebasestorage.app",
  messagingSenderId: "342825868584",
  appId: "1:342825868584:web:605359965b201836ea041d"
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
        const response = await signOut(auth)
    } catch (error) {
        console.error("Error: ", error)
    }
}

export async function createUserData(
    successful_login : number, quest_login : number, successful_purchase : number,
    quest_purchase : number, visited_rewards : boolean, quest_expiry : Timestamp, points : number,
    streak : number[], travel : number, fashion : number, electronics : number, health : number,
    beauty : number
) {
    try {
        if (!currentUser) {
          throw new Error("No user signed in");
        }
        const response = await addDoc(collection(database, "userData"), {
            "userEmail" : currentUser.email, //ignore error: user must be signed in for this function to be called
            "streak" : streak,
            
            // quest related
            "successful_logins": successful_login, //curr number of successful logins
            "quest_logins" : quest_login, //number of logins needed to complete current quest
            "successful_purchases" : successful_purchase, //curr number of successful purchases
            "quest_purchases" : quest_purchase, //number of purchases needed to complete current quest
            "quest_has_visited_rewards" : visited_rewards, //has the user visited rewards page
            "quest_expiry" : quest_expiry, //time that the quest expires

            "points" : points, //number of points the user has from doing quests/streaks
            "travel" : travel,
            "fashion" : fashion,
            "electronics" : electronics,
            "health" : health,
            "beauty" : beauty
        })
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function updateUserData(
    successful_login : number, quest_login : number, successful_purchase : number,
    quest_purchase : number, visited_rewards : boolean, quest_expiry : Timestamp, points : number, 
    streak : number[], travel : number, fashion : number, electronics : number, health : number,
    beauty : number
) {
    try {
        if (!currentUser) {
          throw new Error("No user signed in");
        }
        const doc = await getDocs(query(collection(database, "userData"), where("userEmail", "==", currentUser.email)))
        if (doc.empty) {
          throw new Error("No user data found");
        }
        const docRef = doc.docs[0].ref
        const response = await updateDoc(docRef, {
            "userEmail" : currentUser.email, //ignore error: user must be signed in for this function to be called
            "streak" : streak,
            
            // quest related
            "successful_logins": successful_login, //curr number of successful logins
            "quest_logins" : quest_login, //number of logins needed to complete current quest
            "successful_purchases" : successful_purchase, //curr number of successful purchases
            "quest_purchases" : quest_purchase, //number of purchases needed to complete current quest
            "quest_has_visited_rewards" : visited_rewards, //has the user visited rewards page
            "quest_expiry" : quest_expiry, //time that the quest expires

            "points" : points, //number of points the user has from doing quests/streaks
            "travel" : travel,
            "fashion" : fashion,
            "electronics" : electronics,
            "health" : health,
            "beauty" : beauty

        })
        console.log("Successfully updated data")
    } catch (error) {
        console.log("Error: ", error)
    }
}

export async function getUserData() {
    try {
        //ignore error: user must be signed in for this function to be called
        if (!currentUser) {
          throw new Error("No user signed in");
        }
        const response = await getDocs(query(collection(database, "userData"), where("userEmail", "==", currentUser.email)))
        return response.docs[0].data()
    } catch (error) {
        console.log("Error:", error)
    }
}

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});