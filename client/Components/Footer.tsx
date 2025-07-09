import React from "react";

function Footer() {
  return (
    <footer className="py-8 bg-white border-t">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} JobFindr. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
