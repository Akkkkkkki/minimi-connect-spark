
import PageLayout from "@/components/layout/PageLayout";
import SignupForm from "@/components/auth/SignupForm";
import { Link } from "react-router-dom";

const SignupPage = () => {
  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            MINIMI
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Join MINIMI</h1>
          <p className="text-gray-600">Create an account to start connecting</p>
        </div>
        
        <SignupForm />
      </div>
    </PageLayout>
  );
};

export default SignupPage;
