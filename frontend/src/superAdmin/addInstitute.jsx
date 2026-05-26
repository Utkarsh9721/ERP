import axios from "axios";
import { useState, useEffect } from "react";

const AddInstitute = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState([]);

  // Fetch all admins from backend
  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admins");
      if (res.data.success) setAdmins(res.data.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch admins");
    }
  };

  // Run once on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Add new admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/addInstitute", {
        full_name: fullName,
        email,
        mobile,
      });

      if (res.data.success) {
        setMessage("Institute admin created successfully!");
        setFullName("");
        setEmail("");
        setMobile("");
        fetchAdmins(); // refresh list after adding
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  // Delete an admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/admins/${id}`);
      if (res.data.success) {
        setMessage("Admin deleted successfully");
        fetchAdmins(); // refresh list after deletion
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete admin");
    }
  };

  return (
    <div>
      <h2>Add Institute Admin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Mobile (optional)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <button type="submit">Add Admin</button>
      </form>

      {message && <p>{message}</p>}

      <h2>All Admins</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.full_name}</td>
              <td>{admin.email}</td>
              <td>{admin.mobile || "-"}</td>
              <td>{admin.role}</td>
              <td>
                <button onClick={() => handleDelete(admin.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddInstitute;