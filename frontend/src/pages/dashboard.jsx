import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AppLoader from "../components/AppLoader";
import Notification from "../components/Notification";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/dashboard.css";

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
        return null;
    }
};

function Dashboard() {
    const navigate = useNavigate();
    const addLeadModalRef = useRef(null);
    const [profileUser] = useState(getStoredUser);
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [processingLabel, setProcessingLabel] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: "", tone: "info" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const showNotification = useCallback((message, tone = "info") => {
        setNotification({ visible: true, message, tone });
    }, []);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const [leadStats, setLeadStats] = useState({
        total: 0,
        new: 0,
        contacted: 0,
        converted: 0,
        lost: 0,
    });
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("dashboard-theme") || "light";
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        assignedTo: "",
    });

    const statusOptions = ["new", "contacted", "converted", "lost"];
    const filterOptions = [
        { label: "All Status", value: "" },
        ...statusOptions.map((status) => ({
            label: status.charAt(0).toUpperCase() + status.slice(1),
            value: status,
        })),
    ];

    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const selectedFilterLabel =
        filterOptions.find((option) => option.value === statusFilter)?.label ||
        "All Status";
    const profileName =
        profileUser?.name || profileUser?.email?.split("@")[0] || "CRM User";
    const profileEmail = profileUser?.email || "Signed in";
    const profileInitial = profileName.trim().charAt(0).toUpperCase() || "U";
    const loaderLabel = processingLabel || (isLoading ? "Loading leads..." : "");
    const closeSidebar = () => setIsSidebarOpen(false);
    const closeAddLeadModal = () => {
        const modalElement = addLeadModalRef.current;
        const Modal = window.bootstrap?.Modal;

        if (modalElement && Modal) {
            Modal.getOrCreateInstance(modalElement).hide();
        }
    };
    const handleUnauthorized = useCallback((error) => {
        if (error.response?.status !== 401) {
            return false;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showNotification("Please log in again", "danger");
        navigate("/", { replace: true });
        return true;
    }, [navigate, showNotification]);

    const fetchLeads = useCallback(async (page = 1, filters = {}) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const searchText = String(filters.search || "").trim();
            const selectedStatus = String(filters.statusFilter || "").trim();
            const queryParams = new URLSearchParams();

            queryParams.set("page", page);

            if (searchText) {
                queryParams.set("search", searchText);
            }

            if (selectedStatus) {
                queryParams.set("status", selectedStatus);
            }

            const response = await API.get(`/leads?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeads(response.data.leads || []);
            setCurrentPage(response.data.currentPage || page);
            setTotalPages(Math.max(response.data.totalPages || 1, 1));
            setTotalLeads(response.data.totalLeads || 0);
            setLeadStats((currentStats) => ({
                ...currentStats,
                ...(response.data.stats || {}),
            }));
        } catch (error) {
            console.log(error);
            if (!handleUnauthorized(error)) {
                showNotification("Failed to fetch leads", "danger");
            }
        } finally {
            setIsLoading(false);
        }
    }, [handleUnauthorized, showNotification]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const getLeadFilters = () => ({
        search: search.trim(),
        statusFilter,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessingLabel("Adding lead...");

        try {
            const token = localStorage.getItem("token");

            await API.post("/leads", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setFormData({
                name: "",
                email: "",
                phone: "",
                assignedTo: "",
            });

            if (currentPage === 1) {
                await fetchLeads(1, getLeadFilters());
            } else {
                setCurrentPage(1);
            }

            closeAddLeadModal();
            showNotification("Lead added", "success");
        } catch (error) {
            console.log(error);
            if (!handleUnauthorized(error)) {
                showNotification(error.response?.data?.message || "Failed to add lead", "danger");
            }
        } finally {
            setProcessingLabel("");
        }
    };

    const handleStatusChange = async (leadId, newStatus) => {
        setOpenStatusDropdown(null);
        setProcessingLabel("Updating status...");

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

            await fetchLeads(currentPage, getLeadFilters());
        } catch (error) {
            console.log(error);
            if (!handleUnauthorized(error)) {
                showNotification(error.response?.data?.message || "Failed to update status", "danger");
            }
        } finally {
            setProcessingLabel("");
        }
    };

    const toggleStatusDropdown = (event, lead, status) => {
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();
        const menuHeight = 178;
        const spaceBelow = window.innerHeight - rect.bottom;
        const top =
            spaceBelow < menuHeight + 12
                ? Math.max(12, rect.top - menuHeight - 8)
                : rect.bottom + 8;

        setOpenStatusDropdown((currentDropdown) => {
            if (currentDropdown?.leadId === lead._id) {
                return null;
            }

            return {
                currentStatus: status,
                leadId: lead._id,
                leadName: lead.name || "lead",
                left: rect.left,
                top,
                width: rect.width,
            };
        });
    };

    const handleDeleteLead = async (leadId) => {
        setPendingDeleteId(leadId);
        setConfirmOpen(true);
    };

    const performDelete = async (leadId) => {
        setProcessingLabel("Deleting lead...");

        try {
            const token = localStorage.getItem("token");

            await API.delete(`/leads/${leadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            showNotification("Lead deleted", "success");

            const nextPage =
                leads.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            if (nextPage === currentPage) {
                await fetchLeads(nextPage, getLeadFilters());
            } else {
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.log(error);
            if (!handleUnauthorized(error)) {
                showNotification(error.response?.data?.message || "Failed to delete lead", "danger");
            }
        } finally {
            setProcessingLabel("");
            setPendingDeleteId(null);
        }
    };

    const confirmDelete = () => {
        setConfirmOpen(false);
        if (pendingDeleteId) performDelete(pendingDeleteId);
    };

    const cancelDelete = () => {
        setConfirmOpen(false);
        setPendingDeleteId(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
    };

    const toggleTheme = () => {
        setTheme((currentTheme) => {
            const nextTheme = currentTheme === "dark" ? "light" : "dark";
            localStorage.setItem("dashboard-theme", nextTheme);
            return nextTheme;
        });
    };

    const handlePageChange = (page) => {
        const nextPage = Math.min(Math.max(page, 1), totalPages);

        if (nextPage !== currentPage) {
            setCurrentPage(nextPage);
            setOpenStatusDropdown(null);
            setIsFilterDropdownOpen(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setOpenStatusDropdown(null);

        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    };

    const handleStatusFilterChange = (nextStatus) => {
        setStatusFilter(nextStatus);
        setCurrentPage(1);
        setIsFilterDropdownOpen(false);
        setOpenStatusDropdown(null);
    };

    const leadSummary = `${leads.length} records on page ${currentPage} of ${totalPages}`;

    const statCards = [
        {
            label: "Total Leads",
            value: leadStats.total,
            detail: "All records",
            tone: "blue",
            icon: "bi-people-fill",
        },
        {
            label: "New",
            value: leadStats.new,
            detail: "Fresh pipeline",
            tone: "violet",
            icon: "bi-stars",
        },
        {
            label: "Contacted",
            value: leadStats.contacted,
            detail: "In conversation",
            tone: "teal",
            icon: "bi-chat-dots-fill",
        },
        {
            label: "Converted",
            value: leadStats.converted,
            detail: "Won customers",
            tone: "green",
            icon: "bi-trophy-fill",
        },
    ];

    useEffect(() => {
        queueMicrotask(() => {
            fetchLeads(currentPage, {
                search: search.trim(),
                statusFilter,
            });
        });
    }, [currentPage, fetchLeads, search, statusFilter]);

    useEffect(() => {
        document.body.classList.toggle("dashboard-navigation-open", isSidebarOpen);

        return () => {
            document.body.classList.remove("dashboard-navigation-open");
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const closeDropdowns = () => {
            setOpenStatusDropdown(null);
            setIsFilterDropdownOpen(false);
        };

        document.addEventListener("click", closeDropdowns);
        window.addEventListener("resize", closeDropdowns);
        window.addEventListener("scroll", closeDropdowns, true);

        return () => {
            document.removeEventListener("click", closeDropdowns);
            window.removeEventListener("resize", closeDropdowns);
            window.removeEventListener("scroll", closeDropdowns, true);
        };
    }, []);

    useEffect(() => {
        const closeNavigation = (event) => {
            if (event.key === "Escape") {
                setIsSidebarOpen(false);
            }
        };

        const closeNavigationOnDesktop = () => {
            if (window.innerWidth > 820) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener("keydown", closeNavigation);
        window.addEventListener("resize", closeNavigationOnDesktop);

        return () => {
            document.removeEventListener("keydown", closeNavigation);
            window.removeEventListener("resize", closeNavigationOnDesktop);
        };
    }, []);

    return (
        <main className="dashboard-page" data-theme={theme}>
            <AppLoader show={Boolean(loaderLabel)} label={loaderLabel} />

            {isSidebarOpen && (
                <button
                    type="button"
                    className="dashboard-sidebar-backdrop"
                    onClick={closeSidebar}
                    aria-label="Close navigation"
                ></button>
            )}

            <aside
                className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""}`}
                aria-label="Primary navigation"
                id="dashboard-sidebar"
            >
                <div className="dashboard-sidebar-top">
                    <div className="dashboard-brand">
                        <span className="dashboard-brand-mark">
                            <i className="bi bi-kanban-fill" aria-hidden="true"></i>
                        </span>
                        <div>
                            <strong>Mini CRM</strong>
                            <span>Lead workspace</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="dashboard-sidebar-close"
                        onClick={closeSidebar}
                        aria-label="Close navigation"
                    >
                        <i className="bi bi-x-lg" aria-hidden="true"></i>
                    </button>
                </div>

                <nav className="dashboard-nav">
                    <button
                        type="button"
                        className="dashboard-nav-item is-active"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-grid-1x2-fill" aria-hidden="true"></i>
                        <span>Dashboard</span>
                    </button>
                    <button
                        type="button"
                        className="dashboard-nav-item"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-person-lines-fill" aria-hidden="true"></i>
                        <span>Leads</span>
                    </button>
                    <button
                        type="button"
                        className="dashboard-nav-item"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-bar-chart-fill" aria-hidden="true"></i>
                        <span>Reports</span>
                    </button>
                    <button
                        type="button"
                        className="dashboard-nav-item"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-gear-fill" aria-hidden="true"></i>
                        <span>Settings</span>
                    </button>
                </nav>

                <div className="dashboard-sidebar-footer">
                    <div className="dashboard-profile">
                        <div className="dashboard-profile-avatar" aria-hidden="true">
                            {profileUser?.picture ? (
                                <img src={profileUser.picture} alt="" />
                            ) : (
                                <span>{profileInitial}</span>
                            )}
                        </div>

                        <div className="dashboard-profile-copy">
                            <strong>{profileName}</strong>
                            <span>{profileEmail}</span>
                        </div>
                    </div>

                    <button type="button" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <section className="dashboard-content">
                <header className="dashboard-header">
                    <div className="dashboard-header-title">
                        <button
                            type="button"
                            className="dashboard-menu-button"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-controls="dashboard-sidebar"
                            aria-expanded={isSidebarOpen}
                            aria-label="Open navigation"
                        >
                            <i className="bi bi-list" aria-hidden="true"></i>
                        </button>

                        <div>
                            <p>Overview</p>
                            <h1>Dashboard</h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="dashboard-theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                    >
                        <i
                            className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill"
                                }`}
                            aria-hidden="true"
                        ></i>
                    </button>
                </header>

                <section className="dashboard-stats" aria-label="Lead statistics">
                    {statCards.map((stat) => (
                        <article
                            className={`dashboard-stat-card dashboard-stat-card--${stat.tone}`}
                            key={stat.label}
                        >
                            <div className="dashboard-stat-top">
                                <span>{stat.label}</span>
                                <i className={`bi ${stat.icon}`} aria-hidden="true"></i>
                            </div>
                            <strong>{stat.value}</strong>
                            <p>{stat.detail}</p>
                        </article>
                    ))}
                </section>

                <section className="dashboard-toolbar" aria-label="Lead filters">
                    <div className="dashboard-search">
                        <i className="bi bi-search" aria-hidden="true"></i>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Search by name, email, or phone"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div
                        className="dashboard-filter-dropdown"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="dashboard-filter-trigger"
                            onClick={() =>
                                setIsFilterDropdownOpen((isOpen) => {
                                    setOpenStatusDropdown(null);
                                    return !isOpen;
                                })
                            }
                            aria-expanded={isFilterDropdownOpen}
                            aria-label="Filter leads by status"
                        >
                            <span>{selectedFilterLabel}</span>
                            <i className="bi bi-chevron-down" aria-hidden="true"></i>
                        </button>

                        {isFilterDropdownOpen && (
                            <div
                                className="dashboard-filter-menu"
                                role="listbox"
                                aria-label="Filter status options"
                            >
                                {filterOptions.map((option) => (
                                    <button
                                        type="button"
                                        className={`dashboard-filter-option ${option.value === statusFilter ? "is-selected" : ""
                                            }`}
                                        key={option.label}
                                        onClick={() => handleStatusFilterChange(option.value)}
                                        role="option"
                                        aria-selected={option.value === statusFilter}
                                    >
                                        <span>{option.label}</span>
                                        {option.value === statusFilter && (
                                            <i className="bi bi-check-lg" aria-hidden="true"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="dashboard-table-card">
                    <div className="dashboard-table-header">
                        <div>
                            <h2>All Leads</h2>
                            <p>{leadSummary}</p>
                        </div>

                        <button
                            type="button"
                            className="dashboard-add-button"
                            data-bs-toggle="modal"
                            data-bs-target="#add-lead-modal"
                        >
                            <i className="bi bi-plus-lg" aria-hidden="true"></i>
                            <span>Add Lead</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="dashboard-empty-state">Loading leads...</div>
                    ) : leads.length === 0 ? (
                        <div className="dashboard-empty-state">No leads found</div>
                    ) : (
                        <div className="dashboard-table-wrap">
                            <table>
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
                                    {leads.map((lead) => {
                                        const status = (lead.status || "new").toLowerCase();

                                        return (
                                            <tr key={lead._id}>
                                                <td>
                                                    <div className="dashboard-lead-name">
                                                        <span>{lead.name?.charAt(0) || "L"}</span>
                                                        <strong>{lead.name}</strong>
                                                    </div>
                                                </td>
                                                <td>{lead.email}</td>
                                                <td>{lead.phone}</td>
                                                <td>
                                                    <div className="dashboard-status-dropdown">
                                                        <button
                                                            type="button"
                                                            className="dashboard-status-trigger"
                                                            onClick={(event) =>
                                                                toggleStatusDropdown(event, lead, status)
                                                            }
                                                            aria-expanded={
                                                                openStatusDropdown?.leadId === lead._id
                                                            }
                                                            aria-label={`Update ${lead.name || "lead"} status`}
                                                        >
                                                            <span>{formatStatus(status)}</span>
                                                            <i className="bi bi-chevron-down" aria-hidden="true"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{lead.assignedTo}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="dashboard-delete-button"
                                                        onClick={() => handleDeleteLead(lead._id)}
                                                    >
                                                        <i className="bi bi-trash3-fill" aria-hidden="true"></i>
                                                        <span>Delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="dashboard-pagination">
                            <p>
                                Showing page {currentPage} of {totalPages} - {totalLeads} total
                                leads
                            </p>

                            <nav aria-label="Leads pagination">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <i className="bi bi-chevron-left" aria-hidden="true"></i>
                                    <span>Previous</span>
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                    (page) => (
                                        <button
                                            type="button"
                                            className={page === currentPage ? "is-active" : ""}
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            aria-current={page === currentPage ? "page" : undefined}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span>Next</span>
                                    <i className="bi bi-chevron-right" aria-hidden="true"></i>
                                </button>
                            </nav>
                        </div>
                    )}
                </section>

                {openStatusDropdown && (
                    <div
                        className="dashboard-status-menu"
                        role="listbox"
                        aria-label={`Status options for ${openStatusDropdown.leadName}`}
                        style={{
                            left: `${openStatusDropdown.left}px`,
                            top: `${openStatusDropdown.top}px`,
                            width: `${openStatusDropdown.width}px`,
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {statusOptions.map((option) => (
                            <button
                                type="button"
                                className={`dashboard-status-option ${option === openStatusDropdown.currentStatus
                                        ? "is-selected"
                                        : ""
                                    }`}
                                key={option}
                                onClick={() =>
                                    handleStatusChange(openStatusDropdown.leadId, option)
                                }
                                role="option"
                                aria-selected={option === openStatusDropdown.currentStatus}
                            >
                                <span>{formatStatus(option)}</span>
                                {option === openStatusDropdown.currentStatus && (
                                    <i className="bi bi-check-lg" aria-hidden="true"></i>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div
                    className="modal fade dashboard-bootstrap-modal"
                    id="add-lead-modal"
                    tabIndex="-1"
                    aria-labelledby="add-lead-title"
                    aria-hidden="true"
                    ref={addLeadModalRef}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content dashboard-modal-content">
                            <div className="modal-header dashboard-modal-header">
                                <div>
                                    <h2 className="modal-title" id="add-lead-title">
                                        Add Lead
                                    </h2>
                                    <p>Create a new contact record.</p>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>

                            <form className="dashboard-modal-form" onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <input
                                        className="form-control"
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        className="form-control"
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        className="form-control"
                                        type="text"
                                        name="phone"
                                        placeholder="Phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        className="form-control"
                                        type="text"
                                        name="assignedTo"
                                        placeholder="Assigned To"
                                        value={formData.assignedTo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="modal-footer dashboard-modal-actions">
                                    
                                    <button
                                        type="submit"
                                        className="btn dashboard-add-button"
                                        disabled={Boolean(processingLabel)}
                                    >
                                        <i className="bi bi-plus-lg" aria-hidden="true"></i>
                                        <span>Add Lead</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Notification
                visible={notification.visible}
                message={notification.message}
                tone={notification.tone}
                onClose={() => setNotification({ visible: false, message: "", tone: "info" })}
            />

            <ConfirmationModal
                open={confirmOpen}
                title="Delete lead"
                message="Are you sure you want to delete this lead?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </main>
    );
}

export default Dashboard;
