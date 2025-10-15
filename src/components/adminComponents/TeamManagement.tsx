import React, { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus
} from "react-icons/fi";
// import { useUserListsMutation } from "../store/apiServices";

const TeamManagement = () => {


  // const [getUserList, { isLoading }] = useUserListsMutation();

  const [allMembers] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data
  // useEffect(() => {
  //   const fetchMembers = async () => {
  //     try {
  //       const res: any = await getUserList({});
  //       if (res?.data?.data) {
  //         const membersArray = Array.isArray(res.data.data)
  //           ? res.data.data
  //           : [res.data.data];
  //         setAllMembers(membersArray);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching members:", error);
  //     }
  //   };
  //   fetchMembers();
  // }, [getUserList]);

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // const currentRows = allMembers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(allMembers.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleAddUser = () =>
    alert("Add user functionality to be implemented!");
  // const handleEdit = (id: string) => alert(`Editing user with ID: ${id}`);
  // const handleDelete = (id: string) =>
  //   setAllMembers(allMembers.filter((member) => member._id !== id));
  const isLoading = true
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full mx-auto flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <button
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Add User
        </button>
      </div>

      {/* Table and Pagination Container */}
      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="overflow-x-auto flex-grow">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-3">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div
              className="mt-4 space-y-4 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {/* {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <CircularProgress />
                </div>
              ) : currentRows.length > 0 ? (
                currentRows.map((member: any) => (
                  <div
                    key={member._id}
                    className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="col-span-3 font-medium text-gray-900">
                      {member.full_name}
                    </div>
                    <div className="col-span-3 text-gray-600">
                      {member.email}
                    </div>
                    <div className="col-span-2 text-gray-600">
                      {member.phone}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${member.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end space-x-4">
                      <button
                        onClick={() => handleEdit(member._id)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-gray-500">
                  No members found.
                </p>
              )} */}
            </div>
          </div>
        </div>

        {/* Pagination - stays at bottom with mt-auto */}
        {allMembers.length > 0 && !isLoading && (
          <div className="flex justify-end items-center pt-6 text-sm text-gray-600 mt-auto">
            <div className="flex items-center space-x-4">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="p-1 rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>10</option>
                <option value={10}>25</option>
                <option value={10}>50</option>
              </select>
            </div>
            <div className="mx-6">
              {indexOfFirstRow + 1}–
              {Math.min(indexOfLastRow, allMembers.length)} of{" "}
              {allMembers.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md disabled:opacity-50 hover:bg-gray-200"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md disabled:opacity-50 hover:bg-gray-200"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
