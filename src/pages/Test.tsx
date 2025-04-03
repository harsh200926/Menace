import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Test = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page - Working!</h1>
      <p className="mb-4">If you can see this, the application is rendering correctly.</p>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </div>
  );
};

export default Test; 