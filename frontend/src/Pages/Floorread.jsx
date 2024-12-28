import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const Floorread = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorData, setFloorData] = useState({
    number: "",
    available: "yes",
    limit: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [viewFloor, setViewFloor] = useState(null);

  // Fetch floors from the backend
  const fetchFloors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/floor/");
      setFloors(response.data);
      setLoading(false);

      // Set next floor number for the add modal
      const lastFloor = response.data[response.data.length - 1];
      setFloorData((prevData) => ({
        ...prevData,
        number: lastFloor ? lastFloor.number + 1 : 1, // If no floors exist, start from 1
      }));
    } catch (error) {
      console.error("Error fetching floors:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFloorData({ ...floorData, [name]: value });
  };

  const addFloor = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/floor/create", floorData);
      toast.success("Floor added successfully!");
      fetchFloors(); // Refetch floors
      setIsModalOpen(false); // Close modal
    } catch (error) {
      console.error("Error creating floor:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred.";
      toast.error(errorMessage);
    }
  };

  const updateFloor = async (e) => {
    e.preventDefault();
    try {
      const { _id, available, limit } = floorData; // Extract only the fields to update
      const updateData = { available, limit }; // Prepare the update payload

      const response = await axios.put(
        `http://localhost:5000/api/floor/update/${_id}`,
        updateData
      );

      toast.success("Floor updated successfully!");
      fetchFloors(); // Refetch updated floors list
      setFloorData({ number: "", available: "yes", limit: "" }); // Reset form fields
      setIsModalOpen(false); // Close modal
    } catch (error) {
      console.error("Error updating floor:", error);
      toast.error("An error occurred while updating the floor.");
    }
  };


  const handleDelete = async (floorId) => {
    const floorToDelete = floors.find((floor) => floor._id === floorId);

    if (!floorToDelete) {
      toast.error("Floor not found!");
      return;
    }

    // Check if the floor to be deleted is the last one
    const isLastFloor =
      floorToDelete.number === Math.max(...floors.map((floor) => floor.number));

    if (!isLastFloor) {
      toast.error("Only the last floor can be deleted!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this floor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/floor/delete/${floorId}`);
        toast.success("Floor deleted successfully!");
        setFloors(floors.filter((floor) => floor._id !== floorId));
      } catch (error) {
        console.error("Error deleting floor:", error);
        toast.error("An error occurred while deleting the floor.");
      }
    }
  };


  const openModal = (floor = null) => {
    if (floor) {
      setIsUpdate(true);
      setFloorData(floor);
    } else {
      setIsUpdate(false);
      setFloorData((prevData) => ({
        number: floors.length > 0 ? floors[floors.length - 1].number + 1 : 1,
        available: "yes",
        limit: "",
      }));
    }
    setIsModalOpen(true);
  };

  const openViewModal = (floor) => {
    setViewFloor(floor);
  };

  const closeViewModal = () => {
    setViewFloor(null);
  };

  return (
    <>
      <div className="card mb-3" id="floorsTable">
        <div className="card-header">
          <div className="row flex-between-center">
            <div className="col-4 col-sm-auto d-flex align-items-center pe-0">
              <h5 className="fs-9 mb-0 text-nowrap py-2 py-xl-0">Floors</h5>
            </div>
            <div className="col-8 col-sm-auto ms-auto text-end ps-0">
              <button
                className="btn btn-falcon-default btn-sm"
                type="button"
                onClick={() => openModal()}
              >
                <span className="fas fa-plus" />
                <span className="d-none d-sm-inline-block ms-1">New</span>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs-10 mb-0 overflow-hidden">
              <thead className="bg-200">
                <tr>
                  <th>#</th>
                  <th>Floor No</th>
                  <th>Available</th>
                  <th>Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : floors.length > 0 ? (
                  floors.map((floor, index) => (
                    <tr key={floor._id}>
                      <td>{index + 1}</td>
                      <td>{floor.number}</td>
                      <td>{floor.available}</td>
                      <td>{floor.limit}</td>
                      <td className="py-2 align-middle white-space-nowrap text-end">
                        <div className="dropdown font-sans-serif position-static">
                          <button
                            className="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal"
                            type="button"
                            id="floor-dropdown-0"
                            data-bs-toggle="dropdown"
                            data-boundary="viewport"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span className="fas fa-ellipsis-h fs-10"></span>
                          </button>
                          <div
                            className="dropdown-menu dropdown-menu-end border py-0"
                            aria-labelledby="floor-dropdown-0"
                          >
                            <div className="py-2">
                              <Link
                                className="dropdown-item"
                                href="#"
                                onClick={() => openModal(floor)}
                              >
                                Update
                              </Link>
                              <Link
                                className="dropdown-item"
                                href="#"
                                onClick={() => openViewModal(floor)}
                              >
                                View
                              </Link>
                              <div className="dropdown-divider"></div>
                              <Link
                                className="dropdown-item text-danger"
                                href="#"
                                onClick={() => handleDelete(floor._id)}
                              >
                                Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No floors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isUpdate ? "Update Floor" : "Add New Floor"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={isUpdate ? updateFloor : addFloor}>
                  <div className="mb-3">
                    <label htmlFor="number" className="form-label">
                      Floor No
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="number"
                      name="number"
                      value={floorData.number}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="available" className="form-label">
                      Available
                    </label>
                    <select
                      className="form-control"
                      id="available"
                      name="available"
                      value={floorData.available}
                      onChange={handleChange}
                      required
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="limit" className="form-label">
                      Limit
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="limit"
                      name="limit"
                      value={floorData.limit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {isUpdate ? "Update Floor" : "Add Floor"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewFloor && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Floor Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeViewModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Floor No:</strong> {viewFloor.number}
                </p>
                <p>
                  <strong>Available:</strong> {viewFloor.available}
                </p>
                <p>
                  <strong>Limit:</strong> {viewFloor.limit}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default Floorread;
