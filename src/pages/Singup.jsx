import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../provider/AuthProvider";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorBool, setErrorBool] = useState(false);
  const [error, setError] = useState("");
  const { setToken } = useAuth();

  const onSignup = (e) => {
    e.preventDefault();
    if (passwordsMatch()) {
      axios
        .post(
          import.meta.env.VITE_APP_BACKEND_URL + "api/v1/auth/register",
          {
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password1,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          setErrorBool(false);
          setToken(res.data.token);
          navigate("/login", { replace: true });
        })
        .catch((err) => {
          if (err.response) {
            setError(
              "Error (" +
                err.response.status +
                "): " +
                err.response.data.message
            );
          } else if (err.request) {
            setError("Unexpected Error: " + err.message);
          } else {
            setError("Unexpected Error: " + err.message);
          }
          setErrorBool(true);
        });
    } else {
      setError("The passwords do not match");
      setErrorBool(true);
    }
  };

  const passwordsMatch = () => {
    if (password1 === password2) return true;
    else return false;
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
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
              Create new account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={(e) => onSignup(e)}
              action="#"
            >
              <div className="flex flex-row">
                <div className="mr-4 flex-grow">
                  <div className="mb-2 block dark:text-white">First Name</div>
                  <input
                    name="firstname"
                    autoComplete="given-name"
                    className="w-full rounded-lg p-1 border-black border-2"
                    type="text"
                    placeholder="Hans"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-grow">
                  <div className="mb-2 block dark:text-white">Last Name</div>
                  <input
                    name="lastname"
                    autoComplete="family-name"
                    className="w-full rounded-lg p-1 border-black border-2"
                    type="text"
                    placeholder="Muster"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 block dark:text-white">Email Address</div>
                <input
                  name="email"
                  autoComplete="email"
                  className="w-full rounded-lg p-1 border-black border-2"
                  type="email"
                  placeholder="mail@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-row">
                <div className="mr-4 flex-grow">
                  <div className="mb-2 block dark:text-white">Password</div>
                  <input
                    name="password1"
                    autoComplete="new-password"
                    className="w-full rounded-lg p-1 border-black border-2"
                    type="password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-grow">
                  <div className="mb-2 block dark:text-white">
                    Confirm password
                  </div>
                  <input
                    name="password2"
                    autoComplete="new-password"
                    className="w-full rounded-lg p-1 border-black border-2"
                    type="password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                  />
                </div>
              </div>
              {errorBool ? (
                <div className="w-full rounded-lg p-2 bg-red-500 text-white border-red-600 border-2">
                  {error}
                </div>
              ) : null}
              <button
                type="submit"
                className="w-full p-2 rounded-lg bg-primary-600 hover:bg-primary-800 text-white"
              >
                Create Account
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href={"/login"}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Login
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
