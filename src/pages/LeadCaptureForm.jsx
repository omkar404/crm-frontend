import { useState } from "react";
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function LeadCaptureForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Landing Page",
  });
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/api/auth/create", form);
    setOk(true);
    setForm({ name: "", email: "", phone: "", source: "Landing Page" });
  };

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Lead Capture</CardTitle>
        </CardHeader>
        <CardContent>
          {ok && (
            <div className="mb-3 text-green-600">
              Thanks! We'll contact you soon.
            </div>
          )}
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Source</Label>
              <Input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
