import { AuthProvider, useAuth } from "@/provider/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router"
import { useEffect } from "react";

const InitialLayout = () => {
    const {session, initialized} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(()=> {
        if (!initialized) return;
        const inAuthGroup = segments[0] === '(auth)';

        if (session && !inAuthGroup) {
            router.replace('/list');
        } else if (!session && inAuthGroup) {
            router.replace('/');
        }
    }, [session, initialized]);

    return (<Slot/>)
};

const RootLayout = () => {
    return (
        <AuthProvider>
            <InitialLayout/>
        </AuthProvider>
    );
};

export default RootLayout;