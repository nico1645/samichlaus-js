import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/AuthProvider';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorBool, setErrorBool] = useState(false);
    const [error, setError] = useState('');
    const { setToken } = useAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        setToken("this is a test token");
        navigate("/", { replace: true });
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a
                    href="#"
                    className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
                >
                    <img
                        src="/samichlaus_icon.png"
                        alt="Logo"
                        className=" w-16 h-16 mx-4"
                    ></img>
                    Samichlaus-Vereinigung Hergiswil
                </a>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <form
                            onSubmit={(e) => handleLogin(e)}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <div className="mb-2 block dark:text-white">
                                    Enter Email
                                </div>
                                <input name='email' className='w-full rounded-lg p-1 border-black border-2' type='email' placeholder='mail@mail.com' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                            </div>
                            <div>
                                <div className="mb-2 block dark:text-white">
                                    Enter Password
                                </div>
                                    <input name='password' className='w-full rounded-lg p-1 border-black border-2' type='password' pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                            </div>
                            {errorBool ? (
                                <div className='w-full rounded-lg p-2 text-white bg-red-500 border-red-600 border-2'>
                                    {error}
                                </div>
                            ) : null}
                            <button type='submit' className='w-full p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white'>
                                Login
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don't have an account yet?{' '}
                                <a
                                    href={'/signup'}
                                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                                >
                                    Sign up
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}