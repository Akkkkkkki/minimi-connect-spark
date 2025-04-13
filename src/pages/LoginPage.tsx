
import PageLayout from "@/components/layout/PageLayout";
import LoginForm from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            MINIMI
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to your account to continue</p>
        </div>
        
        <LoginForm />
      </div>
    </PageLayout>
  );
};

export default LoginPage;
