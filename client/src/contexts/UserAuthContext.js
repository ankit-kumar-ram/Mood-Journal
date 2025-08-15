import axios from "axios";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebase";

const userAuthContext = createContext();

export const UserAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Helper to get Firebase ID token for protected API calls
  const getIdToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(/* forceRefresh */ true);
    }
    return null;
  };

  // Add user info to your backend MongoDB database
  const addUserToDatabase = async (userImpl) => {
    try {
      // Use correct API endpoint with `/api/auth/register`
      await axios.post("/api/auth/register", {
        name: userImpl.user.displayName,
        email: userImpl.user.email,
      });
    } catch (error) {
      console.error("Error posting user data to the server", error);
    }
  };

  const signUp = async (name, email, password) => {
    // Create user in Firebase
    const userImpl = await createUserWithEmailAndPassword(auth, email, password);

    // Update Firebase profile with name
    await updateProfile(auth.currentUser, {
      displayName: name,
    });

    // Add user info to backend DB
    await addUserToDatabase(userImpl);

    return userImpl;
  };

  const logIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const googleAuthProvider = new GoogleAuthProvider();
    const userImpl = await signInWithPopup(auth, googleAuthProvider);

    await addUserToDatabase(userImpl);

    return userImpl;
  };

  const logOut = () => {
    window.location.reload();
    return signOut(auth);
  };

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider
      value={{
        user,
        signUp,
        logIn,
        signInWithGoogle,
        logOut,
        forgotPassword,
        getIdToken, // expose for protected calls
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(userAuthContext);
};
