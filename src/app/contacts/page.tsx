"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import clientData from "@/lib/clientData";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchContacts();
  }, [router]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let session = {};
      if (typeof window !== "undefined" && localStorage.getItem("contactAppSession")) {
        session = JSON.parse(localStorage.getItem("contactAppSession") || "{}");
      }
      const userId = (session as any)?.userId ?? undefined;
      const contacts = clientData.getContacts(userId);
      setContacts(contacts);
    } catch (err) {
      setError("Failed to load contacts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const ok = clientData.deleteContact(id);
      if (!ok) throw new Error("Delete failed");
      fetchContacts();
    } catch (err) {
      setError("Failed to delete contact");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">All Contacts</h1>
        <p className="text-gray-600 mb-8">
          View all contacts shared on the community
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {contacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            No contacts yet. Be the first to share!
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 flex-1">
                    {contact.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-600 mb-1">{contact.email}</p>
                <p className="text-gray-500 text-sm">{contact.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
