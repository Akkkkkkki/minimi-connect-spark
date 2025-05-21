import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MatchHistoryPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/matches", { replace: true });
  }, [navigate]);
  return null;
};

export default MatchHistoryPage;
