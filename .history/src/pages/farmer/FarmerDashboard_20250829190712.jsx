{/* Formulaire Crop - CORRIGÉ POUR CENTRER */}
{showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative mx-auto">
      <button
        onClick={() => {
          setShowForm(false);
          setEditingCrop(null);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
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