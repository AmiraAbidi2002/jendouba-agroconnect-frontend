 
        
        {/* Profile Section */}
        {activeSection === "Profile" && (
          <div className={`${cardClass} profile-section`}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-orange-500">
                Welcome, {profileData.name || user.name}!
              </h1>
              <div className="flex space-x-2">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={handleProfileSave}
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"
                    >
                      <FiSave className="mr-2" /> Save
                    </button>
                    <button
                      onClick={handleProfileCancel}
                      className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleProfileEdit}
                    className="bg-[#1d4c43] text-white px-4 py-2 rounded hover:bg-[#2a5c45] flex items-center"
                  >
                    <FiEdit className="mr-2" /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Status Message */}
            {saveStatus.message && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveStatus.type === "success" 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : saveStatus.type === "error"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                {saveStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/*  Profile Details */}
              <div className="space-y-4">
                {/* User ID */}
                <div>
                  <label className="profile-label flex items-center">
                    <FiUser className="mr-2" /> User ID
                  </label>
                  <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{user.id}</p>
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="profile-label flex items-center">
                    <FiUser className="mr-2" /> Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  ) : (
                    <p className="text-gray-900 bg-[#FEF2F2] p-2 rounded-lg">{profileData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="profile-label flex items-center">
                    <FiMail className="mr-2" /> Email
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg px-4 py-2 border border-[#FEF2F2] bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>

                
              </div>

              {/* Right: Farm Location */}
              {mineFarm && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1d4c43]">My Farm Location</h2>
                  <div className="h-64 w-full border rounded-lg overflow-hidden">
                    <FarmMap 
                      farms={[mineFarm]} 
                      editable={false} 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Coordinates: {mineFarm.lat}, {mineFarm.lng}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crops Section */}
        {activeSection === "Crops" && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {viewMode === "mine" ? "My Crops" : "All Crops"}
              </h1>

              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded ${
                    viewMode === "mine"
                      ? "bg-[#1d4c43] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setViewMode("mine")}
                >
                  My Crops
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    viewMode === "all"
                      ? "bg-[#1d4c43] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setViewMode("all")}
                >
                  All Crops
                </button>
                {viewMode === "mine" && (
                  <button
                    className="bg-[#1d4c43] text-white px-3 py-1 rounded hover:bg-[#2a5c45]"
                    onClick={() => {
                      setEditingCrop(null);
                      setShowForm(true);
                    }}
                  >
                    Add New Crop
                  </button>
                )}
              </div>
            </div>

            {/* List of crops only if the form is not open */}
            {!showForm &&
              (crops.length > 0 ? (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                    <thead className="bg-[#1d4c43] text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Crop ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Farmer ID</th>
                        <th className="py-3 px-4 text-left">Type</th>
                        <th className="py-3 px-4 text-left">Quantity</th>
                        <th className="py-3 px-4 text-left">Price</th>
                        <th className="py-3 px-4 text-left">Harvest Date</th>
                        <th className="py-3 px-4 text-left">Availability</th>
                        <th className="py-3 px-4 text-left">Image</th>
                        {viewMode === "mine" && (
                          <th className="py-3 px-4 text-left">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {crops.map((crop) => (
                        <tr
                          key={crop.crop_id}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{crop.crop_id}</td>
                          <td className="py-3 px-4">{crop.crop_name}</td>
                          <td className="py-3 px-4">{crop.farmer_id}</td>
                          <td className="py-3 px-4">{crop.crop_type}</td>
                          <td className="py-3 px-4">{crop.quantity} kg</td>
                          <td className="py-3 px-4">{crop.price} TND/kg</td>
                          <td className="py-3 px-4">
                            {new Date(crop.harvest_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {crop.availability ? "Available" : "Not available"}
                          </td>
                          <td className="py-3 px-4">
                            {crop.img_url ? (
                              <img
                                src={`http://localhost:8080/api/crops/image/${crop.img_url}`}
                                alt={crop.crop_name}
                                className="w-full max-h-24 h-auto object-cover rounded"
                              />
                            ) : (
                              "No Image"
                            )}
                          </td>
                          
                          {viewMode === "mine" && (
                            <td className="py-3 px-4 flex space-x-2">
                              <button
                                className="text-[#1d4c43] hover:text-[#2a5c45]"
                                onClick={() => handleEdit(crop)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(crop.crop_id)}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No crops available.
                </div>
              ))}

            {/*  Crop Form */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-[#1d4c43] text-white px-3 py-1 rounded  w-full max-w-lg p-6 rounded-lg shadow-lg relative mx-auto my-auto">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCrop(null);
                    }}
                    className="bg-[#1d4c43] text-white px-3 py-1 rounded  w-full max-w-lg p-6 rounded-lg shadow-lg relative mx-auto my-auto"
                  >
                    <FiX size={24} />
                  </button>
                  <CropForm
                    editingCrop={editingCrop}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingCrop(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Section */}
        {activeSection === "Messages" && (
          <div className={cardClass}>
            <MessageList user={user} contacts={buyers} />
          </div>
        )}

        {/* Farm Location Section */}
        {activeSection === "Farm Location" && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              All Farms Location
            </h2>
            <FarmMap farms={farmsToShow} />
          </div>
        )}

        {/* Weather Section */}
        {activeSection === "Weather Forecast" && (
          <div className={cardClass}>
            <WeatherWidget />
          </div>
        )}
      </main>
    </div>
  );
}