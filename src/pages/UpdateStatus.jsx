import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { updateStatusByEmail } from "../api/mailApi";
import { successToast, errorToast } from "@/utils/customToast";

const statusOptions = ["Reached", "Bounced", "stop", "Enquiry"];

export default function UpdateStatus() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !status) return errorToast("Email and status required");
    setLoading(true);
    try {
      await updateStatusByEmail(email, status);
      successToast(`Status updated to ${status}`);
      setEmail("");
      setStatus("");
    } catch (err) {
      errorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Update Status by Email</h2>
        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <Label>New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>
    </div>
  );
}