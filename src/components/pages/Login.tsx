'use client'

import React, { useState } from 'react'; 
import { useRouter } from 'next/navigation'; 
import useAuthentification from '@/lib/hooks/authentification';
import { Button, Input } from '@nextui-org/react';

const Login = () => {

    const { login } = useAuthentification();
    const router = useRouter()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLogin, setIsLogin] = useState<boolean>(false);

    const handleLogin = () => {
        setIsLogin(true)
        if (username === "") return;
        if (password === "") return;

        login({ email:username, password })
            .then(result => {
                window.location.href = "/";
            })
        .catch(reason => {
            alert("Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer");
            setIsLogin(false);
        })
    }


    return <div className='h-screen w-screen flex'>
        <div className='md:w-[50%] w-[300px] hidden sm:flex bg-primary'></div>
        <div className='md:w-[50%] w-full bg-white flex flex-col justify-center items-center'>
            <div className='w-full md:w-[350px] px-[10%] md:px-[0px]'>
                <div className='mb-[10px]'>
                    <p className='font-bold text-2xl'>Se connecter</p>
                </div>
                <div className='flex flex-col gap-[10px]'>
                    <Input placeholder='yatingzang0213@mail.com' onChange={(e) => setUsername(e.target.value)} />
                    <Input placeholder='*****' type='password' onChange={(e) => setPassword(e.target.value)} />
                    <Button onClick={handleLogin}>{isLogin  ? "Connexion en cours..." : "Connexion"}</Button>
                </div>
            </div>
        </div>
    </div>
}

export default Login;
