import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const activitySchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(3, {
    message: "Location is required.",
  }),
  city: z.string().min(2, { message: "City is required." }),
  country: z.string().min(2, { message: "Country is required." }),
  startDate: z.string().min(1, {
    message: "Start date is required.",
  }),
  startTime: z.string().min(1, {
    message: "Start time is required.",
  }),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  activityType: z.string().min(1, {
    message: "Activity type is required.",
  }),
  tags: z.string().optional(),
  maxParticipants: z.coerce.number().min(2, { message: "At least 2 participants." }).optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

const EditActivity = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      city: "",
      country: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      activityType: "social",
      tags: "",
      maxParticipants: 30,
    },
  });

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("activity")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast.error("Failed to load activity");
        setLoading(false);
        return;
      }
      // Parse start/end date/time
      const start = new Date(data.start_time);
      let endDate = "";
      let endTime = "";
      if (data.end_time) {
        const end = new Date(data.end_time);
        endDate = end.toISOString().slice(0, 10);
        endTime = end.toTimeString().slice(0, 5);
      }
      form.reset({
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        city: data.city || "",
        country: data.country || "",
        startDate: start.toISOString().slice(0, 10),
        startTime: start.toTimeString().slice(0, 5),
        endDate,
        endTime,
        activityType: data.activity_type || "social",
        tags: (data.tags || []).join(", ") || "",
        maxParticipants: data.max_participants || 30,
      });
      setLoading(false);
    };
    fetchActivity();
    // eslint-disable-next-line
  }, [id]);

  const onSubmit = async (values: ActivityFormValues) => {
    if (!user) {
      toast.error("You must be logged in to edit an activity");
      return;
    }
    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
      let endDateTime = null;
      if (values.endDate && values.endTime) {
        endDateTime = new Date(`${values.endDate}T${values.endTime}`);
      }
      const tagsList = values.tags ? values.tags.split(",").map((tag) => tag.trim()) : [];
      const { error } = await supabase
        .from("activity")
        .update({
          title: values.title,
          description: values.description,
          location: values.location,
          city: values.city,
          country: values.country,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime ? endDateTime.toISOString() : null,
          activity_type: values.activityType,
          tags: tagsList,
          max_participants: values.maxParticipants,
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Activity updated successfully!");
      navigate("/activity-management");
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Failed to update activity", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Edit Activity</h1>
        <p className="text-gray-600 text-lg max-w-3xl">
          Update your activity details below.
        </p>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Networking Coffee Meetup" {...field} />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive title for your activity.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what the activity involves and what participants can expect..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your activity, including purpose and expectations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Central Park, New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., USA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="activityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Type</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              {...field}
                            >
                              <option value="social">Social</option>
                              <option value="professional">Professional</option>
                              <option value="dating">Dating</option>
                              <option value="hobby">Hobby</option>
                              <option value="sports">Sports</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Participants</FormLabel>
                        <FormControl>
                          <Input type="number" min={2} {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum number of participants allowed (default: 30)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., networking, startup, tech" {...field} />
                        </FormControl>
                        <FormDescription>
                          Add relevant tags to help users find your activity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/activity-management")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EditActivity; 