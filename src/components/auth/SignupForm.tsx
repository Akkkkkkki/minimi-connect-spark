import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { createUserProfile, signUpWithEmail } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  gender: z.string().min(1, "Please select your gender"),
  birthMonth: z.string().min(1, "Please select your birth month"),
  birthYear: z.string().min(4, "Please select your birth year"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 18; year >= currentYear - 100; year--) {
    years.push(year);
  }
  return years;
};

const years = generateYearOptions();

// Helper function to normalize email
const normalizeEmail = (email: string): string => {
  // Convert to lowercase
  let normalized = email.toLowerCase().trim();
  
  // Remove dots from Gmail addresses (they're ignored by Gmail)
  if (normalized.endsWith('@gmail.com')) {
    const [localPart, domain] = normalized.split('@');
    const localPartWithoutDots = localPart.replace(/\./g, '');
    normalized = `${localPartWithoutDots}@${domain}`;
  }
  
  return normalized;
};

// Generate a random email for testing
const generateRandomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 12);
  return `test.${randomString}@example.com`;
};

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      birthMonth: "",
      birthYear: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      setIsLoading(true);
      setSignupError(null);
      
      const { firstName, lastName, email, password, gender, birthMonth, birthYear } = values;
      
      // Convert month name to number if needed
      let birthMonthNumber = birthMonth;
      const monthNameToNumber: Record<string, string> = {
        'January': '1', 'February': '2', 'March': '3', 'April': '4',
        'May': '5', 'June': '6', 'July': '7', 'August': '8',
        'September': '9', 'October': '10', 'November': '11', 'December': '12'
      };
      
      // If birthMonth is a month name, convert it to its number
      if (monthNameToNumber[birthMonth]) {
        birthMonthNumber = monthNameToNumber[birthMonth];
      }
      
      // Normalize gender (lowercase)
      const normalizedGender = gender.toLowerCase();
      
      // Normalize email
      const normalizedEmail = normalizeEmail(email);
      
      // First, attempt the signup with normalized email
      const { user, error } = await signUpWithEmail(normalizedEmail, password, {
        first_name: firstName,
        last_name: lastName,
        gender: normalizedGender,
        birth_month: birthMonthNumber,
        birth_year: birthYear,
      });
      
      if (error) {
        // Handle specific error cases with user-friendly messages
        if (error.message?.includes('Database error')) {
          setSignupError("There was a problem creating your account. Please try using a different email address or try again later.");
        } else {
          setSignupError(`Signup failed: ${error.message}`);
        }
        return;
      }
      
      // If signup is successful but we don't have a user (email confirmation required)
      if (!user) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
        navigate('/login');
        return;
      }
      
      // If we have a user, create their profile
      try {
        const { success, error: profileError } = await createUserProfile(
          user.id,
          {
            first_name: firstName,
            last_name: lastName,
            gender: normalizedGender,
            birth_month: birthMonthNumber,
            birth_year: birthYear
          }
        );
        
        if (profileError) {
          // Don't show this error to the user - login was successful
        }
      } catch (profileErr) {
        // Don't show this error to the user - login was successful
      }
      
      toast.success("Account created successfully! Please check your email to confirm your account.");
      navigate('/login');
    } catch (err: any) {
      setSignupError(`Signup error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
      
      {signupError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {signupError}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="birthMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Month</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={month} value={String(index + 1)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a secure password" 
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm your password" 
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
