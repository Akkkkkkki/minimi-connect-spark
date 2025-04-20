
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  birthMonth: z.string().min(1, "Birth month required"),
  birthYear: z.string().min(4, "Birth year required"),
  city: z.string().min(2, "City required"),
  country: z.string().min(2, "Country required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthMonth: "",
      birthYear: "",
      city: "",
      country: "",
    },
  });

  useEffect(() => {
    // Just in case, redirect if user is not signed in
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    const { error } = await supabase
      .from("profile")
      .update({
        first_name: values.firstName,
        last_name: values.lastName,
        birth_month: Number(values.birthMonth),
        birth_year: Number(values.birthYear),
        city: values.city,
        country: values.country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not save profile",
        description: error.message,
      });
    } else {
      toast({
        variant: "default",
        title: "Profile Complete!",
        description: "You can update these details anytime in your profile settings.",
      });
      navigate("/"); // Redirect to main page after onboarding
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="py-8">
          <h1 className="text-2xl font-bold mb-4 text-accent">Complete your profile</h1>
          <p className="text-muted-foreground mb-6">
            You need to finish setting up your profile to use the rest of the app.<br/>You can always change these details later!
          </p>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Month</FormLabel>
                      <FormControl>
                        <Input placeholder="MM" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="YYYY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Save Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
