import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { HeartHandshake, Search, Sparkles, AlertCircle } from "lucide-react";
export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    idNumber: "",
    contactNumber: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    idNumber: "",
  });

  const validateEmail = (email: string): boolean => {
    // Email format: username@school.saiuniversity.edu.in
    // Valid schools: soai, scds, sas, sot, sob, som, sol
    const emailPattern = /^[a-zA-Z0-9._-]+@(soai|scds|sas|sot|sob|som|sol)\.saiuniversity\.edu\.in$/i;
    return emailPattern.test(email);
  };

  const validateIdNumber = (idNumber: string): boolean => {
    // ID number should be numeric and between 6-10 digits
    const idPattern = /^\d{6,10}$/;
    return idPattern.test(idNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      email: "",
      idNumber: "",
    };

    // Validate email
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please use a valid Sai University email (@saiuniversity.edu.in)";
    }

    // Validate ID number
    if (!validateIdNumber(formData.idNumber)) {
      newErrors.idNumber = "ID number must be 6-10 digits";
    }

    setErrors(newErrors);

    // If there are any errors, don't submit
    if (newErrors.email || newErrors.idNumber) {
      return;
    }

    // Store user data in localStorage for demo
    localStorage.setItem("user", JSON.stringify(formData));
    localStorage.setItem("isLoggedIn", "true");
    navigate("/dashboard");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (name === "email" || name === "idNumber") {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/starBG.png')",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md relative z-10 shadow-xl border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-full">
              <HeartHandshake className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="flex items-center justify-center gap-2">
              Lost & Found Portal
              <Sparkles className="w-5 h-5 text-secondary" />
            </CardTitle>
            <CardDescription className="mt-2">
              Helping people reconnect with their belongings
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-input-background border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@school.saiuniversity.edu.in"
                value={formData.email}
                onChange={handleChange}
                required
                className={`bg-input-background border-primary/20 focus:border-primary ${
                  errors.email ? "border-destructive focus:border-destructive" : ""
                }`}
              />
              {errors.email && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                name="idNumber"
                placeholder="123456"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className={`bg-input-background border-primary/20 focus:border-primary ${
                  errors.idNumber ? "border-destructive focus:border-destructive" : ""
                }`}
              />
              {errors.idNumber && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.idNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="bg-input-background border-primary/20 focus:border-primary"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Search className="w-4 h-4 mr-2" />
              Enter Portal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}