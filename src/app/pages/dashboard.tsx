import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Search,
  Package,
  Smartphone,
  BookOpen,
  Key,
  Wallet,
  Backpack,
  Headphones,
  Watch,
  MapPin,
  Calendar,
  User,
  LogOut,
  PlusCircle,
  Heart,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface LostFoundItem {
  id: string;
  type: "lost" | "found";
  category: string;
  title: string;
  description: string;
  location: string;
  date: string;
  contactName: string;
  contactNumber: string;
  imageUrl?: string;
}

const categories = [
  { name: "Electronics", icon: Smartphone, color: "bg-primary/10 text-primary" },
  { name: "Books & Notes", icon: BookOpen, color: "bg-secondary/20 text-secondary" },
  { name: "Keys", icon: Key, color: "bg-accent/20 text-accent" },
  { name: "Wallets", icon: Wallet, color: "bg-primary/20 text-primary" },
  { name: "Bags", icon: Backpack, color: "bg-secondary/10 text-secondary" },
  { name: "Accessories", icon: Headphones, color: "bg-accent/10 text-accent" },
  { name: "Watches", icon: Watch, color: "bg-primary/15 text-primary" },
  { name: "Others", icon: Package, color: "bg-secondary/15 text-secondary" },
];

// Demo data
const demoItems: LostFoundItem[] = [
  {
    id: "1",
    type: "found",
    category: "Electronics",
    title: "iPhone 13 Pro",
    description: "Black iPhone found near the library. Has a blue case.",
    location: "Main Library - 2nd Floor",
    date: "2026-02-10",
    contactName: "Sarah Johnson",
    contactNumber: "+1-555-0123",
  },
  {
    id: "2",
    type: "lost",
    category: "Keys",
    title: "Car Keys with Keychain",
    description: "Lost car keys with a red Ferrari keychain attached.",
    location: "Parking Lot B",
    date: "2026-02-09",
    contactName: "Mike Chen",
    contactNumber: "+1-555-0456",
  },
  {
    id: "3",
    type: "found",
    category: "Wallets",
    title: "Brown Leather Wallet",
    description: "Found a brown leather wallet containing student ID.",
    location: "Cafeteria",
    date: "2026-02-11",
    contactName: "Emma Wilson",
    contactNumber: "+1-555-0789",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
  try {
    const userData = localStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Fallback so dashboard always shows
      setUser({
        name: "Guest User",
        contactNumber: ""
      });
    }
  } catch (err) {
    setUser({
      name: "Guest User",
      contactNumber: ""
    });
  }
}, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [items, setItems] = useState<LostFoundItem[]>([]);
  useEffect(() => {
  if (!Array.isArray(items)) {
    setItems([]);
  }
}, [items]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LostFoundItem>>({
    type: "lost",
    category: "",
    title: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
  const loadItems = async () => {
    try {
      const res = await fetch("/.netlify/functions/getitems");
      const data = await res.json();
      if (Array.isArray(data)) {
  setItems(data);
} else {
  console.error("API returned:", data);
  setItems([]);
}

    } catch (err) {
      console.error("Failed to load items", err);
    }
  };

  loadItems();
}, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setNewItem({ ...newItem, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setNewItem({ ...newItem, imageUrl: "" });
  };

  const handlePostItem = async () => {
    if (!newItem.category || !newItem.title || !newItem.description || !newItem.location) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/createItem", {
        method: "POST",
        body: JSON.stringify({
          type: newItem.type,
          category: newItem.category,
          title: newItem.title,
          description: newItem.description,
          location: newItem.location,
          date: newItem.date || new Date().toISOString().split("T")[0],
          contactName: user?.name || "Anonymous",
          contactNumber: user?.contactNumber || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post item");
      }

      const savedItem = await response.json();
      const item: LostFoundItem = {
        id: savedItem.id || Date.now().toString(),
        type: newItem.type as "lost" | "found",
        category: newItem.category,
        title: newItem.title,
        description: newItem.description,
        location: newItem.location,
        date: newItem.date || new Date().toISOString().split("T")[0],
        contactName: user?.name || "Anonymous",
        contactNumber: user?.contactNumber || "",
      };

      const res = await fetch("/.netlify/functions/getitems");
      const updated = await res.json();
      setItems(updated);
      setIsDialogOpen(false);
      setNewItem({
        type: "lost",
        category: "",
        title: "",
        description: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
        imageUrl: "",
      });
      setImagePreview("");
      alert("Item posted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error posting item. Please try again.");
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (!user) return <div style={{padding: 40}}>Loading user...</div>;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cute background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-primary/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Lost & Found Portal</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-primary/20 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Search and Post Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for lost or found items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post Lost or Found Item</DialogTitle>
                  <DialogDescription>
                    Help the community by posting details about your item.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Item Status</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(value) => setNewItem({ ...newItem, type: value as "lost" | "found" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="found">Found</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Item Title</Label>
                    <Input
                      placeholder="e.g., Black iPhone 13"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Provide detailed description..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Main Library - 2nd Floor"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newItem.date}
                      onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image (Optional)</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white cursor-pointer hover:from-primary/90 hover:to-accent/90 shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload Image
                        </label>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-primary/20 hover:bg-primary/10"
                            onClick={handleRemoveImage}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="mt-2 rounded-lg overflow-hidden border-2 border-primary/20">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Max file size: 2MB
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePostItem}
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    Post Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`p-4 rounded-xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${
                selectedCategory === "All"
                  ? "border-primary bg-primary/10"
                  : "border-primary/20 bg-card hover:border-primary/40"
              }`}
            >
              <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-center">All Items</p>
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-4 rounded-xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${
                    selectedCategory === category.name
                      ? "border-primary bg-primary/10"
                      : "border-primary/20 bg-card hover:border-primary/40"
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-center">{category.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2>
              {selectedCategory === "All" ? "All Items" : selectedCategory}
            </h2>
            <Badge variant="secondary" className="bg-secondary/20">
              {filteredItems.length} items
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const categoryData = categories.find((c) => c.name === item.category);
              const Icon = categoryData?.icon || Package;
              
              return (
                <Card key={item.id} className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                  {item.imageUrl && (
                    <div className="w-full h-48 overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${categoryData?.color || "bg-muted"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge
                        variant={item.type === "found" ? "default" : "secondary"}
                        className={
                          item.type === "found"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-accent text-accent-foreground"
                        }
                      >
                        {item.type === "found" ? "Found" : "Lost"}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="line-clamp-1">{item.contactName}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-3 border-primary/20 hover:bg-primary/10"
                      onClick={() => {
                        alert(`Contact: ${item.contactName}\nPhone: ${item.contactNumber}`);
                      }}
                    >
                      Contact Owner
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or browse different categories
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}