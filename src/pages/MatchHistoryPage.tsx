import PageLayout from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MatchHistory from "@/components/profile/MatchHistory";

const MatchHistoryPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to view your match history", {
        description: "You'll be redirected to the login page"
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <MatchHistory />
    </PageLayout>
  );
};

export default MatchHistoryPage;
