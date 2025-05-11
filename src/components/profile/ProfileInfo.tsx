import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthMonth: z.string().min(1, {
    message: "Please select your birth month.",
  }),
  birthYear: z.string().min(4, {
    message: "Please select your birth year.",
  }),
  city: z.string().min(2, {
    message: "Please enter your city.",
  }),
  country: z.string().min(2, {
    message: "Please enter your country.",
  }),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=32";
function getValidAvatarUrl(avatar?: string | null): string {
  if (!avatar || typeof avatar !== "string" || avatar.trim() === "") return DEFAULT_AVATAR;
  if (/^https?:\/\//.test(avatar)) return avatar;
  return `https://uiswjpjgxsrnfxerzbrw.supabase.co/storage/v1/object/public/user/profile/${avatar}`;
}

const ProfileInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthMonth: "",
      birthYear: "",
      city: "",
      country: "",
      bio: "",
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First, try to get the profile
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // If profile not found, create a new one
        if (error && error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          
          // Create a new profile for the user
          const { error: insertError } = await supabase
            .from('profile')
            .insert([
              { 
                id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast.error('Failed to create your profile');
            setLoading(false);
            return;
          }
          
          // Successfully created, now set default profile values
          const defaultProfile: ProfileFormValues = {
            firstName: "",
            lastName: "",
            birthMonth: "",
            birthYear: "",
            city: "",
            country: "",
            bio: "",
          };
          
          setProfileData(defaultProfile);
          form.reset(defaultProfile);
          setLoading(false);
          return;
        } else if (error) {
          // If it's not a "no rows returned" error, throw it
          throw error;
        }
        
        // Map database fields to form fields
        const profileValues: ProfileFormValues = {
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          birthMonth: data.birth_month ? String(data.birth_month).padStart(2, '0') : "",
          birthYear: data.birth_year ? String(data.birth_year) : "",
          city: data.city || "",
          country: data.country || "",
          bio: data.bio || "",
        };
        
        setProfileData(profileValues);
        setAvatarUrl(data.avatar_url);
        form.reset(profileValues);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    try {
      // Create an update object with only the changed fields
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      // Only add fields that have changed
      if (values.firstName !== profileData?.firstName) updateData.first_name = values.firstName;
      if (values.lastName !== profileData?.lastName) updateData.last_name = values.lastName;
      if (values.birthMonth !== profileData?.birthMonth) updateData.birth_month = values.birthMonth ? parseInt(values.birthMonth) : null;
      if (values.birthYear !== profileData?.birthYear) updateData.birth_year = values.birthYear ? parseInt(values.birthYear) : null;
      if (values.city !== profileData?.city) updateData.city = values.city;
      if (values.country !== profileData?.country) updateData.country = values.country;
      if (values.bio !== profileData?.bio) updateData.bio = values.bio;

      console.log('Updating profile with data:', updateData);
      console.log('Current profile data:', profileData);
      console.log('Form values:', values);

      const { error } = await supabase
        .from('profile')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpdate = () => {
    // This would typically involve file upload to Supabase storage
    toast.info("Avatar upload functionality will be implemented soon");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
            <div className="flex-1 space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <img 
                src={getValidAvatarUrl(avatarUrl)}
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" 
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                onClick={handleAvatarUpdate}
              >
                <span className="sr-only">Edit photo</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">Profile photo</span>
          </div>
          
          <div className="flex-1">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="birthMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Month</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            {...field}
                          >
                            <option value="">Month</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                          </select>
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
                          <Input type="number" min="1900" max="2010" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;
