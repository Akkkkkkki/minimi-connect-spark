import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { getEventTicketSetting, getTicketTypes, reserveFreeTicket } from '@/services/ticketing';

const eventSchema = z.object({
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
  eventType: z.string().min(1, {
    message: "Event type is required.",
  }),
  tags: z.string().optional(),
  maxParticipants: z.coerce.number().min(2, { message: "At least 2 participants." }).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [ticketingEnabled, setTicketingEnabled] = useState(false);
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState(1);
  const [allowWaitlist, setAllowWaitlist] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([
    { name: "General Admission", quantity: 30, price: 0 }
  ]);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
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
      eventType: "social",
      tags: "",
      maxParticipants: 30,
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
      let endDateTime = null;
      if (values.endDate && values.endTime) {
        endDateTime = new Date(`${values.endDate}T${values.endTime}`);
      }
      const tagsList = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
      const { data, error } = await supabase
        .from('event')
        .insert({
          creator_id: user.id,
          title: values.title,
          description: values.description,
          location: values.location,
          city: values.city,
          country: values.country,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime ? endDateTime.toISOString() : null,
          event_type: values.eventType,
          tags: tagsList,
          applicants_max_number: values.maxParticipants,
        })
        .select('id')
        .single();
        
      if (error) throw error;
      const eventId = data.id;
      
      // Ticketing logic
      if (ticketingEnabled) {
        // Insert event_ticket_setting
        await supabase.from('event_ticket_setting').insert({
          event_id: eventId,
          ticket_enabled: true,
          max_tickets_per_user: maxTicketsPerUser,
          allow_waitlist: allowWaitlist,
        });
        // Insert ticket types
        for (const t of ticketTypes) {
          await supabase.from('ticket_type').insert({
            event_id: eventId,
            name: t.name,
            quantity: t.quantity,
            price: t.price,
          });
        }
      }
      
      toast.success("Event created successfully!");
      navigate("/event-management");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Create Event</h1>
        <p className="text-gray-600 text-lg max-w-3xl">
          Create a new event for users to join and get matched. Be descriptive to attract the right participants.
        </p>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Networking Coffee Meetup" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a clear, descriptive title for your event.
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
                          placeholder="Describe what the event involves and what participants can expect..." 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about your event, including purpose and expectations.
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
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
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
                        Add relevant tags to help users find your event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Ticketing Section - moved inside the form and using plain UI components */}
                <div className="mt-8 border-t pt-6">
                  <div className="mb-4 flex items-center gap-4">
                    <Switch checked={ticketingEnabled} onCheckedChange={setTicketingEnabled} id="enable-ticketing" />
                    <label htmlFor="enable-ticketing" className="font-medium cursor-pointer select-none">Enable Ticketing for this Event</label>
                  </div>
                  {ticketingEnabled && (
                    <div className="space-y-4">
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex flex-col w-48">
                          <label htmlFor="max-tickets-per-user" className="mb-1 font-medium">Max Tickets Per User</label>
                          <input
                            id="max-tickets-per-user"
                            type="number"
                            min={1}
                            value={maxTicketsPerUser}
                            onChange={e => setMaxTicketsPerUser(Number(e.target.value))}
                            className="border rounded px-2 py-1"
                          />
                          <span className="text-xs text-muted-foreground mt-1">How many tickets each user can reserve (default: 1)</span>
                        </div>
                        <div className="flex flex-col w-48">
                          <label htmlFor="allow-waitlist" className="mb-1 font-medium">Allow Waitlist</label>
                          <div className="flex items-center gap-2">
                            <Switch checked={allowWaitlist} onCheckedChange={setAllowWaitlist} id="allow-waitlist" />
                            <span className="text-xs text-muted-foreground">Allow users to join a waitlist if tickets are full</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="font-medium">Ticket Types</label>
                        {ticketTypes.map((t, idx) => (
                          <div key={idx} className="flex gap-2 items-center mb-2 flex-wrap">
                            <input
                              placeholder="Ticket Name"
                              value={t.name}
                              onChange={e => {
                                const arr = [...ticketTypes];
                                arr[idx].name = e.target.value;
                                setTicketTypes(arr);
                              }}
                              className="w-1/3 border rounded px-2 py-1"
                            />
                            <input
                              type="number"
                              min={1}
                              placeholder="Quantity"
                              value={t.quantity}
                              onChange={e => {
                                const arr = [...ticketTypes];
                                arr[idx].quantity = Number(e.target.value);
                                setTicketTypes(arr);
                              }}
                              className="w-1/4 border rounded px-2 py-1"
                            />
                            <input
                              type="number"
                              min={0}
                              placeholder="Price"
                              value={t.price}
                              onChange={e => {
                                const arr = [...ticketTypes];
                                arr[idx].price = Number(e.target.value);
                                setTicketTypes(arr);
                              }}
                              className="w-1/4 border rounded px-2 py-1"
                              disabled
                            />
                            {ticketTypes.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== idx))}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketTypes([...ticketTypes, { name: '', quantity: 1, price: 0 }])}
                        >
                          Add Ticket Type
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {/* End Ticketing Section */}
                <div className="flex justify-end gap-4 mt-8">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate("/event-management")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CreateEvent;
