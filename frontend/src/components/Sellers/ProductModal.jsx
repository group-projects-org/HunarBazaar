import { useState, useRef } from 'react';
import { X, Upload, Save, PlusCircle } from 'lucide-react';

const ProductModal = ({ show, onClose, newProduct, setNewProduct, onSave, categories, isEditing = false }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newImageURL, setNewImageURL] = useState("");
  const fileInputRef = useRef(null);
  if (!show) return null;

  const handleAddImageLink = () => {
    if (!newImageURL.trim()) return;
    setNewProduct((prev) => ({ ...prev, image_links: [...(prev.image_links || []), newImageURL.trim()],}));
    setNewImageURL("");
  };

  const handleRemoveImageLink = (index) => {
    setNewProduct((prev) => {
      const updatedLinks = [...(prev.image_links || [])];
      updatedLinks.splice(index, 1);
      return { ...prev, image_links: updatedLinks };
    });
  };
  const handleRemoveImage = (index) => {
    setNewProduct((prev) => {
      const updatedImages = [...(prev.images || [])];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
  };
  
  const handleAddVariant = () => {
    if (!selectedSize || !newColor || !newStock) return;
    setNewProduct(prev => {
      const updatedVariants = [...prev.variants];
      const existingSize = updatedVariants.find(v => v.size === selectedSize);
      if (existingSize) {
        existingSize.options[newColor] = parseInt(newStock);
      } else { updatedVariants.push({
          size: selectedSize,
          options: { [newColor]: parseInt(newStock) }
        }); } return { ...prev, variants: updatedVariants };
    });setNewColor('');
    setNewStock('');
  };
  
  const handleRemoveVariant = (size, color) => {
    setNewProduct(prev => {
      const updatedVariants = prev.variants
        .map(variant => {
          if (variant.size === size) {
            const updatedOptions = { ...variant.options };
            delete updatedOptions[color];
            return { ...variant, options: updatedOptions };
          } return variant;
        }).filter(variant => Object.keys(variant.options).length > 0);
      return { ...prev, variants: updatedVariants }; });
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setNewProduct(prev => ({ ...prev, images: [...(prev.images || []), ...fileArray] }));
  };

  return (
    <div className="fixed w-screen md:w-auto inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-1000 p-4">
      <div className="bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0,25)] max-w-5xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden py-6 px-8.5">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl text-gray-900 mb-2" style={{fontFamily: "Montserrat, Poppins, sans-serif"}}>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <button onClick={onClose} className="border border-[#D1D5DB] rounded-lg bg-white text-[#374151] cursor-pointer text-3.5"><X style={{ height: '24px', width: '24px' }} /></button>
        </div>

        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">

          <div className="flex flex-col gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pl-0.5 pb-0.5">Product Name*</label>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="border border-[#D1D5DB] rounded-lg text-3.5 outline-none py-2 px-3" placeholder="Enter product name" />
              </div>
              <div className="flex flex-col">
                <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pl-0.5 pb-0.5">Category*</label>
                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value, subcategory: ''})} className="border border-[#D1D5DB] rounded-lg text-3.5 outline-none bg-white" style={{padding: "10px 12px"}}>
                  <option value="">Select Category</option>{Object.values(categories).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-4.5 font-medium text-[#374151]" style={{ padding: "0 0 2px 2px"}}>Description</label>
              <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="border border-[#D1D5DB] rounded-lg text-3.5 outline-none min-h-[100px] resize-y" style={{padding: "8px 12px"}} placeholder="Enter product description"/>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-4.5 font-medium text-[#374151] pl-1"> Product Images </label>
              <div className={`w-full flex flex-col border-2 border-dashed rounded-lg text-center cursor-pointer transition-[border-color] duration-200 p-6 ${newProduct.images?.length >= 5 ? "border-gray-400 cursor-not-allowed" : "border-[#D1D5DB] hover:border-[#9CA3AF] items-center justify-center"}`} style={{margin: "2px", padding:"10px"}} onClick={() =>
                  newProduct.images?.length < 5 && fileInputRef.current.click()
              } disabled={newProduct.images?.length + newProduct.image_links?.length < 5}
              > <Upload className="h-12 w-12 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-base text-[#6B7280] mb-1"> {newProduct.images?.length >= 5? "Maximum Photos Uploaded": "Click to upload images"} </p>
                <p className="text-sm text-[#9CA3AF]">PNG, JPG, GIF up to 10MB</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={newProduct.images?.length + newProduct.image_links?.length >= 5} />
              </div>
            </div>
            {newProduct.images?.length + newProduct.image_links?.length >= 5&& (<p style={{ color: "red", fontSize: "12px" }}> Maximum Image Uploads Reached</p>)}

            <div className="flex flex-wrap gap-3 mt-3">
            {newProduct.images && newProduct.images.map((file, idx) => (
              <div key={idx} className="relative">
                <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="w-20 h-20 object-cover rounded-md border border-gray-300 shadow-sm hover:scale-105 transition-transform duration-200" />
                <button onClick={() => handleRemoveImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition" > ✕ </button>
              </div>
              ))}
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-4.5 font-medium text-[#374151] pl-1"> Product Image URLs </label>
              <div className="flex gap-3 w-full" style={{margin: "5px 0 10px 0"}} >
                <input type="text" value={newImageURL} onChange={(e) => setNewImageURL(e.target.value)} placeholder="Paste image URL (Cloudinary, etc.)" className="border border-[#D1D5DB] rounded-lg text-sm outline-none flex-1 focus:border-green-400 transition-[border-color] duration-200 py-[5px] px-2.5" />
                <button type="button" onClick={handleAddImageLink} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 hover:scale-105 py-[5px] px-2" disabled={newProduct.images?.length + newProduct.image_links?.length >= 5}> <PlusCircle size={18} /> Add </button>
              </div>

              {newProduct.images?.length + newProduct.image_links?.length >= 5&& (<p style={{ color: "red", fontSize: "12px" }}> Maximum Image Uploads Reached</p>)}

              {newProduct.image_links && newProduct.image_links.length > 0 && (
                <div className="flex flex-wrap gap-3" style={{marginTop: "10px"}}>
                  {newProduct.image_links.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`image-link-${idx}`} className="w-20 h-20 object-cover rounded-md border border-gray-300 shadow-sm hover:scale-105 transition-transform duration-200" />
                      <button onClick={() => handleRemoveImageLink(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition" > ✕ </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-5">
            
            <div className="flex flex-col">
              <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pb-0.5 pl-0.5">Price (₹)*</label>
              <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="border border-[#D1D5DB] rounded-lg text-3.5 outline-none px-3 py-2" placeholder="0.00" min="0" step="0.01"/>
            </div>

            <div className="flex flex-col">
              <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pb-0.5 pl-0.5">Size*</label>
              {(() => {
                const isFreeSizeCategory = ["Accessories", "Footwear"].includes(newProduct?.category);
                const sizes = isFreeSizeCategory? ["Free Size"] : ["XS", "S", "M", "L", "XL"];
                return (<div className="flex gap-3">
                {sizes.map(size => (
                  <div key={size} onClick={() => setSelectedSize(size)} className="min-w-10 w-auto rounded-lg font-bold cursor-pointer py-[5px] px-2.5 text-center" style={{backgroundColor: selectedSize === size ? "#4caf50" : "#ddd", color: selectedSize === size ? "#fff" : "#333"}}>{size}</div>
                ))}
                </div>);
              })()}
            </div>
            
            <div className="flex flex-col md:flex-row md:gap-2 justify-between md:items-center">
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pb-0.5 pl-0.5">Colours Available*</label>
                  <div className="flex gap-3 mb-3">
                    <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Color" className="py-2 px-3 border border-[#D1D5DB] rounded-lg text-3.5 outline-none" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pl-0.5 pb-0.5">Stock*</label>
                  <input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="Stock" className="border border-[#D1D5DB] rounded-lg text-3.5 outline-none w-30 py-2 px-3 mb-3"/>
                </div>
              </div>

              <button className="bg-[#3cbf4e] h-10 text-white border-0 rounded-[5px] cursor-pointer text-[1rem] transition-colors duration-300 hover:bg-[#45a049] py-2.5 px-4 font-bold mt-2.5" onClick={handleAddVariant}>Add Varient</button>
            </div>
            
            <div className="flex flex-col">
              <label className="text-4.5 font-medium text-[#374151] pt-0 pr-0 pl-0.5 pb-0.5">Current Inventory*</label>
              <table className="min-w-full border-collapse border border-gray-300 text-center mt-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Size</th>
                    <th className="border p-2">Color</th>
                    <th className="border p-2">Stock</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newProduct.variants.map((variant) =>
                    Object.entries(variant.options).map(([color, stock]) => (
                      <tr key={`${variant.size}-${color}`} className="bg-[#f7f7f7]">
                        <td className="border p-2">{variant.size}</td>
                        <td className="border p-2">{color}</td>
                        <td className="border p-2">{stock}</td>
                        <td className="border p-2"><button onClick={() => handleRemoveVariant(variant.size, color)} className="text-red text-xl cursor-pointer bg-none border-0">✕</button></td>
                      </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-0" style={{marginTop: "32px", paddingTop: "24px"}}>
          <button onClick={onClose} className="border border-[#D1D5DB] rounded-lg bg-white text-[#374151] cursor-pointer text-3.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)]" style={{padding: "8px 24px"}}> Cancel </button>
          <button onClick={onSave} className="bg-[#10B981] text-white rounded-lg border-0 cursor-pointer flex items-center justify-center gap-2 text-3.5 transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_10px_rgba(0,0,0,0.15)]" style={{padding: "8px 24px"}}>
            <Save style={{ height: '16px', width: '16px' }} />
            <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;