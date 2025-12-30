import { useEffect } from "react";
import { useNavigate } from "react-router";
import { clearStudentSession } from "~/lib/auth.client";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    clearStudentSession();
    navigate("/login");
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p>Logging out...</p>
    </div>
  );
}
