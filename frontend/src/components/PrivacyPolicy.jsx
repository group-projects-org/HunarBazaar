import { Header, Footer } from "./header_footer";
import { useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user_type } = useParams();
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Vineet Pandey";
  const email = localStorage.getItem("email") || "vp1246194@gmail.com";
  const phone = "+91-78190-XXXXX";

  return (
    <div className="relative h-full w-full bg-[#f1f3f6]">
      <Header userType={user_type} />

      <div className="min-h-[85vh] max-w-7xl mx-auto flex gap-6 py-8 px-4">

        {/* LEFT SIDEBAR */}
        <div className="w-[280px] bg-white shadow rounded h-fit">
          <div className="flex items-center gap-3 p-4 border-b">
            <img src="/assets/User.jpg" className="w-12 h-12 rounded-full" />
            <div>
              <p className="text-sm text-gray-500">Hello,</p>
              <p className="font-semibold">{username}</p>
            </div>
          </div>

          <SidebarItem text="My Orders" onClick={() => navigate("/Orders")} />
          <SidebarItem text="Profile Information" active />
          <SidebarItem text="Manage Addresses" onClick={() => navigate("/addresses")} />
          <SidebarItem text="PAN Card Information" />
          <SidebarItem text="Saved Cards" />
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 space-y-6">

          {/* PERSONAL INFO */}
          <Section title="Personal Information">
            <div className="grid grid-cols-2 gap-6">
              <Input label="Full Name" value={username} />
              <Input label="Username" value={username} />
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Your Gender</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked readOnly /> Male
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" /> Female
                </label>
              </div>
            </div>
          </Section>

          {/* EMAIL */}
          <Section title="Email Address">
            <Input value={email} />
          </Section>

          {/* PHONE */}
          <Section title="Mobile Number">
            <Input value={phone} />
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SidebarItem({ text, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer border-b text-sm ${
        active
          ? "bg-green-50 text-green-700 font-medium"
          : "hover:bg-gray-100"
      }`}
    >
      {text}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <button className="text-green-600 hover:underline text-sm">Edit</button>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value }) {
  return (
    <div>
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <input
        value={value}
        readOnly
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500 bg-white"
      />
    </div>
  );
}
