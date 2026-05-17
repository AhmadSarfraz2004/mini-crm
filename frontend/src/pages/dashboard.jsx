import { useEffect, useState } from "react";
import API from "../api/axios";

function Dashboard() {
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        assignedTo: "",
    });

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get("/leads?page=1", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeads(response.data.leads);
        } catch (error) {
            console.log(error);
            alert("Failed to fetch leads");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            await API.post("/leads", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Lead Added");

            setFormData({
                name: "",
                email: "",
                phone: "",
                assignedTo: "",
            });

            fetchLeads();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to add lead");
        }
    };

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const token = localStorage.getItem("token");

            await API.put(
                `/leads/${leadId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchLeads();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleDeleteLead = async (leadId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this lead?"
        );

        if (!confirmDelete) {
            return;
        }
        try {
            const token = localStorage.getItem("token");

            await API.delete(`/leads/${leadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Lead Deleted");

            fetchLeads();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to delete lead");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const filteredLeads = leads.filter((lead) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            lead.name.toLowerCase().includes(searchText) ||
            lead.email.toLowerCase().includes(searchText) ||
            lead.phone.includes(search);

        const matchesStatus =
            statusFilter === "" || lead.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={handleLogout}>Logout</button>

            <br />
            <br />

            <input
                type="text"
                placeholder="Search by name, email, phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
            </select>

            <hr />

            <h2>Add Lead</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <br />
                <br />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <br />
                <br />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <br />
                <br />

                <input
                    type="text"
                    name="assignedTo"
                    placeholder="Assigned To"
                    value={formData.assignedTo}
                    onChange={handleChange}
                />

                <br />
                <br />

                <button type="submit">Add Lead</button>
            </form>

            <hr />

            <h2>Leads List</h2>

            {filteredLeads.length === 0 ? (
                <p>No leads found</p>
            ) : (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredLeads.map((lead) => (
                            <tr key={lead._id}>
                                <td>{lead.name}</td>
                                <td>{lead.email}</td>
                                <td>{lead.phone}</td>
                                <td>
                                    <select
                                        value={lead.status}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                lead._id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">
                                            Contacted
                                        </option>
                                        <option value="converted">
                                            Converted
                                        </option>
                                    </select>
                                </td>
                                <td>{lead.assignedTo}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleDeleteLead(lead._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Dashboard;