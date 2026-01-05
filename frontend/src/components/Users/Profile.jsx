import { useState } from "react";
import { Header, Footer } from "../header_footer";
import { useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user_type } = useParams();
  const navigate = useNavigate();

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("Vineet Pandey");
  const [email, setEmail] = useState("vp1246194@gmail.com");
  const [phone] = useState("+91-78190-XXXXX");
  const [gender, setGender] = useState("male");
  const [photo, setPhoto] = useState("/assets/User.jpg");
  const [activeTab, setActiveTab] = useState("profile");

  const saveProfile = () => {
    alert("Profile updated successfully");
    setEdit(false);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6]">
      <Header userType={user_type} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex gap-6 p-6">
          <div className="w-[280px] bg-white shadow rounded h-fit">
            <div className="flex flex-col items-center p-4 border-b">
              <img src={photo} className="w-20 h-20 rounded-full border" alt="Profile" />
              <label className="text-green-600 cursor-pointer text-sm mt-2">
                Change Photo
                <input type="file" hidden onChange={handlePhoto} />
              </label>
              <p className="mt-2 font-semibold">{name}</p>
            </div>

            <Sidebar text="My Orders" onClick={() => navigate("/Orders")} />
            <Sidebar text="Profile Information" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
            <Sidebar text="Manage Addresses" active={activeTab === "address"} onClick={() => setActiveTab("address")} />
            <Sidebar text="PAN Card Info" active={activeTab === "pan"} onClick={() => setActiveTab("pan")} />
            <Sidebar text="My Review and Ratings" />
          </div>


          <div className="flex-1 space-y-6 min-h-[calc(100vh-180px)]">

            {activeTab === "profile" && (
              <>
                <Box title="Personal Information" onEdit={() => setEdit(!edit)}>
                  <Input label="Full Name" value={name} set={setName} edit={edit} />
                  <Input label="Email" value={email} set={setEmail} edit={edit} />

                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <label className="mr-4">
                      <input
                        type="radio"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        disabled={!edit}
                      />{" "}
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        disabled={!edit}
                      />{" "}
                      Female
                    </label>
                  </div>
                </Box>

                <Box title="Mobile Number">
                  <Input value={phone} />
                </Box>

                <div className="bg-white p-6 shadow rounded space-y-5">
                  <h2 className="text-lg font-semibold">FAQs</h2>
                  <div>
                    <p className="font-medium">
                      What happens when I update my email or mobile number?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your login details are updated, and all future communications such as order updates,
                      notifications, and offers will be sent to your new email or mobile number.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">
                      When will my account be updated with the new details?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your account is updated immediately after you save the changes. In some cases,
                      verification may be required for security.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">
                      Will my existing orders be affected if I update my profile?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      No. Your order history, payments, and deliveries will remain unchanged.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">
                      Will my seller account be affected by profile updates?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      HunarBazaar uses a single account system. Any updates you make here will also reflect
                      in your seller account automatically.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">
                      Is my personal and PAN information safe?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Yes. Your information is encrypted and securely stored. It is used only for
                      verification, payments, and legal compliance.
                    </p>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button className="text-blue-600 hover:underline block">
                      Deactivate Account
                    </button>
                    <button className="text-red-600 hover:underline block">
                      Delete Account
                    </button>
                  </div>
                </div>

                {edit && (
                  <div className="bg-white p-4 shadow rounded">
                    <button
                      onClick={saveProfile}
                      className="bg-green-600 text-white px-6 py-2 rounded"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "address" && <AddressPanel />}
            {activeTab === "pan" && <PanPanel />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


const Sidebar = ({ text, onClick, active }) => (
  <div
    onClick={onClick}
    className={`px-4 py-3 cursor-pointer ${active ? "bg-green-100 text-green-700" : "hover:bg-gray-100"
      }`}
  >
    {text}
  </div>
);

const Box = ({ title, children, onEdit }) => (
  <div className="bg-white p-6 shadow rounded">
    <div className="flex justify-between mb-4">
      <h2 className="font-semibold">{title}</h2>
      {onEdit && (
        <button onClick={onEdit} className="text-green-600">
          Edit
        </button>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, value, set, edit }) => (
  <div>
    {label && <p className="text-sm text-gray-600">{label}</p>}
    <input
      value={value}
      onChange={(e) => set && set(e.target.value)}
      readOnly={!edit}
      className="w-full border rounded p-2"
    />
  </div>
);

function AddressPanel() {
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    altPhone: "",
    type: "Home",
  });

  const saveAddress = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state) {
      alert("Please fill all required fields");
      return;
    }
    setAddresses([...addresses, form]);
    setShowForm(false);
    setForm({
      name: "",
      phone: "",
      pincode: "",
      locality: "",
      address: "",
      city: "",
      state: "",
      landmark: "",
      altPhone: "",
      type: "Home",
    });
  };

  if (!showForm && addresses.length === 0) {
    return (
      <div className="bg-white p-6 shadow rounded min-h-[calc(100vh-180px)]">

        <h2 className="text-xl font-semibold mb-6">Manage Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> ADD A NEW ADDRESS
        </button>
      </div>
    );
  }

  if (!showForm && addresses.length > 0) {
    return (
      <div className="bg-white p-6 shadow rounded min-h-[calc(100vh-180px)]">

        <h2 className="text-xl font-semibold mb-6">Manage Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 mb-6"
        >
          <span className="text-xl">+</span> ADD A NEW ADDRESS
        </button>

        <div className="space-y-4">
          {addresses.map((a, i) => (
            <div key={i} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-gray-600">{a.phone}</p>
                </div>
                <span className="text-xs bg-gray-200 px-3 py-1 rounded">{a.type.toUpperCase()}</span>
              </div>
              <p className="text-sm text-gray-700">
                {a.address}, {a.locality}, {a.city}, {a.state} - {a.pincode}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow rounded min-h-[calc(100vh-180px)]">

      <h2 className="text-xl font-semibold mb-6">ADD A NEW ADDRESS</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full border p-3 rounded"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full border p-3 rounded"
            placeholder="Pincode"
            value={form.pincode}
            onChange={e => setForm({ ...form, pincode: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded"
            placeholder="Locality"
            value={form.locality}
            onChange={e => setForm({ ...form, locality: e.target.value })}
          />
        </div>

        <textarea
          className="w-full border p-3 rounded"
          rows="3"
          placeholder="Address (Area and Street)"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full border p-3 rounded"
            placeholder="City / District"
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded"
            placeholder="State"
            value={form.state}
            onChange={e => setForm({ ...form, state: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full border p-3 rounded"
            placeholder="Landmark (Optional)"
            value={form.landmark}
            onChange={e => setForm({ ...form, landmark: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded"
            placeholder="Alternate Phone (Optional)"
            value={form.altPhone}
            onChange={e => setForm({ ...form, altPhone: e.target.value })}
          />
        </div>

        <div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.type === "Home"}
                onChange={() => setForm({ ...form, type: "Home" })}
              />
              <span>Home</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.type === "Work"}
                onChange={() => setForm({ ...form, type: "Work" })}
              />
              <span>Work</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={saveAddress}
            className="bg-green-600 text-white flex-1 py-3 rounded font-semibold hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="border border-gray-300 flex-1 py-3 rounded font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PanPanel() {
  const [pan, setPan] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [agree, setAgree] = useState(false);

  const uploadPan = () => {
    if (!pan || !name || !file || !agree) {
      alert("Please complete all PAN details");
      return;
    }
    alert("PAN submitted successfully!");
  };

  return (
    <div className="bg-white p-6 shadow rounded min-h-[calc(100vh-150px)]">

      <h2 className="text-xl font-semibold mb-6">PAN Card Information</h2>

      <div className="space-y-5">
        <input
          className="w-full border p-3 rounded"
          placeholder="PAN Card Number"
          value={pan}
          onChange={e => setPan(e.target.value.toUpperCase())}
          maxLength={10}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Upload PAN Card (Only JPEG file is allowed)
          </p>

          <label className="inline-flex items-center gap-4 cursor-pointer">
            <div className="px-4 py-2 border border-gray-400 rounded bg-gray-100 text-sm font-medium hover:bg-gray-200">
              Choose File
            </div>

            <span className="text-sm text-gray-500">
              {file ? file.name : "No file chosen"}
            </span>

            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        <label className="flex gap-3 text-sm items-start mt-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className=""
          />
          <span>I do hereby declare that PAN furnished/stated above is correct and belongs to me, registered as an account holder with hunar-bazaar-theta.vercel.app. I further declare that I shall solely be held responsible for the consequences, in case of any false PAN declaration.</span>
        </label>

        <button
          onClick={uploadPan}
          className="bg-green-600 text-white px-10 py-2.5 rounded font-semibold hover:bg-green-700"
        >
          UPLOAD
        </button>
      </div>
    </div>
  );
}