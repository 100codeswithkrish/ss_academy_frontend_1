import React from "react";

const SupportDetails = () => {
  const supportContacts = [
    { name: "Krish D Jadhav | M.Shaktiganesh", phone: "7715859191" },
    { name: "M.Shaktiganesh", phone: "8291582298" },
  ];

  // A simple but effective way to ensure we always show one contact.
  const displayContact = supportContacts[0] || { name: "Support", phone: "N/A" };

  return (
    <p className="mt-6 text-center text-sm text-gray-400">
      Need help? <br /> Contact {displayContact.name}:{" "}
      <a href={`tel:${displayContact.phone}`} className="text-blue-400 hover:underline">
        {displayContact.phone}
      </a>
    </p>
  );
};

export default SupportDetails;