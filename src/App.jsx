import AuthProvider from "./provider/AuthProvider";
import Routes from "./routes/Routes";
import { Suspense } from "react";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <h1 className="dark:text-white dark:bg-gray-900 bg-gray-50">
            Loading...
          </h1>
        }
      >
        <Routes />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
